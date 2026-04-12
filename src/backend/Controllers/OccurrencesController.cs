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

        public OccurrencesController(IConfiguration configuration, IWebHostEnvironment environment)
        {
            _configuration = configuration;
            _environment = environment;
        }

        // ADMINISTRADOR: listar todas as ocorrências
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
                const string sql = "SELECT * FROM public.occurrences ORDER BY id DESC;";
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

        // MORADOR: listar suas próprias ocorrências
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
                const string sql = "SELECT * FROM public.occurrences WHERE user_id = @u ORDER BY id DESC;";
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
                return StatusCode(500, $"Erro ao listar ocorrências: {ex.Message}");
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
                const string sql = "SELECT * FROM public.occurrences WHERE id = @id LIMIT 1;";
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

        // MORADOR: criar ocorrência
        [Authorize(Roles = "Morador")]
        [HttpPost]
        [Consumes("application/json")]
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
                command.Parameters.AddWithValue("s", "Open");

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

        // MORADOR: upload de foto
        [Authorize(Roles = "Morador")]
        [HttpPost("{id:int}/images")]
        [Consumes("multipart/form-data")]
        public async Task<ActionResult<OccurrenceImage>> UploadImage(int id, IFormFile file, CancellationToken ct)
        {
            var userId = GetCurrentUserId();
            if (userId == 0) return Unauthorized("Usuário não autenticado");

            if (file == null || file.Length == 0)
                return BadRequest("Arquivo não foi enviado");

            // Validar tipo de arquivo
            var allowedTypes = new[] { "image/jpeg", "image/png", "image/gif", "image/webp" };
            if (!allowedTypes.Contains(file.ContentType))
                return BadRequest("Tipo de arquivo não permitido. Use: JPEG, PNG, GIF ou WebP");

            // Validar tamanho (máx 5MB)
            if (file.Length > 5 * 1024 * 1024)
                return BadRequest("Arquivo deve ter no máximo 5MB");

            var (connectionString, error) = GetConnectionString();
            if (error != null) return error;

            try
            {
                // Verificar se a ocorrência existe e pertence ao usuário
                await using var verifyConnection = new NpgsqlConnection(connectionString);
                await verifyConnection.OpenAsync(ct);
                const string verifySql = "SELECT user_id FROM public.occurrences WHERE id = @id LIMIT 1;";
                await using var verifyCommand = new NpgsqlCommand(verifySql, verifyConnection);
                verifyCommand.Parameters.AddWithValue("id", id);
                var occurrenceUserId = await verifyCommand.ExecuteScalarAsync(ct);

                if (occurrenceUserId == null)
                    return NotFound("Ocorrência não encontrada");

                if ((int)occurrenceUserId != userId)
                    return Forbid("Você não tem permissão para adicionar imagens a esta ocorrência");

                // Criar diretório se não existir
                var uploadsDir = Path.Combine(_environment.ContentRootPath, "uploads", "occurrences");
                Directory.CreateDirectory(uploadsDir);

                // Gerar nome único para o arquivo
                var fileName = $"{id}_{DateTime.UtcNow.Ticks}_{Path.GetFileName(file.FileName)}";
                var filePath = Path.Combine(uploadsDir, fileName);

                // Salvar arquivo
                await using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream, ct);
                }

                // Inserir registro no banco
                await using var connection = new NpgsqlConnection(connectionString);
                await connection.OpenAsync(ct);
                const string sql = @"
                    INSERT INTO public.occurrence_images (occurrence_id, file_path, file_name, mime_type, file_size, created_at)
                    VALUES (@o, @p, @n, @m, @s, CURRENT_TIMESTAMP)
                    RETURNING *;";
                await using var command = new NpgsqlCommand(sql, connection);
                command.Parameters.AddWithValue("o", id);
                command.Parameters.AddWithValue("p", $"/uploads/occurrences/{fileName}");
                command.Parameters.AddWithValue("n", file.FileName);
                command.Parameters.AddWithValue("m", file.ContentType);
                command.Parameters.AddWithValue("s", (int)file.Length);

                await using var reader = await command.ExecuteReaderAsync(ct);
                await reader.ReadAsync(ct);

                var result = MapOccurrenceImage(reader);
                return CreatedAtAction(nameof(GetImageById), new { id = result.Id }, result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Erro ao fazer upload da imagem: {ex.Message}");
            }
        }

        // Obter imagem
        [HttpGet("{id:int}/images/{imageId:int}")]
        [Authorize]
        public async Task<ActionResult<OccurrenceImage>> GetImageById(int id, int imageId, CancellationToken ct)
        {
            var (connectionString, error) = GetConnectionString();
            if (error != null) return error;

            try
            {
                await using var connection = new NpgsqlConnection(connectionString);
                await connection.OpenAsync(ct);
                const string sql = "SELECT * FROM public.occurrence_images WHERE id = @id AND occurrence_id = @o LIMIT 1;";
                await using var command = new NpgsqlCommand(sql, connection);
                command.Parameters.AddWithValue("id", imageId);
                command.Parameters.AddWithValue("o", id);

                await using var reader = await command.ExecuteReaderAsync(ct);
                if (!await reader.ReadAsync(ct)) return NotFound();

                return Ok(MapOccurrenceImage(reader));
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Erro ao buscar imagem: {ex.Message}");
            }
        }

        // ADMINISTRADOR: atualizar status
        [Authorize(Roles = "Administrador")]
        [HttpPut("{id:int}")]
        public async Task<ActionResult<Occurrence>> Update(int id, [FromBody] Occurrence model, CancellationToken ct)
        {
            var (connectionString, error) = GetConnectionString();
            if (error != null) return error;

            try
            {
                await using var connection = new NpgsqlConnection(connectionString);
                await connection.OpenAsync(ct);
                const string sql = @"
                    UPDATE public.occurrences 
                    SET status = @s::occurrence_status, updated_at = CURRENT_TIMESTAMP
                    WHERE id = @id
                    RETURNING *;";
                await using var command = new NpgsqlCommand(sql, connection);
                command.Parameters.AddWithValue("id", id);
                command.Parameters.AddWithValue("s", (object?)model.Status ?? "Open");

                await using var reader = await command.ExecuteReaderAsync(ct);
                if (!await reader.ReadAsync(ct)) return NotFound();

                return Ok(MapOccurrence(reader));
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Erro ao atualizar ocorrência: {ex.Message}");
            }
        }

        [HttpDelete("{id:int}")]
        [Authorize(Roles = "Administrador")]
        public async Task<IActionResult> Delete(int id, CancellationToken ct)
        {
            var (connectionString, error) = GetConnectionString();
            if (error != null) return error;

            try
            {
                await using var connection = new NpgsqlConnection(connectionString);
                await connection.OpenAsync(ct);
                const string sql = "DELETE FROM public.occurrences WHERE id = @id RETURNING id;";
                await using var command = new NpgsqlCommand(sql, connection);
                command.Parameters.AddWithValue("id", id);

                var deletedId = await command.ExecuteScalarAsync(ct);
                if (deletedId == null) return NotFound();

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Erro ao deletar ocorrência: {ex.Message}");
            }
        }

        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (int.TryParse(userIdClaim?.Value, out var userId))
                return userId;
            return 0;
        }

        private (string ConnectionString, ActionResult? Error) GetConnectionString()
        {
            var s = _configuration.GetConnectionString("DefaultConnection");
            if (string.IsNullOrEmpty(s)) return ("", StatusCode(500, "Configure ConnectionStrings:DefaultConnection."));

            try
            {
                var builder = new NpgsqlConnectionStringBuilder(s)
                {
                    SslMode = SslMode.Require,
                    TrustServerCertificate = true
                };

                return (builder.ConnectionString, null);
            }
            catch
            {
                return (s, null);
            }
        }

        private static Occurrence MapOccurrence(NpgsqlDataReader r) => new()
        {
            Id = r.GetInt32(r.GetOrdinal("id")),
            UserId = r.IsDBNull(r.GetOrdinal("user_id")) ? null : r.GetInt32(r.GetOrdinal("user_id")),
            Title = r.IsDBNull(r.GetOrdinal("title")) ? null : r.GetString(r.GetOrdinal("title")),
            Description = r.IsDBNull(r.GetOrdinal("description")) ? null : r.GetString(r.GetOrdinal("description")),
            Status = r.IsDBNull(r.GetOrdinal("status")) ? null : r.GetString(r.GetOrdinal("status")),
            CreatedAt = r.IsDBNull(r.GetOrdinal("created_at")) ? null : r.GetDateTime(r.GetOrdinal("created_at")),
            UpdatedAt = r.IsDBNull(r.GetOrdinal("updated_at")) ? null : r.GetDateTime(r.GetOrdinal("updated_at"))
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
}