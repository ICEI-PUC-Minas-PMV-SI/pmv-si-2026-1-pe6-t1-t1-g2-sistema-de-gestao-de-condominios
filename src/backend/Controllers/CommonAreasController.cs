using backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Npgsql;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/areas-comuns")]
    public class CommonAreasController : ControllerBase
    {
        private readonly IConfiguration _configuration;

        public CommonAreasController(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        // --- AUXILIARY METHODS ----------------------------------------------------

        private (string ConnectionString, ActionResult? ErrorResult) GetConnectionString()
        {
            var conn = _configuration.GetConnectionString("DefaultConnection");
            if (string.IsNullOrWhiteSpace(conn))
            {
                return (string.Empty,
                    StatusCode(500, "Configure ConnectionStrings:DefaultConnection no appsettings."));
            }
            return (conn, null);
        }

        private static CommonArea MapArea(NpgsqlDataReader reader)
        {
            return new CommonArea
            {
                Id = reader.GetInt32(reader.GetOrdinal("id")),
                Name = reader.GetString(reader.GetOrdinal("name")),
                Capacity = reader.GetInt32(reader.GetOrdinal("capacity")),
                Rules = reader.IsDBNull(reader.GetOrdinal("rules")) ? null : reader.GetString(reader.GetOrdinal("rules")),
                CreatedAt = reader.IsDBNull(reader.GetOrdinal("created_at")) ? null : reader.GetDateTime(reader.GetOrdinal("created_at")),
                UpdatedAt = reader.IsDBNull(reader.GetOrdinal("updated_at")) ? null : reader.GetDateTime(reader.GetOrdinal("updated_at"))
            };
        }

        private static string? Validate(CommonArea body)
        {
            if (string.IsNullOrWhiteSpace(body.Name))
                return "O nome é obrigatório.";

            if (body.Capacity <= 0)
                return "A capacidade deve ser maior que zero.";

            return null;
        }

        private async Task<bool> HasAnyReservation(int areaId, NpgsqlConnection connection, CancellationToken ct)
        {
            const string sql = @"SELECT 1 FROM public.reservas WHERE area_comum_id = @id LIMIT 1;";

            await using var cmd = new NpgsqlCommand(sql, connection);
            cmd.Parameters.AddWithValue("id", areaId);

            var result = await cmd.ExecuteScalarAsync(ct);
            return result != null;
        }

        private async Task<bool> HasFutureReservation(int areaId, NpgsqlConnection connection, CancellationToken ct)
        {
            const string sql = @"
                SELECT 1 
                FROM public.reservas
                WHERE area_comum_id = @id
                  AND data_hora_inicio > NOW()
                LIMIT 1;";

            await using var cmd = new NpgsqlCommand(sql, connection);
            cmd.Parameters.AddWithValue("id", areaId);

            var result = await cmd.ExecuteScalarAsync(ct);
            return result != null;
        }

        // --- CRUD ----------------------------------------------------------------------

        [Authorize(Roles = "Administrador, Morador")]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<CommonArea>>> GetAll(CancellationToken ct)
        {
            var (connString, error) = GetConnectionString();
            if (error != null) return error;

            try
            {
                await using var conn = new NpgsqlConnection(connString);
                await conn.OpenAsync(ct);

                const string sql = @"SELECT * FROM public.common_areas ORDER BY id;";
                await using var cmd = new NpgsqlCommand(sql, conn);

                var reader = await cmd.ExecuteReaderAsync(ct);
                var areas = new List<CommonArea>();

                while (await reader.ReadAsync(ct))
                    areas.Add(MapArea(reader));

                return Ok(areas);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Erro ao consultar áreas comuns: {ex.Message}");
            }
        }

        [Authorize(Roles = "Administrador, Morador")]
        [HttpGet("{id:int}")]
        public async Task<ActionResult<CommonArea>> GetById(int id, CancellationToken ct)
        {
            var (connString, error) = GetConnectionString();
            if (error != null) return error;

            try
            {
                await using var conn = new NpgsqlConnection(connString);
                await conn.OpenAsync(ct);

                const string sql = @"SELECT * FROM public.common_areas WHERE id = @id LIMIT 1;";
                await using var cmd = new NpgsqlCommand(sql, conn);
                cmd.Parameters.AddWithValue("id", id);

                var reader = await cmd.ExecuteReaderAsync(ct);
                if (!await reader.ReadAsync(ct)) return NotFound();

                return Ok(MapArea(reader));
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Erro ao consultar área comum: {ex.Message}");
            }
        }

        [Authorize(Roles = "Administrador")]
        [HttpPost]
        public async Task<ActionResult<CommonArea>> Create([FromBody] CommonArea body, CancellationToken ct)
        {
            var validation = Validate(body);
            if (validation != null)
                return BadRequest(validation);

            var (connString, error) = GetConnectionString();
            if (error != null) return error;

            try
            {
                await using var conn = new NpgsqlConnection(connString);
                await conn.OpenAsync(ct);

                const string sql = @"
                    INSERT INTO public.common_areas (name, capacity, rules)
                    VALUES (@name, @capacity, @rules)
                    RETURNING *;";

                await using var cmd = new NpgsqlCommand(sql, conn);
                cmd.Parameters.AddWithValue("name", body.Name);
                cmd.Parameters.AddWithValue("capacity", body.Capacity);
                cmd.Parameters.AddWithValue("rules", body.Rules ?? (object)DBNull.Value);

                var reader = await cmd.ExecuteReaderAsync(ct);
                await reader.ReadAsync(ct);

                var created = MapArea(reader);

                return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Erro ao criar área comum: {ex.Message}");
            }
        }

        [Authorize(Roles = "Administrador")]
        [HttpPut("{id:int}")]
        public async Task<ActionResult<CommonArea>> Update(int id, [FromBody] CommonArea body, CancellationToken ct)
        {
            var validation = Validate(body);
            if (validation != null)
                return BadRequest(validation);

            var (connString, error) = GetConnectionString();
            if (error != null) return error;

            try
            {
                await using var conn = new NpgsqlConnection(connString);
                await conn.OpenAsync(ct);

                // ❗ Regra: Não permitir edição se houver reserva futura
                if (await HasFutureReservation(id, conn, ct))
                {
                    return BadRequest("Não é possível editar esta área comum pois existe reserva futura associada.");
                }

                const string sql = @"
                    UPDATE public.common_areas
                    SET name = @name,
                        capacity = @capacity,
                        rules = @rules,
                        updated_at = CURRENT_TIMESTAMP
                    WHERE id = @id
                    RETURNING *;";

                await using var cmd = new NpgsqlCommand(sql, conn);
                cmd.Parameters.AddWithValue("id", id);
                cmd.Parameters.AddWithValue("name", body.Name);
                cmd.Parameters.AddWithValue("capacity", body.Capacity);
                cmd.Parameters.AddWithValue("rules", body.Rules ?? (object)DBNull.Value);

                var reader = await cmd.ExecuteReaderAsync(ct);
                if (!await reader.ReadAsync(ct)) return NotFound();

                return Ok(MapArea(reader));
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Erro ao atualizar área comum: {ex.Message}");
            }
        }

        [Authorize(Roles = "Administrador")]
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id, CancellationToken ct)
        {
            var (connString, error) = GetConnectionString();
            if (error != null) return error;

            try
            {
                await using var conn = new NpgsqlConnection(connString);
                await conn.OpenAsync(ct);

                // ❗ Regra: Não pode excluir se houver QUALQUER reserva
                if (await HasAnyReservation(id, conn, ct))
                {
                    return BadRequest("Não é possível excluir esta área comum pois existem reservas vinculadas.");
                }

                const string sql = @"DELETE FROM public.common_areas WHERE id = @id RETURNING id;";

                await using var cmd = new NpgsqlCommand(sql, conn);
                cmd.Parameters.AddWithValue("id", id);

                var deleted = await cmd.ExecuteScalarAsync(ct);
                if (deleted == null) return NotFound();

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Erro ao remover área comum: {ex.Message}");
            }
        }
    }
}
