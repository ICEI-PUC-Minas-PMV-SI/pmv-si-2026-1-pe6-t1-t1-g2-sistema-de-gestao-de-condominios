using backend.Models;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Npgsql;
using System.Security.Claims;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class UsersController : ControllerBase
    {
        private const string RoleAdministrador = "Administrador";
        private const string RoleMorador = "Morador";

        private readonly IConfiguration _configuration;

        public UsersController(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public class UpdateMeRequest
        {
            public string? Username { get; set; }
            public string? Email { get; set; }
            public string? Password { get; set; }
        }

        [HttpPut("me")]
        [Authorize]
        public async Task<ActionResult<User>> UpdateMe([FromBody] UpdateMeRequest body, CancellationToken cancellationToken)
        {
            var rawUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(rawUserId, out var userId))
                return Unauthorized("Token de autenticação inválido.");

            if (string.IsNullOrWhiteSpace(body.Username) && string.IsNullOrWhiteSpace(body.Email))
                return BadRequest("Informe ao menos nome ou e-mail para atualizar.");

            var (connectionString, errorResult) = GetConnectionString();
            if (errorResult is not null) return errorResult;

            try
            {
                await using var connection = new NpgsqlConnection(connectionString);
                await connection.OpenAsync(cancellationToken);

                var passwordHash = string.IsNullOrWhiteSpace(body.Password)
                    ? null
                    : HashPassword(body.Password);

                const string sql = @"
                    UPDATE public.users
                    SET username = COALESCE(@username, username),
                        email    = COALESCE(@email,    email),
                        password_hash = COALESCE(@password_hash, password_hash),
                        updated_at = CURRENT_TIMESTAMP
                    WHERE id = @id
                    RETURNING id, username, password_hash, email, profile, created_at, updated_at;";

                await using var command = new NpgsqlCommand(sql, connection);
                command.Parameters.AddWithValue("id", userId);
                command.Parameters.AddWithValue("username",      string.IsNullOrWhiteSpace(body.Username) ? DBNull.Value : body.Username.Trim());
                command.Parameters.AddWithValue("email",         string.IsNullOrWhiteSpace(body.Email)    ? DBNull.Value : body.Email.Trim());
                command.Parameters.AddWithValue("password_hash", passwordHash is null ? DBNull.Value : passwordHash);

                await using var reader = await command.ExecuteReaderAsync(cancellationToken);
                if (!await reader.ReadAsync(cancellationToken)) return NotFound();

                return Ok(ToSafeUser(MapUser(reader)));
            }
            catch (PostgresException ex) when (ex.SqlState == "23505")
            {
                return Conflict("E-mail já cadastrado.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Erro ao atualizar perfil: {ex.Message}");
            }
        }

        [HttpGet("me")]
        public async Task<ActionResult<User>> GetCurrentUser(CancellationToken cancellationToken)
        {
            var rawUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(rawUserId, out var userId))
            {
                return Unauthorized("Token de autenticação inválido.");
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
                    SELECT id, username, password_hash, email, profile, created_at, updated_at
                    FROM public.users
                    WHERE id = @id
                    LIMIT 1;";

                await using var command = new NpgsqlCommand(sql, connection);
                command.Parameters.AddWithValue("id", userId);

                await using var reader = await command.ExecuteReaderAsync(cancellationToken);
                if (!await reader.ReadAsync(cancellationToken))
                {
                    return NotFound();
                }

                return Ok(ToSafeUser(MapUser(reader)));
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Erro ao consultar usuario autenticado: {ex.Message}");
            }
        }

        [HttpGet]
        [Authorize(Roles = RoleAdministrador)]
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
                    users.Add(ToSafeUser(MapUser(reader)));
                }

                return Ok(users);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Erro ao consultar usuarios: {ex.Message}");
            }
        }

        [HttpGet("{id:int}")]
        [Authorize(Roles = RoleAdministrador)]
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

                return Ok(ToSafeUser(MapUser(reader)));
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Erro ao consultar usuario: {ex.Message}");
            }
        }

        [AllowAnonymous]
        [HttpPost("auth")]
        public async Task<IActionResult> Authenticate([FromBody] AuthDto model, CancellationToken cancellationToken)
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
                    SELECT id, username, password_hash, email, profile, created_at, updated_at
                    FROM public.users
                    WHERE LOWER(email) = LOWER(@email)
                    LIMIT 1;";

                await using var command = new NpgsqlCommand(sql, connection);
                command.Parameters.AddWithValue("email", model.Email);

                await using var reader = await command.ExecuteReaderAsync(cancellationToken);

                if (!await reader.ReadAsync(cancellationToken))
                {
                    return Unauthorized("Usuário ou senha inválidos.");
                }

                var userId = reader.GetInt32(reader.GetOrdinal("id"));
                var storedHash = reader.GetString(reader.GetOrdinal("password_hash"));
                var profile = reader.GetString(reader.GetOrdinal("profile"));
                var user = ToSafeUser(MapUser(reader));

                if (!BCrypt.Net.BCrypt.Verify(model.Password, storedHash))
                {
                    return Unauthorized("Usuário ou senha inválidos.");
                }

                return Ok(new
                {
                    Token = JwtGen.CreateToken(userId, profile, user.Username, user.Email),
                    User = user
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Erro ao autenticar usuario: {ex.Message}");
            }
        }

        public class SocialAuthDto
        {
            public string Provider { get; set; } = string.Empty; // e.g., "google" | "apple"
            public string ProviderSubject { get; set; } = string.Empty; // sub/id from provider
            public string? Email { get; set; }
            public string? Name { get; set; }
            public bool EmailVerified { get; set; }
        }

        [AllowAnonymous]
        [HttpPost("exchange")]
        public async Task<IActionResult> ExchangeSocial([FromBody] SocialAuthDto payload, CancellationToken cancellationToken)
        {
            if (string.IsNullOrWhiteSpace(payload.Provider) || string.IsNullOrWhiteSpace(payload.ProviderSubject))
            {
                return BadRequest("Provider and provider subject are required.");
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

                // Try to find an existing user by provider subject or by email (if verified)
                const string selectSql = @"
                    SELECT id, username, password_hash, email, profile, created_at, updated_at, provider, provider_subject, email_verified
                    FROM public.users
                    WHERE (provider = @provider AND provider_subject = @provider_subject)
                       OR (LOWER(email) = LOWER(@email) AND @email_verified)
                    LIMIT 1;";

                await using var selectCmd = new NpgsqlCommand(selectSql, connection);
                selectCmd.Parameters.AddWithValue("provider", payload.Provider);
                selectCmd.Parameters.AddWithValue("provider_subject", payload.ProviderSubject);
                selectCmd.Parameters.AddWithValue("email", payload.Email is null ? DBNull.Value : payload.Email);
                selectCmd.Parameters.AddWithValue("email_verified", payload.EmailVerified);

                await using var reader = await selectCmd.ExecuteReaderAsync(cancellationToken);

                if (await reader.ReadAsync(cancellationToken))
                {
                    var userId = reader.GetInt32(reader.GetOrdinal("id"));
                    var user = ToSafeUser(MapUser(reader));

                    // Ensure provider fields are saved if missing
                    await reader.CloseAsync();
                    const string updateSql = @"
                        UPDATE public.users
                        SET provider = COALESCE(provider, @provider),
                            provider_subject = COALESCE(provider_subject, @provider_subject),
                            email_verified = COALESCE(email_verified, @email_verified),
                            updated_at = CURRENT_TIMESTAMP
                        WHERE id = @id;";

                    await using var updateCmd = new NpgsqlCommand(updateSql, connection);
                    updateCmd.Parameters.AddWithValue("provider", payload.Provider);
                    updateCmd.Parameters.AddWithValue("provider_subject", payload.ProviderSubject);
                    updateCmd.Parameters.AddWithValue("email_verified", payload.EmailVerified);
                    updateCmd.Parameters.AddWithValue("id", userId);
                    await updateCmd.ExecuteNonQueryAsync(cancellationToken);

                    return Ok(new { Token = JwtGen.CreateToken(userId, user.Profile ?? "Morador", user.Username, user.Email), User = user });
                }

                await reader.CloseAsync();

                // Create a new user (assign next id)

                const string insertSql = @"
                    INSERT INTO public.users (id, username, password_hash, email, profile, provider, provider_subject, email_verified)
                    SELECT COALESCE(MAX(id), 0) + 1, @username, @password_hash, @email, @profile::user_profile, @provider, @provider_subject, @email_verified
                    FROM public.users
                    RETURNING id, username, password_hash, email, profile, created_at, updated_at, provider, provider_subject, email_verified;";

                var username = string.IsNullOrWhiteSpace(payload.Name) ? payload.Email : payload.Name;
                var normalizedProfile = "Morador";
                var generatedPasswordHash = HashPassword(Guid.NewGuid().ToString());

                await using var insertCmd = new NpgsqlCommand(insertSql, connection);
                insertCmd.Parameters.AddWithValue("username", username is null ? DBNull.Value : (object)username);
                insertCmd.Parameters.AddWithValue("password_hash", generatedPasswordHash ?? (object)DBNull.Value);
                insertCmd.Parameters.AddWithValue("email", payload.Email is null ? DBNull.Value : (object)payload.Email);
                insertCmd.Parameters.AddWithValue("profile", normalizedProfile);
                insertCmd.Parameters.AddWithValue("provider", payload.Provider);
                insertCmd.Parameters.AddWithValue("provider_subject", payload.ProviderSubject);
                insertCmd.Parameters.AddWithValue("email_verified", payload.EmailVerified);

                await using var insertReader = await insertCmd.ExecuteReaderAsync(cancellationToken);
                if (!await insertReader.ReadAsync(cancellationToken))
                {
                    return StatusCode(502, "Banco retornou resposta vazia para criação de usuario social.");
                }

                var newUserId = insertReader.GetInt32(insertReader.GetOrdinal("id"));
                var newUser = ToSafeUser(MapUser(insertReader));

                return Ok(new { Token = JwtGen.CreateToken(newUserId, newUser.Profile ?? "Morador", newUser.Username, newUser.Email), User = newUser });
            }
            catch (PostgresException ex) when (ex.SqlState == "42703")
            {
                // Undefined column (DB not migrated)
                return StatusCode(500, "Colunas de identidade federada não encontradas no banco. Execute o script SQL para adicionar 'provider', 'provider_subject' e 'email_verified'.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Erro ao processar login social: {ex.Message}");
            }
        }

        public class SocialCodeDto
        {
            public string Provider { get; set; } = string.Empty;
            public string Code { get; set; } = string.Empty;
            public string? CodeVerifier { get; set; }
            public string? RedirectUri { get; set; }
        }

        [AllowAnonymous]
        [HttpPost("exchange-code")]
        public async Task<IActionResult> ExchangeCode([FromBody] SocialCodeDto payload, CancellationToken cancellationToken)
        {
            if (string.IsNullOrWhiteSpace(payload.Provider) || string.IsNullOrWhiteSpace(payload.Code))
            {
                return BadRequest("Provider and code are required.");
            }

            try
            {
                if (payload.Provider.Equals("google", StringComparison.OrdinalIgnoreCase))
                {
                    var clientId = Environment.GetEnvironmentVariable("GOOGLE_CLIENT_ID");
                    var clientSecret = Environment.GetEnvironmentVariable("GOOGLE_CLIENT_SECRET");
                    if (string.IsNullOrWhiteSpace(clientId))
                    {
                        return StatusCode(500, "GOOGLE_CLIENT_ID not configured on server.");
                    }

                    using var http = new HttpClient();
                    var tokenRequest = new Dictionary<string, string>
                    {
                        { "code", payload.Code },
                        { "client_id", clientId },
                        { "grant_type", "authorization_code" },
                        { "redirect_uri", payload.RedirectUri ?? string.Empty },
                    };
                    if (!string.IsNullOrWhiteSpace(payload.CodeVerifier))
                    {
                        tokenRequest.Add("code_verifier", payload.CodeVerifier);
                    }
                    if (!string.IsNullOrWhiteSpace(clientSecret))
                    {
                        tokenRequest.Add("client_secret", clientSecret);
                    }

                    var resp = await http.PostAsync("https://oauth2.googleapis.com/token", new FormUrlEncodedContent(tokenRequest), cancellationToken);
                    if (!resp.IsSuccessStatusCode)
                    {
                        var txt = await resp.Content.ReadAsStringAsync(cancellationToken);
                        return StatusCode((int)resp.StatusCode, $"Token exchange failed: {txt}");
                    }

                    var tokenJson = System.Text.Json.JsonDocument.Parse(await resp.Content.ReadAsStringAsync(cancellationToken));
                    var idToken = tokenJson.RootElement.TryGetProperty("id_token", out var idt) ? idt.GetString() : null;
                    string? providerSub = null;
                    string? email = null;
                    string? name = null;
                    bool emailVerified = false;

                    if (!string.IsNullOrWhiteSpace(idToken))
                    {
                        // Validate id_token using Google's tokeninfo endpoint
                        var infoResp = await http.GetAsync($"https://oauth2.googleapis.com/tokeninfo?id_token={idToken}", cancellationToken);
                        if (!infoResp.IsSuccessStatusCode)
                        {
                            var txt = await infoResp.Content.ReadAsStringAsync(cancellationToken);
                            return StatusCode((int)infoResp.StatusCode, $"id_token validation failed: {txt}");
                        }

                        var infoJson = System.Text.Json.JsonDocument.Parse(await infoResp.Content.ReadAsStringAsync(cancellationToken));
                        providerSub = infoJson.RootElement.TryGetProperty("sub", out var subp) ? subp.GetString() : null;
                        email = infoJson.RootElement.TryGetProperty("email", out var emp) ? emp.GetString() : null;
                        name = infoJson.RootElement.TryGetProperty("name", out var np) ? np.GetString() : null;
                        emailVerified = infoJson.RootElement.TryGetProperty("email_verified", out var evp) && evp.GetBoolean();
                    }

                    if (providerSub is null)
                    {
                        return StatusCode(500, "Could not determine provider subject from id_token.");
                    }

                    // Delegate to existing social upsert logic
                    var socialPayload = new SocialAuthDto
                    {
                        Provider = "google",
                        ProviderSubject = providerSub,
                        Email = email,
                        Name = name,
                        EmailVerified = emailVerified
                    };

                    return await ExchangeSocial(socialPayload, cancellationToken);
                }

                return BadRequest("Provider not supported for code exchange.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Erro ao processar exchange-code: {ex.Message}");
            }
        }

        [AllowAnonymous]
        [HttpPost]
        public async Task<ActionResult<User>> Create([FromBody] User requestBody, CancellationToken cancellationToken)
        {
            if (!ModelState.IsValid)
            {
                return ValidationProblem(ModelState);
            }

            var normalizedProfile = NormalizeProfile(requestBody.Profile);
            if (normalizedProfile is null)
            {
                return BadRequest("Perfil inválido. Valores aceitos: 'Administrador' ou 'Morador'.");
            }

            // Auto-cadastro anônimo só pode criar Morador.
            if (string.Equals(normalizedProfile, RoleAdministrador, StringComparison.OrdinalIgnoreCase)
                && !User.IsInRole(RoleAdministrador))
            {
                return Forbid();
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
                    INSERT INTO public.users (id, username, password_hash, email, profile)
                    SELECT COALESCE(MAX(id), 0) + 1, @username, @password_hash, @email, @profile::user_profile
                    FROM public.users
                    RETURNING id, username, password_hash, email, profile, created_at, updated_at;";

                var passwordHash = string.IsNullOrWhiteSpace(requestBody.PasswordHash)
                    ? null
                    : HashPassword(requestBody.PasswordHash);

                await using var command = new NpgsqlCommand(sql, connection);
                command.Parameters.AddWithValue("username", requestBody.Username is null ? DBNull.Value : requestBody.Username);
                command.Parameters.AddWithValue("password_hash", passwordHash is null ? DBNull.Value : passwordHash);
                command.Parameters.AddWithValue("email", requestBody.Email is null ? DBNull.Value : requestBody.Email);
                command.Parameters.AddWithValue("profile", normalizedProfile);

                await using var reader = await command.ExecuteReaderAsync(cancellationToken);
                if (!await reader.ReadAsync(cancellationToken))
                {
                    return StatusCode(502, "Banco retornou resposta vazia para a criação de usuario.");
                }

                var user = ToSafeUser(MapUser(reader));
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
        [Authorize(Roles = RoleAdministrador)]
        public async Task<ActionResult<User>> Update(int id, [FromBody] User requestBody, CancellationToken cancellationToken)
        {
            if (!ModelState.IsValid)
            {
                return ValidationProblem(ModelState);
            }

            var normalizedProfile = NormalizeProfile(requestBody.Profile);
            if (normalizedProfile is null)
            {
                return BadRequest("Perfil inválido. Valores aceitos: 'Administrador' ou 'Morador'.");
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
                        password_hash = COALESCE(@password_hash, password_hash),
                        email = @email,
                        profile = @profile::user_profile,
                        updated_at = CURRENT_TIMESTAMP
                    WHERE id = @id
                    RETURNING id, username, password_hash, email, profile, created_at, updated_at;";

                var passwordHash = string.IsNullOrWhiteSpace(requestBody.PasswordHash)
                    ? null
                    : HashPassword(requestBody.PasswordHash);

                await using var command = new NpgsqlCommand(sql, connection);
                command.Parameters.AddWithValue("id", id);
                command.Parameters.AddWithValue("username", requestBody.Username is null ? DBNull.Value : requestBody.Username);
                command.Parameters.AddWithValue("password_hash", passwordHash is null ? DBNull.Value : passwordHash);
                command.Parameters.AddWithValue("email", requestBody.Email is null ? DBNull.Value : requestBody.Email);
                command.Parameters.AddWithValue("profile", normalizedProfile);

                await using var reader = await command.ExecuteReaderAsync(cancellationToken);
                if (!await reader.ReadAsync(cancellationToken))
                {
                    return NotFound();
                }

                return Ok(ToSafeUser(MapUser(reader)));
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
        [Authorize(Roles = RoleAdministrador)]
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
                UpdatedAt = reader.IsDBNull(reader.GetOrdinal("updated_at")) ? null : reader.GetDateTime(reader.GetOrdinal("updated_at")),
                Provider = TryGetStringColumn(reader, "provider"),
                ProviderSubject = TryGetStringColumn(reader, "provider_subject"),
                EmailVerified = TryGetBoolColumn(reader, "email_verified")
            };
        }

        private static string? TryGetStringColumn(NpgsqlDataReader reader, string columnName)
        {
            try
            {
                var ord = reader.GetOrdinal(columnName);
                return reader.IsDBNull(ord) ? null : reader.GetString(ord);
            }
            catch
            {
                return null;
            }
        }

        private static bool? TryGetBoolColumn(NpgsqlDataReader reader, string columnName)
        {
            try
            {
                var ord = reader.GetOrdinal(columnName);
                return reader.IsDBNull(ord) ? null : reader.GetBoolean(ord);
            }
            catch
            {
                return null;
            }
        }

        private static User ToSafeUser(User user)
        {
            user.PasswordHash = null;
            return user;
        }

        private static string HashPassword(string rawPassword)
        {
            return BCrypt.Net.BCrypt.HashPassword(rawPassword);
        }

        private static string? NormalizeProfile(string? profile)
        {
            if (string.IsNullOrWhiteSpace(profile))
            {
                return null;
            }

            if (string.Equals(profile, RoleAdministrador, StringComparison.OrdinalIgnoreCase))
            {
                return RoleAdministrador;
            }

            if (string.Equals(profile, RoleMorador, StringComparison.OrdinalIgnoreCase))
            {
                return RoleMorador;
            }

            return null;
        }
    }
}
