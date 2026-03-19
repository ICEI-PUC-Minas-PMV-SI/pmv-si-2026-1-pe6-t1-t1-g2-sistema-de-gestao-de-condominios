using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Npgsql;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/reservas")]
    public class ReservasController : ControllerBase
    {
        private readonly IConfiguration _configuration;

        private static readonly HashSet<string> AllowedStatus =
            new(StringComparer.OrdinalIgnoreCase) { "Confirmada", "Pendente", "Cancelada" };

        public ReservasController(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ReservaAreaComum>>> GetAll(CancellationToken cancellationToken)
        {
            var (connectionString, errorResult) = GetConnectionString();
            if (errorResult is not null)
            {
                return errorResult;
            }

            try
            {
                await using var connection = new NpgsqlConnection(connectionString);
                await connection.OpenAsync(cancellationToken);

                const string sql = @"
                    SELECT id, area_comum_id, morador_id, data_hora_inicio, data_hora_fim, status, observacao, created_at, updated_at
                    FROM public.reservas
                    ORDER BY id;";

                await using var command = new NpgsqlCommand(sql, connection);
                await using var reader = await command.ExecuteReaderAsync(cancellationToken);

                var reservas = new List<ReservaAreaComum>();
                while (await reader.ReadAsync(cancellationToken))
                {
                    reservas.Add(MapReserva(reader));
                }

                return Ok(reservas);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Erro ao consultar reservas: {ex.Message}");
            }
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<ReservaAreaComum>> GetById(int id, CancellationToken cancellationToken)
        {
            var (connectionString, errorResult) = GetConnectionString();
            if (errorResult is not null)
            {
                return errorResult;
            }

            try
            {
                await using var connection = new NpgsqlConnection(connectionString);
                await connection.OpenAsync(cancellationToken);

                const string sql = @"
                    SELECT id, area_comum_id, morador_id, data_hora_inicio, data_hora_fim, status, observacao, created_at, updated_at
                    FROM public.reservas
                    WHERE id = @id
                    LIMIT 1;";

                await using var command = new NpgsqlCommand(sql, connection);
                command.Parameters.AddWithValue("id", id);

                await using var reader = await command.ExecuteReaderAsync(cancellationToken);
                if (!await reader.ReadAsync(cancellationToken))
                {
                    return NotFound();
                }

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
            if (!ModelState.IsValid)
            {
                return ValidationProblem(ModelState);
            }

            var validationError = ValidateRequest(requestBody);
            if (validationError is not null)
            {
                return BadRequest(validationError);
            }

            var (connectionString, errorResult) = GetConnectionString();
            if (errorResult is not null)
            {
                return errorResult;
            }

            try
            {
                await using var connection = new NpgsqlConnection(connectionString);
                await connection.OpenAsync(cancellationToken);

                const string sql = @"
                    INSERT INTO public.reservas (area_comum_id, morador_id, data_hora_inicio, data_hora_fim, status, observacao)
                    VALUES (@area_comum_id, @morador_id, @data_hora_inicio, @data_hora_fim, @status, @observacao)
                    RETURNING id, area_comum_id, morador_id, data_hora_inicio, data_hora_fim, status, observacao, created_at, updated_at;";

                await using var command = new NpgsqlCommand(sql, connection);
                command.Parameters.AddWithValue("area_comum_id", requestBody.AreaComumId);
                command.Parameters.AddWithValue("morador_id", requestBody.MoradorId);
                command.Parameters.AddWithValue("data_hora_inicio", requestBody.DataHoraInicio);
                command.Parameters.AddWithValue("data_hora_fim", requestBody.DataHoraFim);
                command.Parameters.AddWithValue("status", requestBody.Status);
                command.Parameters.AddWithValue("observacao", requestBody.Observacao is null ? DBNull.Value : requestBody.Observacao);

                await using var reader = await command.ExecuteReaderAsync(cancellationToken);
                if (!await reader.ReadAsync(cancellationToken))
                {
                    return StatusCode(502, "Banco retornou resposta vazia para a criação de reserva.");
                }

                var reserva = MapReserva(reader);
                return CreatedAtAction(nameof(GetById), new { id = reserva.Id }, reserva);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Erro ao criar reserva: {ex.Message}");
            }
        }

        [HttpPut("{id:int}")]
        public async Task<ActionResult<ReservaAreaComum>> Update(int id, [FromBody] ReservaAreaComum requestBody, CancellationToken cancellationToken)
        {
            if (!ModelState.IsValid)
            {
                return ValidationProblem(ModelState);
            }

            var validationError = ValidateRequest(requestBody);
            if (validationError is not null)
            {
                return BadRequest(validationError);
            }

            var (connectionString, errorResult) = GetConnectionString();
            if (errorResult is not null)
            {
                return errorResult;
            }

            try
            {
                await using var connection = new NpgsqlConnection(connectionString);
                await connection.OpenAsync(cancellationToken);

                const string sql = @"
                    UPDATE public.reservas
                    SET area_comum_id = @area_comum_id,
                        morador_id = @morador_id,
                        data_hora_inicio = @data_hora_inicio,
                        data_hora_fim = @data_hora_fim,
                        status = @status,
                        observacao = @observacao,
                        updated_at = CURRENT_TIMESTAMP
                    WHERE id = @id
                    RETURNING id, area_comum_id, morador_id, data_hora_inicio, data_hora_fim, status, observacao, created_at, updated_at;";

                await using var command = new NpgsqlCommand(sql, connection);
                command.Parameters.AddWithValue("id", id);
                command.Parameters.AddWithValue("area_comum_id", requestBody.AreaComumId);
                command.Parameters.AddWithValue("morador_id", requestBody.MoradorId);
                command.Parameters.AddWithValue("data_hora_inicio", requestBody.DataHoraInicio);
                command.Parameters.AddWithValue("data_hora_fim", requestBody.DataHoraFim);
                command.Parameters.AddWithValue("status", requestBody.Status);
                command.Parameters.AddWithValue("observacao", requestBody.Observacao is null ? DBNull.Value : requestBody.Observacao);

                await using var reader = await command.ExecuteReaderAsync(cancellationToken);
                if (!await reader.ReadAsync(cancellationToken))
                {
                    return NotFound();
                }

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
            var (connectionString, errorResult) = GetConnectionString();
            if (errorResult is not null)
            {
                return errorResult;
            }

            try
            {
                await using var connection = new NpgsqlConnection(connectionString);
                await connection.OpenAsync(cancellationToken);

                const string sql = @"
                    DELETE FROM public.reservas
                    WHERE id = @id
                    RETURNING id;";

                await using var command = new NpgsqlCommand(sql, connection);
                command.Parameters.AddWithValue("id", id);

                var deletedId = await command.ExecuteScalarAsync(cancellationToken);
                if (deletedId is null)
                {
                    return NotFound();
                }

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Erro ao remover reserva: {ex.Message}");
            }
        }

        private (string ConnectionString, ActionResult? ErrorResult) GetConnectionString()
        {
            var connectionString = _configuration.GetConnectionString("DefaultConnection");

            if (string.IsNullOrWhiteSpace(connectionString))
            {
                return (string.Empty,
                    StatusCode(500, "Configure ConnectionStrings:DefaultConnection no appsettings ou variaveis de ambiente."));
            }

            return (connectionString, null);
        }

        private static string? ValidateRequest(ReservaAreaComum requestBody)
        {
            if (requestBody.AreaComumId <= 0)
            {
                return "AreaComumId deve ser maior que zero.";
            }

            if (requestBody.MoradorId <= 0)
            {
                return "MoradorId deve ser maior que zero.";
            }

            if (requestBody.DataHoraFim <= requestBody.DataHoraInicio)
            {
                return "DataHoraFim deve ser maior que DataHoraInicio.";
            }

            if (string.IsNullOrWhiteSpace(requestBody.Status))
            {
                return "Status é obrigatório.";
            }

            if (!AllowedStatus.Contains(requestBody.Status))
            {
                return "Status inválido. Valores aceitos: Confirmada, Pendente, Cancelada.";
            }

            return null;
        }

        private static ReservaAreaComum MapReserva(NpgsqlDataReader reader)
        {
            return new ReservaAreaComum
            {
                Id = reader.GetInt32(reader.GetOrdinal("id")),
                AreaComumId = reader.GetInt32(reader.GetOrdinal("area_comum_id")),
                MoradorId = reader.GetInt32(reader.GetOrdinal("morador_id")),
                DataHoraInicio = reader.GetDateTime(reader.GetOrdinal("data_hora_inicio")),
                DataHoraFim = reader.GetDateTime(reader.GetOrdinal("data_hora_fim")),
                Status = reader.IsDBNull(reader.GetOrdinal("status")) ? string.Empty : reader.GetString(reader.GetOrdinal("status")),
                Observacao = reader.IsDBNull(reader.GetOrdinal("observacao")) ? null : reader.GetString(reader.GetOrdinal("observacao")),
                CreatedAt = reader.IsDBNull(reader.GetOrdinal("created_at")) ? null : reader.GetDateTime(reader.GetOrdinal("created_at")),
                UpdatedAt = reader.IsDBNull(reader.GetOrdinal("updated_at")) ? null : reader.GetDateTime(reader.GetOrdinal("updated_at"))
            };
        }
    }
}
