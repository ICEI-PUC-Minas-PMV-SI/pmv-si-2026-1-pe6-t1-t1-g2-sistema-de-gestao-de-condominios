using backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Npgsql;
using System.Security.Claims;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class OccurrencesController : ControllerBase
    {
        private readonly IConfiguration _configuration;
        private readonly IWebHostEnvironment _environment;
        private readonly IHttpClientFactory _httpClientFactory;

        public OccurrencesController(IConfiguration configuration, IWebHostEnvironment environment, IHttpClientFactory httpClientFactory)
        {
            _configuration = configuration;
            _environment = environment;
            _httpClientFactory = httpClientFactory;
        }

        // --- LISTAGEM E BUSCA ---

        [Authorize(Roles = "Administrador")]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Occurrence>>> GetAll(CancellationToken ct)
        {
            var (connectionString, error) = GetConnectionString();
            if (error != null) return error;

            try
            {
                await using var connection = new NpgsqlConnection(connectionString);
                await connection.OpenAsync(ct);

                // Query com subquery para trazer a imagem junto
                const string sql = @"
                    SELECT o.*, 
                           (SELECT file_path FROM public.occurrence_images WHERE occurrence_id = o.id LIMIT 1) as file_path 
                    FROM public.occurrences o 
                    ORDER BY o.id DESC;";

                await using var command = new NpgsqlCommand(sql, connection);
                await using var reader = await command.ExecuteReaderAsync(ct);

                var occurrences = new List<Occurrence>();
                while (await reader.ReadAsync(ct))
                {
                    occurrences.Add(MapOccurrence(reader));
                }
                return Ok(occurrences);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Erro ao listar ocorrências: {ex.Message}");
            }
        }

        [Authorize(Roles = "Morador")]
        [HttpGet("meu")]
        public async Task<ActionResult<IEnumerable<Occurrence>>> GetMyOccurrences(CancellationToken ct)
        {
            var userId = GetCurrentUserId();
            if (userId == 0) return Unauthorized("Usuário não autenticado");

            var (connectionString, error) = GetConnectionString();
            if (error != null) return error;

            try
            {
                await using var connection = new NpgsqlConnection(connectionString);
                await connection.OpenAsync(ct);

                const string sql = @"
                    SELECT o.*, 
                           (SELECT file_path FROM public.occurrence_images WHERE occurrence_id = o.id LIMIT 1) as file_path 
                    FROM public.occurrences o 
                    WHERE o.user_id = @u 
                    ORDER BY o.id DESC;";

                await using var command = new NpgsqlCommand(sql, connection);
                command.Parameters.AddWithValue("u", userId);
                await using var reader = await command.ExecuteReaderAsync(ct);

                var occurrences = new List<Occurrence>();
                while (await reader.ReadAsync(ct))
                {
                    occurrences.Add(MapOccurrence(reader));
                }
                return Ok(occurrences);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Erro ao listar minhas ocorrências: {ex.Message}");
            }
        }

        [HttpGet("{id:int}")]
        [Authorize]
        public async Task<ActionResult<Occurrence>> GetById(int id, CancellationToken ct)
        {
            var (connectionString, error) = GetConnectionString();
            if (error != null) return error;

            try
            {
                await using var connection = new NpgsqlConnection(connectionString);
                await connection.OpenAsync(ct);

                const string sql = @"
                    SELECT o.*, 
                           (SELECT file_path FROM public.occurrence_images WHERE occurrence_id = o.id LIMIT 1) as file_path 
                    FROM public.occurrences o 
                    WHERE o.id = @id LIMIT 1;";

                await using var command = new NpgsqlCommand(sql, connection);
                command.Parameters.AddWithValue("id", id);

                await using var reader = await command.ExecuteReaderAsync(ct);
                if (!await reader.ReadAsync(ct)) return NotFound();

                return Ok(MapOccurrence(reader));
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Erro ao buscar ocorrência: {ex.Message}");
            }
        }

        // --- CRIAÇÃO ---

        [Authorize(Roles = "Morador")]
        [HttpPost]
        public async Task<ActionResult<Occurrence>> Create([FromBody] CreateOccurrenceRequest request, CancellationToken ct)
        {
            var userId = GetCurrentUserId();
            if (userId == 0) return Unauthorized("Usuário não autenticado");

            if (string.IsNullOrWhiteSpace(request.Title) || string.IsNullOrWhiteSpace(request.Description))
                return BadRequest("Título e descrição são obrigatórios");

            var (connectionString, error) = GetConnectionString();
            if (error != null) return error;

            try
            {
                await using var connection = new NpgsqlConnection(connectionString);
                await connection.OpenAsync(ct);
                const string sql = @"
                    INSERT INTO public.occurrences (user_id, title, description, status, created_at, updated_at)
                    VALUES (@u, @t, @d, @s::occurrence_status, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                    RETURNING *;";
                await using var command = new NpgsqlCommand(sql, connection);
                command.Parameters.AddWithValue("u", userId);
                command.Parameters.AddWithValue("t", request.Title);
                command.Parameters.AddWithValue("d", request.Description);
                command.Parameters.AddWithValue("s", "Aberto");

                await using var reader = await command.ExecuteReaderAsync(ct);
                await reader.ReadAsync(ct);

                var result = MapOccurrence(reader);
                return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Erro ao criar ocorrência: {ex.Message}");
            }
        }

        // --- EDIÇÃO (COM TRAVAS DE SEGURANÇA) ---

        [Authorize(Roles = "Administrador,Morador")]
        [HttpPut("{id:int}")]
        public async Task<ActionResult<Occurrence>> Update(int id, [FromBody] Occurrence model, CancellationToken ct)
        {
            var userId = GetCurrentUserId();
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
            var (connectionString, error) = GetConnectionString();
            if (error != null) return error;

            try
            {
                await using var connection = new NpgsqlConnection(connectionString);
                await connection.OpenAsync(ct);

                const string checkSql = "SELECT user_id, title, description, status FROM public.occurrences WHERE id = @id";
                await using var checkCmd = new NpgsqlCommand(checkSql, connection);
                checkCmd.Parameters.AddWithValue("id", id);
                await using var readerCheck = await checkCmd.ExecuteReaderAsync(ct);

                if (!await readerCheck.ReadAsync(ct)) return NotFound();
                var dbUserId = readerCheck.GetInt32(0);
                var dbTitle = readerCheck.GetString(1);
                var dbDescription = readerCheck.GetString(2);
                var dbStatus = readerCheck.GetString(3);
                await readerCheck.CloseAsync();

                string finalTitle = model.Title;
                string finalDescription = model.Description;
                string finalStatus = model.Status;

                if (userRole == "Administrador")
                {
                    finalTitle = dbTitle;
                    finalDescription = dbDescription;
                }
                else if (userRole == "Morador")
                {
                    if (dbUserId != userId) return Forbid();
                    finalStatus = dbStatus;
                }

                const string sql = @"
                    UPDATE public.occurrences 
                    SET title = @t, description = @d, status = @s::occurrence_status, updated_at = CURRENT_TIMESTAMP
                    WHERE id = @id
                    RETURNING *, (SELECT file_path FROM public.occurrence_images WHERE occurrence_id = @id LIMIT 1) as file_path;";

                await using var command = new NpgsqlCommand(sql, connection);
                command.Parameters.AddWithValue("id", id);
                command.Parameters.AddWithValue("t", finalTitle);
                command.Parameters.AddWithValue("d", finalDescription);
                command.Parameters.AddWithValue("s", finalStatus ?? dbStatus);

                await using var reader = await command.ExecuteReaderAsync(ct);
                if (!await reader.ReadAsync(ct)) return NotFound();

                return Ok(MapOccurrence(reader));
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Erro ao atualizar: {ex.Message}");
            }
        }

        // --- EXCLUSÃO ---

        [Authorize(Roles = "Administrador,Morador")]
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id, CancellationToken ct)
        {
            var userId = GetCurrentUserId();
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
            var (connectionString, error) = GetConnectionString();
            if (error != null) return error;

            try
            {
                await using var connection = new NpgsqlConnection(connectionString);
                await connection.OpenAsync(ct);

                const string checkSql = "SELECT user_id FROM public.occurrences WHERE id = @id";
                await using var checkCmd = new NpgsqlCommand(checkSql, connection);
                checkCmd.Parameters.AddWithValue("id", id);
                var ownerId = await checkCmd.ExecuteScalarAsync(ct);

                if (ownerId == null) return NotFound();
                if (userRole == "Morador" && (int)ownerId != userId) return Forbid();

                const string sqlImages = "DELETE FROM public.occurrence_images WHERE occurrence_id = @id;";
                await using var cmdImages = new NpgsqlCommand(sqlImages, connection);
                cmdImages.Parameters.AddWithValue("id", id);
                await cmdImages.ExecuteNonQueryAsync(ct);

                const string sqlOcc = "DELETE FROM public.occurrences WHERE id = @id RETURNING id;";
                await using var command = new NpgsqlCommand(sqlOcc, connection);
                command.Parameters.AddWithValue("id", id);

                if (await command.ExecuteScalarAsync(ct) == null) return NotFound();

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Erro ao deletar: {ex.Message}");
            }
        }

        // --- UPLOAD DE IMAGENS ---

        [Authorize(Roles = "Morador")]
        [HttpPost("{id:int}/images")]
        public async Task<ActionResult<OccurrenceImage>> UploadImage(int id, [FromForm] IFormFile file, CancellationToken ct)
        {
            var userId = GetCurrentUserId();
            var (connectionString, error) = GetConnectionString();
            if (error != null) return error;

            try
            {
                await using var verifyConnection = new NpgsqlConnection(connectionString);
                await verifyConnection.OpenAsync(ct);
                const string verifySql = "SELECT user_id FROM public.occurrences WHERE id = @id LIMIT 1;";
                await using var verifyCommand = new NpgsqlCommand(verifySql, verifyConnection);
                verifyCommand.Parameters.AddWithValue("id", id);
                var occurrenceUserId = await verifyCommand.ExecuteScalarAsync(ct);

                if (occurrenceUserId == null) return NotFound("Ocorrência não encontrada");
                if ((int)occurrenceUserId != userId) return Forbid();

                if (file != null && file.Length > 0) return await ProcessFileUpload(id, file, connectionString, ct);

                return BadRequest("Envie um arquivo válido.");
            }
            catch (Exception ex) { return StatusCode(500, ex.Message); }
        }

        // --- HELPERS ---

        private async Task<ActionResult<OccurrenceImage>> ProcessFileUpload(int id, IFormFile file, string connectionString, CancellationToken ct)
        {
            var allowedTypes = new[] { "image/jpeg", "image/png", "image/gif", "image/webp", "video/mp4", "video/quicktime" };
            if (!allowedTypes.Contains(file.ContentType)) return BadRequest("Tipo não permitido.");
            if (file.Length > 50 * 1024 * 1024) return BadRequest("Máximo 50MB");

            var fileName = $"{id}_{DateTime.UtcNow.Ticks}_{Path.GetFileName(file.FileName)}";
            string filePublicPath;

            var supabaseUrl = Environment.GetEnvironmentVariable("SUPABASE_URL");
            var supabaseKey = Environment.GetEnvironmentVariable("SUPABASE_SERVICE_KEY");

            if (!string.IsNullOrWhiteSpace(supabaseUrl) && !string.IsNullOrWhiteSpace(supabaseKey))
            {
                // Produção: upload para Supabase Storage
                using var memoryStream = new MemoryStream();
                await file.CopyToAsync(memoryStream, ct);
                memoryStream.Position = 0;

                var uploadUrl = $"{supabaseUrl.TrimEnd('/')}/storage/v1/object/occurrence-images/{fileName}";
                var httpClient = _httpClientFactory.CreateClient();
                using var content = new StreamContent(memoryStream);
                content.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue(file.ContentType);

                using var request = new HttpRequestMessage(HttpMethod.Post, uploadUrl);
                request.Headers.Add("Authorization", $"Bearer {supabaseKey}");
                request.Headers.Add("x-upsert", "true");
                request.Content = content;

                var response = await httpClient.SendAsync(request, ct);
                if (!response.IsSuccessStatusCode)
                {
                    var body = await response.Content.ReadAsStringAsync(ct);
                    return StatusCode(500, $"Erro no upload para Supabase Storage: {body}");
                }

                filePublicPath = $"{supabaseUrl.TrimEnd('/')}/storage/v1/object/public/occurrence-images/{fileName}";
            }
            else
            {
                // Desenvolvimento: fallback para disco local
                var uploadsDir = Path.Combine(_environment.ContentRootPath, "uploads", "occurrences");
                Directory.CreateDirectory(uploadsDir);
                var filePath = Path.Combine(uploadsDir, fileName);
                await using (var stream = new FileStream(filePath, FileMode.Create))
                    await file.CopyToAsync(stream, ct);
                filePublicPath = $"/uploads/occurrences/{fileName}";
            }

            await using var connection = new NpgsqlConnection(connectionString);
            await connection.OpenAsync(ct);
            const string sql = @"
                INSERT INTO public.occurrence_images (occurrence_id, file_path, file_name, mime_type, file_size, created_at)
                VALUES (@o, @p, @n, @m, @s, CURRENT_TIMESTAMP)
                RETURNING *;";
            await using var command = new NpgsqlCommand(sql, connection);
            command.Parameters.AddWithValue("o", id);
            command.Parameters.AddWithValue("p", filePublicPath);
            command.Parameters.AddWithValue("n", file.FileName);
            command.Parameters.AddWithValue("m", file.ContentType);
            command.Parameters.AddWithValue("s", (int)file.Length);

            await using var reader = await command.ExecuteReaderAsync(ct);
            await reader.ReadAsync(ct);
            return MapOccurrenceImage(reader);
        }

        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            return int.TryParse(userIdClaim?.Value, out var userId) ? userId : 0;
        }

        private (string ConnectionString, ActionResult? Error) GetConnectionString()
        {
            var s = _configuration.GetConnectionString("DefaultConnection");
            if (string.IsNullOrEmpty(s)) return ("", StatusCode(500, "Configure ConnectionStrings."));
            try
            {
                var b = new NpgsqlConnectionStringBuilder(s) { SslMode = SslMode.Require, TrustServerCertificate = true };
                return (b.ConnectionString, null);
            }
            catch { return (s, null); }
        }

        private static Occurrence MapOccurrence(NpgsqlDataReader r) => new()
        {
            Id = r.GetInt32(r.GetOrdinal("id")),
            UserId = r.IsDBNull(r.GetOrdinal("user_id")) ? null : r.GetInt32(r.GetOrdinal("user_id")),
            Title = r.IsDBNull(r.GetOrdinal("title")) ? null : r.GetString(r.GetOrdinal("title")),
            Description = r.IsDBNull(r.GetOrdinal("description")) ? null : r.GetString(r.GetOrdinal("description")),
            Status = r.IsDBNull(r.GetOrdinal("status")) ? null : r.GetString(r.GetOrdinal("status")),
            CreatedAt = r.IsDBNull(r.GetOrdinal("created_at")) ? null : r.GetDateTime(r.GetOrdinal("created_at")),
            UpdatedAt = r.IsDBNull(r.GetOrdinal("updated_at")) ? null : r.GetDateTime(r.GetOrdinal("updated_at")),
            // AQUI É A CHAVE DO SUCESSO:
            ImageUrl = r.HasColumn("file_path") && !r.IsDBNull(r.GetOrdinal("file_path"))
                       ? r.GetString(r.GetOrdinal("file_path"))
                       : null
        };

        private static OccurrenceImage MapOccurrenceImage(NpgsqlDataReader r) => new()
        {
            Id = r.GetInt32(r.GetOrdinal("id")),
            OccurrenceId = r.GetInt32(r.GetOrdinal("occurrence_id")),
            FilePath = r.IsDBNull(r.GetOrdinal("file_path")) ? null : r.GetString(r.GetOrdinal("file_path")),
            FileName = r.IsDBNull(r.GetOrdinal("file_name")) ? null : r.GetString(r.GetOrdinal("file_name")),
            MimeType = r.IsDBNull(r.GetOrdinal("mime_type")) ? null : r.GetString(r.GetOrdinal("mime_type")),
            FileSize = r.IsDBNull(r.GetOrdinal("file_size")) ? null : r.GetInt32(r.GetOrdinal("file_size")),
            CreatedAt = r.IsDBNull(r.GetOrdinal("created_at")) ? null : r.GetDateTime(r.GetOrdinal("created_at"))
        };
    }

    public static class NpgsqlReaderExtensions
    {
        public static bool HasColumn(this NpgsqlDataReader reader, string columnName)
        {
            for (int i = 0; i < reader.FieldCount; i++)
            {
                if (reader.GetName(i).Equals(columnName, StringComparison.OrdinalIgnoreCase))
                    return true;
            }
            return false;
        }
    }
}