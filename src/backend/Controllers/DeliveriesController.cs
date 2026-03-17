using backend.Dtos;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Npgsql;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DeliveriesController : ControllerBase
    {
        private readonly IConfiguration _configuration;

        public DeliveriesController(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Delivery>>> GetAll(CancellationToken cancellationToken)
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
                    SELECT id, recipient_user_id, registered_by_user_id, description, arrival_date, pickup_date, status, created_at, updated_at
                    FROM public.deliveries
                    ORDER BY id;";

                await using var command = new NpgsqlCommand(sql, connection);
                await using var reader = await command.ExecuteReaderAsync(cancellationToken);
                var deliveries = new List<Delivery>();

                while (await reader.ReadAsync(cancellationToken))
                {
                    var delivery = MapDelivery(reader);
                    delivery.Links = BuildLinks(delivery.Id);
                    deliveries.Add(delivery);
                }

                return Ok(deliveries);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Erro ao consultar entregas: {ex.Message}");
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
                const string sql = @"
                    SELECT id, recipient_user_id, registered_by_user_id, description, arrival_date, pickup_date, status, created_at, updated_at
                    FROM public.deliveries
                    WHERE id = @id
                    LIMIT 1;";

                await using var command = new NpgsqlCommand(sql, connection);
                command.Parameters.AddWithValue("id", id);

                await using var reader = await command.ExecuteReaderAsync(cancellationToken);
                if (!await reader.ReadAsync(cancellationToken))
                {
                    return NotFound();
                }

                var getByIdDelivery = MapDelivery(reader);
                getByIdDelivery.Links = BuildLinks(getByIdDelivery.Id);
                return Ok(getByIdDelivery);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Erro ao consultar entrega: {ex.Message}");
            }
        }

        [HttpPost]
        public async Task<ActionResult<Delivery>> Create([FromBody] DeliveryUpsertRequest requestBody, CancellationToken cancellationToken)
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
                const string sql = @"
                    INSERT INTO public.deliveries (recipient_user_id, registered_by_user_id, description, arrival_date, pickup_date, status)
                    VALUES (@recipient_user_id, @registered_by_user_id, @description, @arrival_date, @pickup_date, @status::delivery_status)
                    RETURNING id, recipient_user_id, registered_by_user_id, description, arrival_date, pickup_date, status, created_at, updated_at;";

                await using var command = new NpgsqlCommand(sql, connection);
                command.Parameters.AddWithValue("recipient_user_id", requestBody.RecipientUserId is null ? DBNull.Value : requestBody.RecipientUserId);
                command.Parameters.AddWithValue("registered_by_user_id", requestBody.RegisteredByUserId is null ? DBNull.Value : requestBody.RegisteredByUserId);
                command.Parameters.AddWithValue("description", requestBody.Description is null ? DBNull.Value : requestBody.Description);
                command.Parameters.AddWithValue("arrival_date", requestBody.ArrivalDate);
                command.Parameters.AddWithValue("pickup_date", requestBody.PickupDate is null ? DBNull.Value : requestBody.PickupDate);
                command.Parameters.AddWithValue("status", requestBody.Status is null ? DBNull.Value : requestBody.Status);

                await using var reader = await command.ExecuteReaderAsync(cancellationToken);
                if (!await reader.ReadAsync(cancellationToken))
                {
                    return StatusCode(502, "Banco retornou resposta vazia para a criação de entrega.");
                }

                var delivery = MapDelivery(reader);
                delivery.Links = BuildLinks(delivery.Id);
                return CreatedAtAction(nameof(GetById), new { id = delivery.Id }, delivery);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Erro ao criar entrega: {ex.Message}");
            }
        }

        [HttpPut("{id:int}")]
        public async Task<ActionResult<Delivery>> Update(int id, [FromBody] DeliveryUpsertRequest requestBody, CancellationToken cancellationToken)
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
                const string sql = @"
                    UPDATE public.deliveries
                    SET recipient_user_id = @recipient_user_id,
                        registered_by_user_id = @registered_by_user_id,
                        description = @description,
                        arrival_date = @arrival_date,
                        pickup_date = @pickup_date,
                        status = @status::delivery_status,
                        updated_at = CURRENT_TIMESTAMP
                    WHERE id = @id
                    RETURNING id, recipient_user_id, registered_by_user_id, description, arrival_date, pickup_date, status, created_at, updated_at;";

                await using var command = new NpgsqlCommand(sql, connection);
                command.Parameters.AddWithValue("id", id);
                command.Parameters.AddWithValue("recipient_user_id", requestBody.RecipientUserId is null ? DBNull.Value : requestBody.RecipientUserId);
                command.Parameters.AddWithValue("registered_by_user_id", requestBody.RegisteredByUserId is null ? DBNull.Value : requestBody.RegisteredByUserId);
                command.Parameters.AddWithValue("description", requestBody.Description is null ? DBNull.Value : requestBody.Description);
                command.Parameters.AddWithValue("arrival_date", requestBody.ArrivalDate);
                command.Parameters.AddWithValue("pickup_date", requestBody.PickupDate is null ? DBNull.Value : requestBody.PickupDate);
                command.Parameters.AddWithValue("status", requestBody.Status is null ? DBNull.Value : requestBody.Status);

                await using var reader = await command.ExecuteReaderAsync(cancellationToken);
                if (!await reader.ReadAsync(cancellationToken))
                {
                    return NotFound();
                }

                var updatedDelivery = MapDelivery(reader);
                updatedDelivery.Links = BuildLinks(updatedDelivery.Id);
                return Ok(updatedDelivery);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Erro ao atualizar entrega: {ex.Message}");
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

        private List<Link> BuildLinks(int deliveryId)
        {
            var links = new List<Link>();

            AddLinkIfAvailable(links, Url.ActionLink(nameof(GetById), values: new { id = deliveryId }), "self", "GET");
            AddLinkIfAvailable(links, Url.ActionLink(nameof(Update), values: new { id = deliveryId }), "update", "PUT");
            AddLinkIfAvailable(links, Url.ActionLink(nameof(Delete), values: new { id = deliveryId }), "delete", "DELETE");
            AddLinkIfAvailable(links, Url.ActionLink(nameof(GetAll)), "collection", "GET");

            return links;
        }

        private static void AddLinkIfAvailable(List<Link> links, string? href, string rel, string method)
        {
            if (!string.IsNullOrWhiteSpace(href))
            {
                links.Add(new Link(href, rel, method));
            }
        }

        private static Delivery MapDelivery(NpgsqlDataReader reader)
        {
            return new Delivery
            {
                Id = reader.GetInt32(reader.GetOrdinal("id")),
                RecipientUserId = reader.IsDBNull(reader.GetOrdinal("recipient_user_id")) ? null : reader.GetInt32(reader.GetOrdinal("recipient_user_id")),
                RegisteredByUserId = reader.IsDBNull(reader.GetOrdinal("registered_by_user_id")) ? null : reader.GetInt32(reader.GetOrdinal("registered_by_user_id")),
                Description = reader.IsDBNull(reader.GetOrdinal("description")) ? null : reader.GetString(reader.GetOrdinal("description")),
                ArrivalDate = reader.GetDateTime(reader.GetOrdinal("arrival_date")),
                PickupDate = reader.IsDBNull(reader.GetOrdinal("pickup_date")) ? null : reader.GetDateTime(reader.GetOrdinal("pickup_date")),
                Status = reader.IsDBNull(reader.GetOrdinal("status")) ? null : reader.GetString(reader.GetOrdinal("status")),
                CreatedAt = reader.IsDBNull(reader.GetOrdinal("created_at")) ? null : reader.GetDateTime(reader.GetOrdinal("created_at")),
                UpdatedAt = reader.IsDBNull(reader.GetOrdinal("updated_at")) ? null : reader.GetDateTime(reader.GetOrdinal("updated_at"))
            };
        }
    }
}