using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Npgsql;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly IConfiguration _configuration;

        public UsersController(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<User>>> GetAll(CancellationToken cancellationToken)
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
                    SELECT id, username, password_hash, email, profile, created_at, updated_at
                    FROM public.users
                    ORDER BY id;";

                await using var command = new NpgsqlCommand(sql, connection);
                await using var reader = await command.ExecuteReaderAsync(cancellationToken);
                var users = new List<User>();

                while (await reader.ReadAsync(cancellationToken))
                {
                    users.Add(MapUser(reader));
                }

                return Ok(users);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Erro ao consultar usuarios: {ex.Message}");
            }
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<User>> GetById(int id, CancellationToken cancellationToken)
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
                    SELECT id, username, password_hash, email, profile, created_at, updated_at
                    FROM public.users
                    WHERE id = @id
                    LIMIT 1;";

                await using var command = new NpgsqlCommand(sql, connection);
                command.Parameters.AddWithValue("id", id);

                await using var reader = await command.ExecuteReaderAsync(cancellationToken);
                if (!await reader.ReadAsync(cancellationToken))
                {
                    return NotFound();
                }

                return Ok(MapUser(reader));
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Erro ao consultar usuario: {ex.Message}");
            }
        }

        [HttpPost]
        public async Task<ActionResult<User>> Create([FromBody] User requestBody, CancellationToken cancellationToken)
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
                    INSERT INTO public.users (username, password_hash, email, profile)
                    VALUES (@username, @password_hash, @email, @profile::user_profile)
                    RETURNING id, username, password_hash, email, profile, created_at, updated_at;";

                await using var command = new NpgsqlCommand(sql, connection);
                command.Parameters.AddWithValue("username", requestBody.Username is null ? DBNull.Value : requestBody.Username);
                command.Parameters.AddWithValue("password_hash", requestBody.PasswordHash is null ? DBNull.Value : requestBody.PasswordHash);
                command.Parameters.AddWithValue("email", requestBody.Email is null ? DBNull.Value : requestBody.Email);
                command.Parameters.AddWithValue("profile", requestBody.Profile is null ? DBNull.Value : requestBody.Profile);

                await using var reader = await command.ExecuteReaderAsync(cancellationToken);
                if (!await reader.ReadAsync(cancellationToken))
                {
                    return StatusCode(502, "Banco retornou resposta vazia para a criação de usuario.");
                }

                var user = MapUser(reader);
                return CreatedAtAction(nameof(GetById), new { id = user.Id }, user);
            }
            catch (PostgresException ex) when (ex.SqlState == "23505")
            {
                return Conflict("Email já cadastrado.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Erro ao criar usuario: {ex.Message}");
            }
        }

        [HttpPut("{id:int}")]
        public async Task<ActionResult<User>> Update(int id, [FromBody] User requestBody, CancellationToken cancellationToken)
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
                    UPDATE public.users
                    SET username = @username,
                        password_hash = @password_hash,
                        email = @email,
                        profile = @profile::user_profile,
                        updated_at = CURRENT_TIMESTAMP
                    WHERE id = @id
                    RETURNING id, username, password_hash, email, profile, created_at, updated_at;";

                await using var command = new NpgsqlCommand(sql, connection);
                command.Parameters.AddWithValue("id", id);
                command.Parameters.AddWithValue("username", requestBody.Username is null ? DBNull.Value : requestBody.Username);
                command.Parameters.AddWithValue("password_hash", requestBody.PasswordHash is null ? DBNull.Value : requestBody.PasswordHash);
                command.Parameters.AddWithValue("email", requestBody.Email is null ? DBNull.Value : requestBody.Email);
                command.Parameters.AddWithValue("profile", requestBody.Profile is null ? DBNull.Value : requestBody.Profile);

                await using var reader = await command.ExecuteReaderAsync(cancellationToken);
                if (!await reader.ReadAsync(cancellationToken))
                {
                    return NotFound();
                }

                return Ok(MapUser(reader));
            }
            catch (PostgresException ex) when (ex.SqlState == "23505")
            {
                return Conflict("Email já cadastrado.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Erro ao atualizar usuario: {ex.Message}");
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
                    DELETE FROM public.users
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
                return StatusCode(500, $"Erro ao remover usuario: {ex.Message}");
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

        private static User MapUser(NpgsqlDataReader reader)
        {
            return new User
            {
                Id = reader.GetInt32(reader.GetOrdinal("id")),
                Username = reader.IsDBNull(reader.GetOrdinal("username")) ? null : reader.GetString(reader.GetOrdinal("username")),
                PasswordHash = reader.IsDBNull(reader.GetOrdinal("password_hash")) ? null : reader.GetString(reader.GetOrdinal("password_hash")),
                Email = reader.IsDBNull(reader.GetOrdinal("email")) ? null : reader.GetString(reader.GetOrdinal("email")),
                Profile = reader.IsDBNull(reader.GetOrdinal("profile")) ? null : reader.GetString(reader.GetOrdinal("profile")),
                CreatedAt = reader.IsDBNull(reader.GetOrdinal("created_at")) ? null : reader.GetDateTime(reader.GetOrdinal("created_at")),
                UpdatedAt = reader.IsDBNull(reader.GetOrdinal("updated_at")) ? null : reader.GetDateTime(reader.GetOrdinal("updated_at"))
            };
        }
    }
}
