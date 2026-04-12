using backend.Data;
using backend.Models;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using System.Data;

namespace backend.Controllers
{
    [AllowAnonymous]
    [ApiController]
    [Route("api/reservas")]
    public class ReservasController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly EmailService _emailService;
        public ReservasController(ApplicationDbContext context, EmailService emailService)
        {
            _context = context;
            _emailService = emailService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ReservaAreaComum>>> GetAll(CancellationToken cancellationToken)
        {
            try
            {
                var dbConnection = _context.Database.GetDbConnection();
                if (dbConnection is not NpgsqlConnection connection)
                {
                    return StatusCode(500, "Conexão de banco inválida para reservas.");
                }

                var shouldCloseConnection = connection.State != ConnectionState.Open;
                if (shouldCloseConnection)
                {
                    await connection.OpenAsync(cancellationToken);
                }

                try
                {
                    const string sql = @"
                        SELECT id, common_area_id, user_id, start_time, end_time, status::text, created_at, updated_at
                        FROM public.reservations
                        ORDER BY id;";

                    await using var command = new NpgsqlCommand(sql, connection);
                    await using var reader = await command.ExecuteReaderAsync(cancellationToken);
                    var list = new List<ReservaAreaComum>();

                    while (await reader.ReadAsync(cancellationToken))
                    {
                        list.Add(MapReserva(reader));
                    }

                    return Ok(list);
                }
                finally
                {
                    if (shouldCloseConnection)
                    {
                        await connection.CloseAsync();
                    }
                }

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
                var dbConnection = _context.Database.GetDbConnection();
                if (dbConnection is not NpgsqlConnection connection)
                {
                    return StatusCode(500, "Conexão de banco inválida para reservas.");
                }

                var shouldCloseConnection = connection.State != ConnectionState.Open;
                if (shouldCloseConnection)
                {
                    await connection.OpenAsync(cancellationToken);
                }

                try
                {
                    const string sql = @"
                        SELECT id, common_area_id, user_id, start_time, end_time, status::text, created_at, updated_at
                        FROM public.reservations
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
                finally
                {
                    if (shouldCloseConnection)
                    {
                        await connection.CloseAsync();
                    }
                }
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

            var dataHoraInicio = NormalizeToUtc(requestBody.DataHoraInicio);
            var dataHoraFim = NormalizeToUtc(requestBody.DataHoraFim);

            var validationError = ValidateRequest(requestBody.AreaComumId, requestBody.MoradorId, dataHoraInicio, dataHoraFim);
            if (validationError is not null)
            {
                return BadRequest(validationError);
            }

            try
            {
                if (await ExistsOverlappingReservationAsync(
                        requestBody.AreaComumId,
                        dataHoraInicio,
                        dataHoraFim,
                        excludeReservaId: null,
                        cancellationToken))
                {
                    return Conflict("Já existe reserva ativa (não cancelada) neste horário para esta área comum.");
                }

                var now = DateTime.UtcNow;
                var dbConnection = _context.Database.GetDbConnection();
                if (dbConnection is not NpgsqlConnection connection)
                {
                    return StatusCode(500, "Conexão de banco inválida para reservas.");
                }

                var shouldCloseConnection = connection.State != ConnectionState.Open;
                if (shouldCloseConnection)
                {
                    await connection.OpenAsync(cancellationToken);
                }

                const string sql = @"
                    INSERT INTO public.reservations
                        (common_area_id, user_id, start_time, end_time, status, created_at, updated_at)
                    VALUES
                        (@common_area_id, @user_id, @start_time, @end_time, @status::reservation_status, @created_at, @updated_at)
                    RETURNING id, common_area_id, user_id, start_time, end_time, status::text, created_at, updated_at;";

                try
                {
                    await using var command = new NpgsqlCommand(sql, connection);
                    command.Parameters.AddWithValue("common_area_id", requestBody.AreaComumId);
                    command.Parameters.AddWithValue("user_id", requestBody.MoradorId);
                    command.Parameters.AddWithValue("start_time", dataHoraInicio);
                    command.Parameters.AddWithValue("end_time", dataHoraFim);
                    command.Parameters.AddWithValue("status", requestBody.Status.ToString());
                    command.Parameters.AddWithValue("created_at", now);
                    command.Parameters.AddWithValue("updated_at", now);

                    ReservaAreaComum entity;
                    await using (var reader = await command.ExecuteReaderAsync(cancellationToken))
                    {
                        if (!await reader.ReadAsync(cancellationToken))
                        {
                            return StatusCode(502, "Banco retornou resposta vazia para a criação de reserva.");
                        }

                        entity = MapReserva(reader);
                    }

                    if (entity.Status == ReservationStatus.Aprovada)
                    {
                        var notificationId = await CreateNotificationAsync(connection, entity, "Reserva Confirmada", cancellationToken);
                        if (notificationId > 0)
                        {
                            await SendNotificationAsync(notificationId);
                        }
                    }

                    return CreatedAtAction(nameof(GetById), new { id = entity.Id }, entity);
                }
                finally
                {
                    if (shouldCloseConnection)
                    {
                        await connection.CloseAsync();
                    }
                }
            }
            catch (DbUpdateException ex) when (ex.InnerException is PostgresException pgEx)
            {
                return StatusCode(500, $"Erro ao criar reserva: {BuildDatabaseErrorMessage(pgEx)}");
            }
            catch (DbUpdateException ex)
            {
                return StatusCode(500, $"Erro ao criar reserva: {ex.InnerException?.Message ?? ex.Message}");
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

            var dataHoraInicio = NormalizeToUtc(requestBody.DataHoraInicio);
            var dataHoraFim = NormalizeToUtc(requestBody.DataHoraFim);

            var validationError = ValidateRequest(requestBody.AreaComumId, requestBody.MoradorId, dataHoraInicio, dataHoraFim);
            if (validationError is not null)
            {
                return BadRequest(validationError);
            }

            try
            {
                if (await ExistsOverlappingReservationAsync(
                        requestBody.AreaComumId,
                        dataHoraInicio,
                        dataHoraFim,
                        excludeReservaId: id,
                        cancellationToken))
                {
                    return Conflict("Já existe reserva ativa (não cancelada) neste horário para esta área comum.");
                }

                var dbConnection = _context.Database.GetDbConnection();
                if (dbConnection is not NpgsqlConnection connection)
                {
                    return StatusCode(500, "Conexão de banco inválida para reservas.");
                }

                var shouldCloseConnection = connection.State != ConnectionState.Open;
                if (shouldCloseConnection)
                {
                    await connection.OpenAsync(cancellationToken);
                }

                ReservationStatus previousStatus;
                {
                    const string statusSql = @"
                        SELECT status::text
                        FROM public.reservations
                        WHERE id = @id
                        LIMIT 1;";

                    await using var statusCommand = new NpgsqlCommand(statusSql, connection);
                    statusCommand.Parameters.AddWithValue("id", id);

                    var statusResult = await statusCommand.ExecuteScalarAsync(cancellationToken);
                    if (statusResult is null)
                    {
                        return NotFound();
                    }

                    previousStatus = Enum.TryParse<ReservationStatus>(statusResult.ToString(), true, out var parsedStatus)
                        ? parsedStatus
                        : ReservationStatus.Pendente;
                }

                const string sql = @"
                    UPDATE public.reservations
                    SET common_area_id = @common_area_id,
                        user_id = @user_id,
                        start_time = @start_time,
                        end_time = @end_time,
                        status = @status::reservation_status,
                        updated_at = @updated_at
                    WHERE id = @id
                    RETURNING id, common_area_id, user_id, start_time, end_time, status::text, created_at, updated_at;";

                try
                {
                    await using var command = new NpgsqlCommand(sql, connection);
                    command.Parameters.AddWithValue("id", id);
                    command.Parameters.AddWithValue("common_area_id", requestBody.AreaComumId);
                    command.Parameters.AddWithValue("user_id", requestBody.MoradorId);
                    command.Parameters.AddWithValue("start_time", dataHoraInicio);
                    command.Parameters.AddWithValue("end_time", dataHoraFim);
                    command.Parameters.AddWithValue("status", requestBody.Status.ToString());
                    command.Parameters.AddWithValue("updated_at", DateTime.UtcNow);

                    ReservaAreaComum entity;
                    await using (var reader = await command.ExecuteReaderAsync(cancellationToken))
                    {
                        if (!await reader.ReadAsync(cancellationToken))
                        {
                            return NotFound();
                        }

                        entity = MapReserva(reader);
                    }

                    if (entity.Status == ReservationStatus.Aprovada)
                    {
                        var notificationId = await CreateNotificationAsync(connection, entity, "Reserva Confirmada", cancellationToken);
                        if (notificationId > 0)
                        {
                            await SendNotificationAsync(notificationId);
                        }
                    }

                    if (previousStatus != ReservationStatus.Cancelada && entity.Status == ReservationStatus.Cancelada)
                    {
                        var notificationId = await CreateNotificationAsync(connection, entity, "Reserva Cancelada", cancellationToken);
                        if (notificationId > 0)
                        {
                            await SendNotificationAsync(notificationId);
                        }
                    }

                    return Ok(entity);
                }
                finally
                {
                    if (shouldCloseConnection)
                    {
                        await connection.CloseAsync();
                    }
                }
            }
            catch (DbUpdateException ex) when (ex.InnerException is PostgresException pgEx)
            {
                return StatusCode(500, $"Erro ao atualizar reserva: {BuildDatabaseErrorMessage(pgEx)}");
            }
            catch (DbUpdateException ex)
            {
                return StatusCode(500, $"Erro ao atualizar reserva: {ex.InnerException?.Message ?? ex.Message}");
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
                var dbConnection = _context.Database.GetDbConnection();
                if (dbConnection is not NpgsqlConnection connection)
                {
                    return StatusCode(500, "Conexão de banco inválida para reservas.");
                }

                var shouldCloseConnection = connection.State != ConnectionState.Open;
                if (shouldCloseConnection)
                {
                    await connection.OpenAsync(cancellationToken);
                }

                try
                {
                    const string sql = @"
                        DELETE FROM public.reservations
                        WHERE id = @id
                        RETURNING id;";

                    await using var command = new NpgsqlCommand(sql, connection);
                    command.Parameters.AddWithValue("id", id);

                    var deletedId = await command.ExecuteScalarAsync(cancellationToken);
                    if (deletedId is null)
                    {
                        return NotFound();
                    }
                }
                finally
                {
                    if (shouldCloseConnection)
                    {
                        await connection.CloseAsync();
                    }
                }

                return NoContent();
            }
            catch (DbUpdateException ex) when (ex.InnerException is PostgresException pgEx)
            {
                return StatusCode(500, $"Erro ao remover reserva: {BuildDatabaseErrorMessage(pgEx)}");
            }
            catch (DbUpdateException ex)
            {
                return StatusCode(500, $"Erro ao remover reserva: {ex.InnerException?.Message ?? ex.Message}");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Erro ao remover reserva: {ex.Message}");
            }
        }

        private static string BuildDatabaseErrorMessage(PostgresException ex)
        {
            return ex.SqlState switch
            {
                PostgresErrorCodes.ForeignKeyViolation => "AreaComumId ou MoradorId inválido (chave estrangeira).",
                PostgresErrorCodes.UniqueViolation => "Já existe um registro com os mesmos dados únicos.",
                PostgresErrorCodes.InvalidTextRepresentation => "Valor inválido em um dos campos (ex.: status).",
                _ => ex.MessageText
            };
        }

        private static ReservaAreaComum MapReserva(NpgsqlDataReader reader)
        {
            var statusText = reader.GetString(5);

            return new ReservaAreaComum
            {
                Id = reader.GetInt32(0),
                AreaComumId = reader.GetInt32(1),
                MoradorId = reader.GetInt32(2),
                DataHoraInicio = reader.GetDateTime(3),
                DataHoraFim = reader.GetDateTime(4),
                Status = Enum.TryParse<ReservationStatus>(statusText, true, out var status)
                    ? status
                    : ReservationStatus.Pendente,
                CreatedAt = reader.IsDBNull(6) ? null : reader.GetDateTime(6),
                UpdatedAt = reader.IsDBNull(7) ? null : reader.GetDateTime(7)
            };
        }

        /// <summary>
        /// Reservas com status Cancelada não ocupam o horário. Equivalente a
        /// <see cref="Services.ReservaConflito.IntervalosSeSobrepoe"/> para o par de intervalos.
        /// </summary>
        private Task<bool> ExistsOverlappingReservationAsync(
            int areaComumId,
            DateTime inicio,
            DateTime fim,
            int? excludeReservaId,
            CancellationToken cancellationToken)
        {
            return ExistsOverlappingReservationViaSqlAsync(
                areaComumId,
                inicio,
                fim,
                excludeReservaId,
                cancellationToken);
        }

        private async Task<bool> ExistsOverlappingReservationViaSqlAsync(
            int areaComumId,
            DateTime inicio,
            DateTime fim,
            int? excludeReservaId,
            CancellationToken cancellationToken)
        {
            var dbConnection = _context.Database.GetDbConnection();
            if (dbConnection is not NpgsqlConnection connection)
            {
                return false;
            }

            var shouldCloseConnection = connection.State != ConnectionState.Open;
            if (shouldCloseConnection)
            {
                await connection.OpenAsync(cancellationToken);
            }

            try
            {
                const string sql = @"
                    SELECT 1
                    FROM public.reservations
                    WHERE common_area_id = @common_area_id
                      AND status <> 'Cancelada'::reservation_status
                      AND (@exclude_id IS NULL OR id <> @exclude_id)
                      AND start_time < @fim
                      AND end_time > @inicio
                    LIMIT 1;";

                await using var command = new NpgsqlCommand(sql, connection);
                command.Parameters.AddWithValue("common_area_id", areaComumId);
                command.Parameters.AddWithValue("inicio", inicio);
                command.Parameters.AddWithValue("fim", fim);
                command.Parameters.Add("exclude_id", NpgsqlTypes.NpgsqlDbType.Integer).Value =
                    excludeReservaId.HasValue ? excludeReservaId.Value : DBNull.Value;

                var result = await command.ExecuteScalarAsync(cancellationToken);
                return result is not null;
            }
            finally
            {
                if (shouldCloseConnection)
                {
                    await connection.CloseAsync();
                }
            }
        }

        private static string? ValidateRequest(int areaComumId, int moradorId, DateTime dataHoraInicio, DateTime dataHoraFim)
        {
            if (areaComumId <= 0)
            {
                return "AreaComumId deve ser maior que zero.";
            }

            if (moradorId <= 0)
            {
                return "MoradorId deve ser maior que zero.";
            }

            if (dataHoraFim <= dataHoraInicio)
            {
                return "DataHoraFim deve ser maior que DataHoraInicio.";
            }

            return null;
        }

        private static DateTime NormalizeToUtc(DateTime value)
        {
            if (value.Kind == DateTimeKind.Utc)
            {
                return value;
            }

            if (value.Kind == DateTimeKind.Local)
            {
                return value.ToUniversalTime();
            }

            return DateTime.SpecifyKind(value, DateTimeKind.Local).ToUniversalTime();
        }


        private async Task<int> CreateNotificationAsync(
            NpgsqlConnection connection,
            ReservaAreaComum reservation,
            string type,
            CancellationToken cancellationToken)
        {
            const string sql = @"
                INSERT INTO public.notifications
                    (user_id, type, message, is_read, reservation_id, occurrence_id, delivery_id)
                VALUES
                    (@user_id, @type::notification_type, @message, @is_read, @reservation_id, @occurrence_id, @delivery_id)
                RETURNING id;";

            var message = type == "Reserva Cancelada"
                ? $"Sua reserva da área comum (ID: {reservation.Id}) foi cancelada."
                : $"Sua reserva da área comum (ID: {reservation.Id}) foi confirmada.";

            await using var command = new NpgsqlCommand(sql, connection);
            command.Parameters.AddWithValue("user_id", reservation.MoradorId);
            command.Parameters.AddWithValue("type", type);
            command.Parameters.AddWithValue("message", message);
            command.Parameters.AddWithValue("is_read", false);
            command.Parameters.AddWithValue("reservation_id", reservation.Id);
            command.Parameters.AddWithValue("occurrence_id", DBNull.Value);
            command.Parameters.AddWithValue("delivery_id", DBNull.Value);

            var result = await command.ExecuteScalarAsync(cancellationToken);
            return result is null ? -1 : Convert.ToInt32(result);
        }

        private async Task SendNotificationAsync(int notificationId)
        {
            await _emailService.SendMail(notificationId);

        }
    }
}