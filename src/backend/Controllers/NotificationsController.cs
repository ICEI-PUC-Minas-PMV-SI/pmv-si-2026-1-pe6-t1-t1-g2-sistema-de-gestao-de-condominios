using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Npgsql;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class NotificationsController : ControllerBase
    {
        private readonly IConfiguration _configuration;

        public NotificationsController(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Notification>>> GetAll(
            [FromQuery] int? userId,
            CancellationToken cancellationToken)
        {
            var (connectionString, errorResult) = GetConnectionString();
            if (errorResult is not null) return errorResult;

            try
            {
                await using var connection = new NpgsqlConnection(connectionString);
                await connection.OpenAsync(cancellationToken);

                var sql = @"
                    SELECT id, user_id, type, message, is_read,
                           reservation_id, occurrence_id, delivery_id,
                           created_at, updated_at
                    FROM public.notifications";

                if (userId.HasValue)
                    sql += " WHERE user_id = @user_id";

                sql += " ORDER BY created_at DESC;";

                await using var command = new NpgsqlCommand(sql, connection);
                if (userId.HasValue)
                    command.Parameters.AddWithValue("user_id", userId.Value);

                await using var reader = await command.ExecuteReaderAsync(cancellationToken);
                var notifications = new List<Notification>();

                while (await reader.ReadAsync(cancellationToken))
                    notifications.Add(MapNotification(reader));

                return Ok(notifications);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiError($"Erro ao consultar notificações: {ex.Message}"));
            }
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<Notification>> GetById(int id, CancellationToken cancellationToken)
        {
            var (connectionString, errorResult) = GetConnectionString();
            if (errorResult is not null) return errorResult;

            try
            {
                await using var connection = new NpgsqlConnection(connectionString);
                await connection.OpenAsync(cancellationToken);
                const string sql = @"
                    SELECT id, user_id, type, message, is_read,
                           reservation_id, occurrence_id, delivery_id,
                           created_at, updated_at
                    FROM public.notifications
                    WHERE id = @id
                    LIMIT 1;";

                await using var command = new NpgsqlCommand(sql, connection);
                command.Parameters.AddWithValue("id", id);

                await using var reader = await command.ExecuteReaderAsync(cancellationToken);
                if (!await reader.ReadAsync(cancellationToken))
                    return NotFound();

                return Ok(MapNotification(reader));
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiError($"Erro ao consultar notificação: {ex.Message}"));
            }
        }

        [HttpPost]
        public async Task<ActionResult<Notification>> Create(
            [FromBody] Notification requestBody,
            CancellationToken cancellationToken)
        {
            if (!ModelState.IsValid) return ValidationProblem(ModelState);

            var (connectionString, errorResult) = GetConnectionString();
            if (errorResult is not null) return errorResult;

            try
            {
                await using var connection = new NpgsqlConnection(connectionString);
                await connection.OpenAsync(cancellationToken);
                const string sql = @"
                    INSERT INTO public.notifications
                        (user_id, type, message, is_read, reservation_id, occurrence_id, delivery_id)
                    VALUES
                        (@user_id, @type::notification_type, @message, @is_read, @reservation_id, @occurrence_id, @delivery_id)
                    RETURNING id, user_id, type, message, is_read,
                              reservation_id, occurrence_id, delivery_id,
                              created_at, updated_at;";

                await using var command = new NpgsqlCommand(sql, connection);
                command.Parameters.AddWithValue("user_id", requestBody.UserId);
                command.Parameters.AddWithValue("type", requestBody.Type is null ? DBNull.Value : requestBody.Type);
                command.Parameters.AddWithValue("message", requestBody.Message is null ? DBNull.Value : requestBody.Message);
                command.Parameters.AddWithValue("is_read", requestBody.IsRead);
                command.Parameters.AddWithValue("reservation_id", requestBody.ReservationId.HasValue ? requestBody.ReservationId.Value : DBNull.Value);
                command.Parameters.AddWithValue("occurrence_id", requestBody.OccurrenceId.HasValue ? requestBody.OccurrenceId.Value : DBNull.Value);
                command.Parameters.AddWithValue("delivery_id", requestBody.DeliveryId.HasValue ? requestBody.DeliveryId.Value : DBNull.Value);

                await using var reader = await command.ExecuteReaderAsync(cancellationToken);
                if (!await reader.ReadAsync(cancellationToken))
                    return StatusCode(502, new ApiError("Banco retornou resposta vazia para a criação de notificação."));

                var notification = MapNotification(reader);
                return CreatedAtAction(nameof(GetById), new { id = notification.Id }, notification);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiError($"Erro ao criar notificação: {ex.Message}"));
            }
        }

        [HttpPatch("{id:int}")]
        public async Task<ActionResult<Notification>> Update(int id, [FromBody] Notification requestBody, CancellationToken cancellationToken)
        {
            var (connectionString, errorResult) = GetConnectionString();
            if (errorResult is not null) return errorResult;

            try
            {
                await using var connection = new NpgsqlConnection(connectionString);
                await connection.OpenAsync(cancellationToken);

                // Verificar se existe
                const string checkSql = @"SELECT 1 FROM public.notifications WHERE id = @id LIMIT 1;";
                await using (var checkCmd = new NpgsqlCommand(checkSql, connection))
                {
                    checkCmd.Parameters.AddWithValue("id", id);
                    var exists = await checkCmd.ExecuteScalarAsync(cancellationToken);
                    if (exists is null)
                        return NotFound(new ApiError("Notificação não encontrada."));
                }

                // Construir SQL dinamicamente baseado nos campos fornecidos
                var updates = new List<string>();

                if (!string.IsNullOrEmpty(requestBody.Message))
                {
                    updates.Add("message = @message");
                }

                if (requestBody.IsRead)
                {
                    updates.Add("is_read = @is_read");
                }

                if (updates.Count == 0)
                    return BadRequest(new ApiError("Nenhum campo para atualizar foi fornecido."));

                updates.Add("updated_at = CURRENT_TIMESTAMP");

                var sql = $@"
                    UPDATE public.notifications
                    SET {string.Join(", ", updates)}
                    WHERE id = @id
                    RETURNING id, user_id, type, message, is_read,
                              reservation_id, occurrence_id, delivery_id,
                              created_at, updated_at;";

                await using var command = new NpgsqlCommand(sql, connection);
                command.Parameters.AddWithValue("@id", id);

                if (!string.IsNullOrEmpty(requestBody.Message))
                    command.Parameters.AddWithValue("@message", requestBody.Message);

                if (requestBody.IsRead)
                    command.Parameters.AddWithValue("@is_read", requestBody.IsRead);

                await using var reader = await command.ExecuteReaderAsync(cancellationToken);
                if (!await reader.ReadAsync(cancellationToken))
                    return NotFound();

                return Ok(MapNotification(reader));
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiError($"Erro ao atualizar notificação: {ex.Message}"));
            }
        }

        [HttpPatch("{id:int}/read")]
        public async Task<ActionResult<Notification>> MarkAsRead(int id, CancellationToken cancellationToken)
        {
            var (connectionString, errorResult) = GetConnectionString();
            if (errorResult is not null) return errorResult;

            try
            {
                await using var connection = new NpgsqlConnection(connectionString);
                await connection.OpenAsync(cancellationToken);
                const string sql = @"
                    UPDATE public.notifications
                    SET is_read = true,
                        updated_at = CURRENT_TIMESTAMP
                    WHERE id = @id
                    RETURNING id, user_id, type, message, is_read,
                              reservation_id, occurrence_id, delivery_id,
                              created_at, updated_at;";

                await using var command = new NpgsqlCommand(sql, connection);
                command.Parameters.AddWithValue("id", id);

                await using var reader = await command.ExecuteReaderAsync(cancellationToken);
                if (!await reader.ReadAsync(cancellationToken))
                    return NotFound();

                return Ok(MapNotification(reader));
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Erro ao marcar notificação como lida: {ex.Message}");
            }
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
        {
            var (connectionString, errorResult) = GetConnectionString();
            if (errorResult is not null) return errorResult;

            try
            {
                await using var connection = new NpgsqlConnection(connectionString);
                await connection.OpenAsync(cancellationToken);
                const string sql = @"
                    DELETE FROM public.notifications
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
                return StatusCode(500, new ApiError($"Erro ao remover notificação: {ex.Message}"));
            }
        }

        private (string ConnectionString, ActionResult? ErrorResult) GetConnectionString()
        {
            var connectionString = _configuration.GetConnectionString("DefaultConnection");
            if (string.IsNullOrWhiteSpace(connectionString))
                return (string.Empty, StatusCode(500, new ApiError("Configure ConnectionStrings:DefaultConnection.")));

            return (connectionString, null);
        }

        private static Notification MapNotification(NpgsqlDataReader reader)
        {
            return new Notification
            {
                Id = reader.GetInt32(reader.GetOrdinal("id")),
                UserId = reader.GetInt32(reader.GetOrdinal("user_id")),
                Type = reader.IsDBNull(reader.GetOrdinal("type")) ? null : reader.GetString(reader.GetOrdinal("type")),
                Message = reader.IsDBNull(reader.GetOrdinal("message")) ? null : reader.GetString(reader.GetOrdinal("message")),
                IsRead = reader.GetBoolean(reader.GetOrdinal("is_read")),
                ReservationId = reader.IsDBNull(reader.GetOrdinal("reservation_id")) ? null : reader.GetInt32(reader.GetOrdinal("reservation_id")),
                OccurrenceId = reader.IsDBNull(reader.GetOrdinal("occurrence_id")) ? null : reader.GetInt32(reader.GetOrdinal("occurrence_id")),
                DeliveryId = reader.IsDBNull(reader.GetOrdinal("delivery_id")) ? null : reader.GetInt32(reader.GetOrdinal("delivery_id")),
                CreatedAt = reader.IsDBNull(reader.GetOrdinal("created_at")) ? null : reader.GetDateTime(reader.GetOrdinal("created_at")),
                UpdatedAt = reader.IsDBNull(reader.GetOrdinal("updated_at")) ? null : reader.GetDateTime(reader.GetOrdinal("updated_at")),
            };
        }
    }
}