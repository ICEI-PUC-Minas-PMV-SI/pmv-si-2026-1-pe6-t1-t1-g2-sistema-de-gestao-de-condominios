using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Npgsql;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/reservas")]
    public class ReservasController : ControllerBase
    {
        private readonly NpgsqlDataSource _dataSource;

        public ReservasController(NpgsqlDataSource dataSource)
        {
            _dataSource = dataSource;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ReservaAreaComum>>> GetAll(CancellationToken cancellationToken)
        {
            try
            {
                await using var connection = await _dataSource.OpenConnectionAsync(cancellationToken);
                const string sql = @"
                    SELECT id, common_area_id, user_id, start_time, end_time, status, created_at, updated_at
                    FROM public.reservations
                    ORDER BY id;";

                await using var command = new NpgsqlCommand(sql, connection);
                await using var reader = await command.ExecuteReaderAsync(cancellationToken);
                var list = new List<ReservaAreaComum>();

                while (await reader.ReadAsync(cancellationToken))
                    list.Add(MapReserva(reader));

                return Ok(list);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Erro ao consultar reservas: {ex.Message}");
            }
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<ReservaAreaComum>> GetById(int id, CancellationToken cancellationToken)
        {
            try
            {
                await using var connection = await _dataSource.OpenConnectionAsync(cancellationToken);
                const string sql = @"
                    SELECT id, common_area_id, user_id, start_time, end_time, status, created_at, updated_at
                    FROM public.reservations
                    WHERE id = @id
                    LIMIT 1;";

                await using var command = new NpgsqlCommand(sql, connection);
                command.Parameters.AddWithValue("id", id);

                await using var reader = await command.ExecuteReaderAsync(cancellationToken);
                if (!await reader.ReadAsync(cancellationToken))
                    return NotFound();

                return Ok(MapReserva(reader));
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Erro ao consultar reserva: {ex.Message}");
            }
        }

        [HttpPost]
        public async Task<ActionResult<ReservaAreaComum>> Create([FromBody] ReservaAreaComum requestBody, CancellationToken cancellationToken)
        {
            if (!ModelState.IsValid) return ValidationProblem(ModelState);

            var validationError = ValidateRequest(requestBody);
            if (validationError is not null) return BadRequest(validationError);

            try
            {
                await using var connection = await _dataSource.OpenConnectionAsync(cancellationToken);

                if (await ExistsOverlappingAsync(connection, requestBody.AreaComumId, requestBody.DataHoraInicio, requestBody.DataHoraFim, null, cancellationToken))
                    return Conflict("Já existe reserva ativa neste horário para esta área comum.");

                const string sql = @"
                    INSERT INTO public.reservations (common_area_id, user_id, start_time, end_time, status)
                    VALUES (@common_area_id, @user_id, @start_time, @end_time, @status)
                    RETURNING id, common_area_id, user_id, start_time, end_time, status, created_at, updated_at;";

                await using var command = new NpgsqlCommand(sql, connection);
                command.Parameters.AddWithValue("common_area_id", requestBody.AreaComumId);
                command.Parameters.AddWithValue("user_id", requestBody.MoradorId);
                command.Parameters.AddWithValue("start_time", requestBody.DataHoraInicio);
                command.Parameters.AddWithValue("end_time", requestBody.DataHoraFim);
                command.Parameters.AddWithValue("status", requestBody.Status); // enum mapeado via NpgsqlDataSource

                await using var reader = await command.ExecuteReaderAsync(cancellationToken);
                if (!await reader.ReadAsync(cancellationToken))
                    return StatusCode(502, "Banco retornou resposta vazia.");

                var entity = MapReserva(reader);
                return CreatedAtAction(nameof(GetById), new { id = entity.Id }, entity);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Erro ao criar reserva: {ex.Message}");
            }
        }

        [HttpPut("{id:int}")]
        public async Task<ActionResult<ReservaAreaComum>> Update(int id, [FromBody] ReservaAreaComum requestBody, CancellationToken cancellationToken)
        {
            if (!ModelState.IsValid) return ValidationProblem(ModelState);

            var validationError = ValidateRequest(requestBody);
            if (validationError is not null) return BadRequest(validationError);

            try
            {
                await using var connection = await _dataSource.OpenConnectionAsync(cancellationToken);

                if (await ExistsOverlappingAsync(connection, requestBody.AreaComumId, requestBody.DataHoraInicio, requestBody.DataHoraFim, id, cancellationToken))
                    return Conflict("Já existe reserva ativa neste horário para esta área comum.");

                const string sql = @"
                    UPDATE public.reservations
                    SET common_area_id = @common_area_id,
                        user_id = @user_id,
                        start_time = @start_time,
                        end_time = @end_time,
                        status = @status,
                        updated_at = CURRENT_TIMESTAMP
                    WHERE id = @id
                    RETURNING id, common_area_id, user_id, start_time, end_time, status, created_at, updated_at;";

                await using var command = new NpgsqlCommand(sql, connection);
                command.Parameters.AddWithValue("id", id);
                command.Parameters.AddWithValue("common_area_id", requestBody.AreaComumId);
                command.Parameters.AddWithValue("user_id", requestBody.MoradorId);
                command.Parameters.AddWithValue("start_time", requestBody.DataHoraInicio);
                command.Parameters.AddWithValue("end_time", requestBody.DataHoraFim);
                command.Parameters.AddWithValue("status", requestBody.Status);

                await using var reader = await command.ExecuteReaderAsync(cancellationToken);
                if (!await reader.ReadAsync(cancellationToken))
                    return NotFound();

                return Ok(MapReserva(reader));
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Erro ao atualizar reserva: {ex.Message}");
            }
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
        {
            try
            {
                await using var connection = await _dataSource.OpenConnectionAsync(cancellationToken);
                const string sql = @"
                    DELETE FROM public.reservations
                    WHERE id = @id
                    RETURNING id;";

                await using var command = new NpgsqlCommand(sql, connection);
                command.Parameters.AddWithValue("id", id);

                var deletedId = await command.ExecuteScalarAsync(cancellationToken);
                if (deletedId is null) return NotFound();

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Erro ao remover reserva: {ex.Message}");
            }
        }

        private static async Task<bool> ExistsOverlappingAsync(
            NpgsqlConnection connection,
            int areaComumId,
            DateTime inicio,
            DateTime fim,
            int? excludeId,
            CancellationToken cancellationToken)
        {
            var sql = @"
                SELECT 1 FROM public.reservations
                WHERE common_area_id = @common_area_id
                  AND status NOT IN ('Cancelada', 'Rejeitada')
                  AND start_time < @end_time
                  AND end_time > @start_time";

            if (excludeId.HasValue)
                sql += " AND id <> @exclude_id";

            sql += " LIMIT 1;";

            await using var command = new NpgsqlCommand(sql, connection);
            command.Parameters.AddWithValue("common_area_id", areaComumId);
            command.Parameters.AddWithValue("start_time", inicio);
            command.Parameters.AddWithValue("end_time", fim);
            if (excludeId.HasValue)
                command.Parameters.AddWithValue("exclude_id", excludeId.Value);

            var result = await command.ExecuteScalarAsync(cancellationToken);
            return result is not null;
        }

        private static ReservaAreaComum MapReserva(NpgsqlDataReader reader)
        {
            return new ReservaAreaComum
            {
                Id = reader.GetInt32(reader.GetOrdinal("id")),
                AreaComumId = reader.GetInt32(reader.GetOrdinal("common_area_id")),
                MoradorId = reader.GetInt32(reader.GetOrdinal("user_id")),
                DataHoraInicio = reader.GetDateTime(reader.GetOrdinal("start_time")),
                DataHoraFim = reader.GetDateTime(reader.GetOrdinal("end_time")),
                Status = reader.GetFieldValue<ReservationStatus>(reader.GetOrdinal("status")),
                CreatedAt = reader.IsDBNull(reader.GetOrdinal("created_at")) ? null : reader.GetDateTime(reader.GetOrdinal("created_at")),
                UpdatedAt = reader.IsDBNull(reader.GetOrdinal("updated_at")) ? null : reader.GetDateTime(reader.GetOrdinal("updated_at")),
            };
        }

        private static string? ValidateRequest(ReservaAreaComum requestBody)
        {
            if (requestBody.AreaComumId <= 0) return "AreaComumId deve ser maior que zero.";
            if (requestBody.MoradorId <= 0) return "MoradorId deve ser maior que zero.";
            if (requestBody.DataHoraFim <= requestBody.DataHoraInicio) return "DataHoraFim deve ser maior que DataHoraInicio.";
            return null;
        }
    }
}   