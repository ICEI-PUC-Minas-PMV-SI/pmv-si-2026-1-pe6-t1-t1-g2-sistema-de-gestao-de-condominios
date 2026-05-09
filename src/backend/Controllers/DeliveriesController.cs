using System.Runtime.CompilerServices;
using backend.Models;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Npgsql;

namespace backend.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class DeliveriesController : ControllerBase
    {
        private readonly IConfiguration _configuration;

        private readonly EmailService _emailService;

        public DeliveriesController(IConfiguration configuration, EmailService emailService)
        {
            _configuration = configuration;
            _emailService = emailService;

        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Delivery>>> GetAll(
            [FromQuery] int? recipientUserId,  // ← adicione este parâmetro
            CancellationToken cancellationToken)
        {
            var (connectionString, errorResult) = GetConnectionString();
            if (errorResult is not null) return errorResult;

            try
            {
                await using var connection = new NpgsqlConnection(connectionString);
                await connection.OpenAsync(cancellationToken);

                var sql = DeliverySelectSql;

                if (recipientUserId.HasValue)
                    sql += " WHERE d.recipient_user_id = @recipient_user_id";

                sql += " ORDER BY d.id;";

                await using var command = new NpgsqlCommand(sql, connection);

                if (recipientUserId.HasValue)
                    command.Parameters.AddWithValue("recipient_user_id", recipientUserId.Value);

                await using var reader = await command.ExecuteReaderAsync(cancellationToken);
                var deliveries = new List<Delivery>();

                while (await reader.ReadAsync(cancellationToken))
                    deliveries.Add(MapDelivery(reader));

                return Ok(deliveries);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiError($"Erro ao consultar entregas: {ex.Message}"));
            }
        }
        

        [HttpGet("{id:int}")]
        public async Task<ActionResult<Delivery>> GetById(int id, CancellationToken cancellationToken)
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
                const string sql = DeliverySelectSql + " WHERE d.id = @id LIMIT 1;";

                await using var command = new NpgsqlCommand(sql, connection);
                command.Parameters.AddWithValue("id", id);

                await using var reader = await command.ExecuteReaderAsync(cancellationToken);
                if (!await reader.ReadAsync(cancellationToken))
                {
                    return NotFound();
                }

                return Ok(MapDelivery(reader));
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiError($"Erro ao consultar entrega: {ex.Message}"));
            }
        }

        [HttpPost]
        public async Task<ActionResult<Delivery>> Create([FromBody] Delivery requestBody, CancellationToken cancellationToken)
        {
            if (!ModelState.IsValid)
            {
                return ValidationProblem(ModelState);
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

                // Validar se os usuários existem
                if (requestBody.RecipientUserId.HasValue)
                {
                    var userExists = await UserExistsAsync(connection, requestBody.RecipientUserId.Value, cancellationToken);
                    if (!userExists)
                        return BadRequest(new ApiError("Usuário destinatário não existe."));
                }

                if (requestBody.RegisteredByUserId.HasValue)
                {
                    var userExists = await UserExistsAsync(connection, requestBody.RegisteredByUserId.Value, cancellationToken);
                    if (!userExists)
                        return BadRequest(new ApiError("Usuário registrador não existe."));
                }

                const string sql = @"
                    WITH inserted AS (
                        INSERT INTO public.deliveries (recipient_user_id, registered_by_user_id, description, arrival_date, pickup_date, status)
                        VALUES (@recipient_user_id, @registered_by_user_id, @description, @arrival_date, @pickup_date, @status::delivery_status)
                        RETURNING id, recipient_user_id, registered_by_user_id, description, arrival_date, pickup_date, status, created_at, updated_at
                    )
                    SELECT inserted.id,
                           inserted.recipient_user_id,
                           recipient.username AS recipient_username,
                           recipient.email AS recipient_email,
                           inserted.registered_by_user_id,
                           registered_by.username AS registered_by_username,
                           registered_by.email AS registered_by_email,
                           inserted.description,
                           inserted.arrival_date,
                           inserted.pickup_date,
                           inserted.status,
                           inserted.created_at,
                           inserted.updated_at
                    FROM inserted
                    LEFT JOIN public.users recipient ON recipient.id = inserted.recipient_user_id
                    LEFT JOIN public.users registered_by ON registered_by.id = inserted.registered_by_user_id;";

                await using var command = new NpgsqlCommand(sql, connection);
                command.Parameters.AddWithValue("recipient_user_id", requestBody.RecipientUserId is null ? DBNull.Value : requestBody.RecipientUserId);
                command.Parameters.AddWithValue("registered_by_user_id", requestBody.RegisteredByUserId is null ? DBNull.Value : requestBody.RegisteredByUserId);
                command.Parameters.AddWithValue("description", requestBody.Description is null ? DBNull.Value : requestBody.Description);
                command.Parameters.AddWithValue("arrival_date", requestBody.ArrivalDate);
                command.Parameters.AddWithValue("pickup_date", requestBody.PickupDate is null ? DBNull.Value : requestBody.PickupDate);
                command.Parameters.AddWithValue("status", requestBody.Status is null ? DBNull.Value : requestBody.Status);

                Delivery delivery;
                await using (var reader = await command.ExecuteReaderAsync(cancellationToken))
                {
                    if (!await reader.ReadAsync(cancellationToken))
                    {
                        return StatusCode(502, new ApiError("Banco retornou resposta vazia para a criação de entrega."));
                    }

                    delivery = MapDelivery(reader);
                }

                if (IsReadyForPickupStatus(delivery.Status))
                {
                    var notificationId = await CreateDeliveryNotificationAsync(connection, delivery, cancellationToken);
                    await SendEmailNotificationForDelivery(_emailService, notificationId);
                }

                return CreatedAtAction(nameof(GetById), new { id = delivery.Id }, delivery);
            }
            catch (PostgresException pgEx) when (pgEx.SqlState == "23503")  // Foreign key violation
            {
                return BadRequest(new ApiError("Um dos usuários referenciados não existe."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiError($"Erro ao criar entrega: {ex.Message}"));
            }
        }

        [HttpPut("{id:int}")]
        public async Task<ActionResult<Delivery>> Update(int id, [FromBody] Delivery requestBody, CancellationToken cancellationToken)
        {
            if (!ModelState.IsValid)
            {
                return ValidationProblem(ModelState);
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

                const string previousStatusSql = @"
                    SELECT status::text, recipient_user_id
                    FROM public.deliveries
                    WHERE id = @id
                    LIMIT 1;";

                await using var previousStatusCommand = new NpgsqlCommand(previousStatusSql, connection);
                previousStatusCommand.Parameters.AddWithValue("id", id);

                string previousStatus;
                int? previousRecipientUserId;
                await using (var previousStatusReader = await previousStatusCommand.ExecuteReaderAsync(cancellationToken))
                {
                    if (!await previousStatusReader.ReadAsync(cancellationToken))
                    {
                        return NotFound();
                    }

                    previousStatus = previousStatusReader.IsDBNull(0) ? string.Empty : previousStatusReader.GetString(0);
                    previousRecipientUserId = previousStatusReader.IsDBNull(1) ? null : previousStatusReader.GetInt32(1);
                }

                const string sql = @"
                    WITH updated AS (
                        UPDATE public.deliveries
                        SET recipient_user_id = @recipient_user_id,
                            registered_by_user_id = @registered_by_user_id,
                            description = @description,
                            arrival_date = @arrival_date,
                            pickup_date = @pickup_date,
                            status = @status::delivery_status,
                            updated_at = CURRENT_TIMESTAMP
                        WHERE id = @id
                        RETURNING id, recipient_user_id, registered_by_user_id, description, arrival_date, pickup_date, status, created_at, updated_at
                    )
                    SELECT updated.id,
                           updated.recipient_user_id,
                           recipient.username AS recipient_username,
                           recipient.email AS recipient_email,
                           updated.registered_by_user_id,
                           registered_by.username AS registered_by_username,
                           registered_by.email AS registered_by_email,
                           updated.description,
                           updated.arrival_date,
                           updated.pickup_date,
                           updated.status,
                           updated.created_at,
                           updated.updated_at
                    FROM updated
                    LEFT JOIN public.users recipient ON recipient.id = updated.recipient_user_id
                    LEFT JOIN public.users registered_by ON registered_by.id = updated.registered_by_user_id;";

                await using var command = new NpgsqlCommand(sql, connection);
                command.Parameters.AddWithValue("id", id);
                command.Parameters.AddWithValue("recipient_user_id", requestBody.RecipientUserId is null ? DBNull.Value : requestBody.RecipientUserId);
                command.Parameters.AddWithValue("registered_by_user_id", requestBody.RegisteredByUserId is null ? DBNull.Value : requestBody.RegisteredByUserId);
                command.Parameters.AddWithValue("description", requestBody.Description is null ? DBNull.Value : requestBody.Description);
                command.Parameters.AddWithValue("arrival_date", requestBody.ArrivalDate);
                command.Parameters.AddWithValue("pickup_date", requestBody.PickupDate is null ? DBNull.Value : requestBody.PickupDate);
                command.Parameters.AddWithValue("status", requestBody.Status is null ? DBNull.Value : requestBody.Status);

                Delivery delivery;
                await using (var reader = await command.ExecuteReaderAsync(cancellationToken))
                {
                    if (!await reader.ReadAsync(cancellationToken))
                    {
                        return NotFound();
                    }

                    delivery = MapDelivery(reader);
                }

                if (!IsReadyForPickupStatus(previousStatus) && IsReadyForPickupStatus(delivery.Status))
                {
                    delivery.RecipientUserId ??= previousRecipientUserId;
                    var notificationId = await CreateDeliveryNotificationAsync(connection, delivery, cancellationToken);
                    await SendEmailNotificationForDelivery(_emailService, notificationId);
                }
                
                return Ok(delivery);
            }
            catch (PostgresException pgEx) when (pgEx.SqlState == "23503")  // Foreign key violation
            {
                return BadRequest(new ApiError("Um dos usuários referenciados não existe."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiError($"Erro ao atualizar entrega: {ex.Message}"));
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
                    DELETE FROM public.deliveries
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
                return StatusCode(500, $"Erro ao remover entrega: {ex.Message}");
            }
        }

        private (string ConnectionString, ActionResult? ErrorResult) GetConnectionString()
        {
            var connectionString = _configuration.GetConnectionString("DefaultConnection");

            if (string.IsNullOrWhiteSpace(connectionString))
            {
                return (string.Empty, StatusCode(500, "Configure ConnectionStrings:DefaultConnection no appsettings ou variaveis de ambiente."));
            }

            return (connectionString, null);
        }

        private const string DeliverySelectSql = @"
                    SELECT d.id,
                           d.recipient_user_id,
                           recipient.username AS recipient_username,
                           recipient.email AS recipient_email,
                           d.registered_by_user_id,
                           registered_by.username AS registered_by_username,
                           registered_by.email AS registered_by_email,
                           d.description,
                           d.arrival_date,
                           d.pickup_date,
                           d.status,
                           d.created_at,
                           d.updated_at
                    FROM public.deliveries d
                    LEFT JOIN public.users recipient ON recipient.id = d.recipient_user_id
                    LEFT JOIN public.users registered_by ON registered_by.id = d.registered_by_user_id";

        private static Delivery MapDelivery(NpgsqlDataReader reader)
        {
            return new Delivery
            {
                Id = reader.GetInt32(reader.GetOrdinal("id")),
                RecipientUserId = reader.IsDBNull(reader.GetOrdinal("recipient_user_id")) ? null : reader.GetInt32(reader.GetOrdinal("recipient_user_id")),
                RecipientUsername = ReadNullableString(reader, "recipient_username"),
                RecipientEmail = ReadNullableString(reader, "recipient_email"),
                RegisteredByUserId = reader.IsDBNull(reader.GetOrdinal("registered_by_user_id")) ? null : reader.GetInt32(reader.GetOrdinal("registered_by_user_id")),
                RegisteredByUsername = ReadNullableString(reader, "registered_by_username"),
                RegisteredByEmail = ReadNullableString(reader, "registered_by_email"),
                Description = reader.IsDBNull(reader.GetOrdinal("description")) ? null : reader.GetString(reader.GetOrdinal("description")),
                ArrivalDate = reader.GetDateTime(reader.GetOrdinal("arrival_date")),
                PickupDate = reader.IsDBNull(reader.GetOrdinal("pickup_date")) ? null : reader.GetDateTime(reader.GetOrdinal("pickup_date")),
                Status = reader.IsDBNull(reader.GetOrdinal("status")) ? null : reader.GetString(reader.GetOrdinal("status")),
                CreatedAt = reader.IsDBNull(reader.GetOrdinal("created_at")) ? null : reader.GetDateTime(reader.GetOrdinal("created_at")),
                UpdatedAt = reader.IsDBNull(reader.GetOrdinal("updated_at")) ? null : reader.GetDateTime(reader.GetOrdinal("updated_at"))
            };
        }

        private static string? ReadNullableString(NpgsqlDataReader reader, string columnName)
        {
            try
            {
                var ordinal = reader.GetOrdinal(columnName);
                return reader.IsDBNull(ordinal) ? null : reader.GetString(ordinal);
            }
            catch (IndexOutOfRangeException)
            {
                return null;
            }
        }

        private static bool IsReadyForPickupStatus(string? status)
        {
            return string.Equals(status, "Disponível para Retirada", StringComparison.OrdinalIgnoreCase)
                || string.Equals(status, "Disponivel para Retirada", StringComparison.OrdinalIgnoreCase);
        }
        private static async Task SendEmailNotificationForDelivery(EmailService emailService, int notificationId)
        {
            await emailService.SendMail(notificationId);
        }

        private static async Task<int> CreateDeliveryNotificationAsync(
            NpgsqlConnection connection,
            Delivery delivery,
            CancellationToken cancellationToken)
        {
            if (!delivery.RecipientUserId.HasValue)
            {
                return -1;
            }

            const string sql = @"
                INSERT INTO public.notifications
                    (user_id, type, message, is_read, reservation_id, occurrence_id, delivery_id)
                VALUES
                    (@user_id, @type::notification_type, @message, @is_read, @reservation_id, @occurrence_id, @delivery_id)
                RETURNING id;";

            await using var command = new NpgsqlCommand(sql, connection);
            command.Parameters.AddWithValue("user_id", delivery.RecipientUserId.Value);
            command.Parameters.AddWithValue("type", "Encomenda Chegou");
            command.Parameters.AddWithValue("message", BuildDeliveryNotificationMessage(delivery));
            command.Parameters.AddWithValue("is_read", false);
            command.Parameters.AddWithValue("reservation_id", DBNull.Value);
            command.Parameters.AddWithValue("occurrence_id", DBNull.Value);
            command.Parameters.AddWithValue("delivery_id", delivery.Id);

            var result = await command.ExecuteScalarAsync(cancellationToken);
            return result != null ? (int)result : -1;
        }

        private static string BuildDeliveryNotificationMessage(Delivery delivery)
        {
            var description = string.IsNullOrWhiteSpace(delivery.Description)
                ? "Sem descrição informada"
                : delivery.Description.Trim();
            var requestedBy = GetDeliveryUserLabel(delivery.RegisteredByUsername, delivery.RegisteredByEmail, delivery.RegisteredByUserId);
            var arrivalDate = delivery.ArrivalDate.ToString("dd/MM/yyyy HH:mm");

            return $"Sua encomenda está disponível para retirada. Descrição: {description}. Solicitada por: {requestedBy}. Recebida em: {arrivalDate}.";
        }

        private static string GetDeliveryUserLabel(string? username, string? email, int? fallbackId)
        {
            if (!string.IsNullOrWhiteSpace(username)) return username.Trim();
            if (!string.IsNullOrWhiteSpace(email)) return email.Trim();
            return fallbackId.HasValue ? $"usuário #{fallbackId.Value}" : "Não informado";
        }

        private static async Task<bool> UserExistsAsync(NpgsqlConnection connection, int userId, CancellationToken cancellationToken)
        {
            const string sql = @"SELECT 1 FROM public.users WHERE id = @id LIMIT 1;";
            await using var command = new NpgsqlCommand(sql, connection);
            command.Parameters.AddWithValue("id", userId);

            var result = await command.ExecuteScalarAsync(cancellationToken);
            return result != null;
        }
    }
}
