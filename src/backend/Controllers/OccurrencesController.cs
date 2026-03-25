using backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Npgsql;

namespace backend.Controllers
{
    [Authorize(Roles = "Administrador")]
    [ApiController]
    [Route("api/[controller]")]
    public class OccurrencesController : ControllerBase
    {
        private readonly IConfiguration _configuration;

        public OccurrencesController(IConfiguration configuration)
        {
            _configuration = configuration;
        }

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

        [HttpGet("{id:int}")]
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

        [HttpPost]
        public async Task<ActionResult<Occurrence>> Create([FromBody] Occurrence model, CancellationToken ct)
        {
            var (connectionString, error) = GetConnectionString();
            if (error != null) return error;

            try
            {
                await using var connection = new NpgsqlConnection(connectionString);
                await connection.OpenAsync(ct);
                const string sql = @"
                    INSERT INTO public.occurrences (user_id, title, description, status)
                    VALUES (@u, @t, @d, @s::occurrence_status)
                    RETURNING *;";
                await using var command = new NpgsqlCommand(sql, connection);
                command.Parameters.AddWithValue("u", (object?)model.UserId ?? DBNull.Value);
                command.Parameters.AddWithValue("t", (object?)model.Title ?? DBNull.Value);
                command.Parameters.AddWithValue("d", (object?)model.Description ?? DBNull.Value);
                command.Parameters.AddWithValue("s", (object?)model.Status ?? "Open");

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
                    SET user_id = @u, title = @t, description = @d, status = @s::occurrence_status, updated_at = CURRENT_TIMESTAMP
                    WHERE id = @id
                    RETURNING *;";
                await using var command = new NpgsqlCommand(sql, connection);
                command.Parameters.AddWithValue("id", id);
                command.Parameters.AddWithValue("u", (object?)model.UserId ?? DBNull.Value);
                command.Parameters.AddWithValue("t", (object?)model.Title ?? DBNull.Value);
                command.Parameters.AddWithValue("d", (object?)model.Description ?? DBNull.Value);
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

        private (string ConnectionString, ActionResult? Error) GetConnectionString()
        {
            var s = _configuration.GetConnectionString("DefaultConnection");
            if (string.IsNullOrEmpty(s)) return ("", StatusCode(500, "Configure ConnectionStrings:DefaultConnection."));

            // Ensure SSL settings recommended by Supabase
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
    }
}