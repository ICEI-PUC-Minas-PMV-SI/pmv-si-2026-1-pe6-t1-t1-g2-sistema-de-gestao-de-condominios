using backend.Data;
using backend.Models;
using backend.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.FileProviders;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
using Npgsql;
using Resend;
using System.Text;
using Microsoft.Extensions.FileProviders;

var builder = WebApplication.CreateBuilder(args);

// Configuração inicial para inciar serviço de email (Resend).
builder.Services.AddOptions();
builder.Services.AddHttpClient<ResendClient>();
builder.Services.Configure<ResendClientOptions>(opts =>
{
    opts.ApiToken = Environment.GetEnvironmentVariable("RESEND_API_KEY") ?? throw new InvalidOperationException("RESEND_API_KEY environment variable is not set.");
});
builder.Services.AddTransient<IResend, ResendClient>();
builder.Services.AddTransient<EmailService>();

// Configuração de Conexão com o Banco
var defaultConnection = builder.Configuration.GetConnectionString("DefaultConnection");
if (string.IsNullOrWhiteSpace(defaultConnection))
{
    var fromSupabaseUrl = builder.Configuration["DATABASE_URL"] ?? builder.Configuration["SUPABASE_DB_URL"];
    if (!string.IsNullOrWhiteSpace(fromSupabaseUrl))
    {
        builder.Configuration.AddInMemoryCollection(
            new Dictionary<string, string?> { ["ConnectionStrings:DefaultConnection"] = fromSupabaseUrl.Trim() });
    }
}

// Swagger UI Documentation
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c => {
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        In = ParameterLocation.Header,
        Description = "Insira um token para logar",
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        BearerFormat = "JWT",
        Scheme = "bearer"
    });
});

// Autenticação JWT
var signInKey = Environment.GetEnvironmentVariable("JWT_SECRET");
if (string.IsNullOrEmpty(signInKey))
{
    throw new InvalidOperationException("JWT_SECRET environment variable is not set.");
}
JwtGen.secret_key = signInKey;
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
}).AddJwtBearer(options =>
{
    options.SaveToken = true;
    options.RequireHttpsMetadata = false;
    options.TokenValidationParameters = new Microsoft.IdentityModel.Tokens.TokenValidationParameters()
    {
        ValidateIssuer = false,
        ValidateAudience = false,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(signInKey))
    };
});

builder.Services.AddControllersWithViews();
builder.Services.AddHttpClient();

// Configurar CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// Configurar upload de arquivos
builder.Services.Configure<FormOptions>(options =>
{
    options.MultipartBodyLengthLimit = 104857600; // 100 MB
});

// Configuração DbContext e Enum Npgsql
var resolvedConnectionString = builder.Configuration.GetConnectionString("DefaultConnection");
if (!string.IsNullOrWhiteSpace(resolvedConnectionString))
{
    var dataSourceBuilder = new NpgsqlDataSourceBuilder(resolvedConnectionString);
    dataSourceBuilder.MapEnum<ReservationStatus>("reservation_status");
    var npgsqlDataSource = dataSourceBuilder.Build();
    builder.Services.AddSingleton(npgsqlDataSource);
    builder.Services.AddDbContext<ApplicationDbContext>(options =>
        options.UseNpgsql(npgsqlDataSource));
}
else
{
    builder.Services.AddDbContext<ApplicationDbContext>(options =>
        options.UseNpgsql(resolvedConnectionString));
}

var app = builder.Build();

// Apply DB bootstrap SQL (idempotent) if available
try
{
    var resolvedConnectionStringForApply = builder.Configuration.GetConnectionString("DefaultConnection");
    if (!string.IsNullOrWhiteSpace(resolvedConnectionStringForApply))
    {
        var sqlPath = Path.Combine(Directory.GetCurrentDirectory(), "sql", "add_federated_identity.sql");
        if (File.Exists(sqlPath))
        {
            var sql = File.ReadAllText(sqlPath);
            try
            {
                using var conn = new Npgsql.NpgsqlConnection(resolvedConnectionStringForApply);
                conn.Open();
                using var cmd = conn.CreateCommand();
                cmd.CommandText = sql;
                cmd.ExecuteNonQuery();
            }
            catch (Exception ex)
            {
                var logger = app.Services.GetService<ILoggerFactory>()?.CreateLogger("Startup");
                logger?.LogWarning("Could not apply DB bootstrap SQL: {0}", ex.Message);
            }
        }
    }
}
catch
{
    // swallow any errors here to avoid blocking startup
}

app.Lifetime.ApplicationStarted.Register(() =>
{
    if (!app.Environment.IsDevelopment()) return;

    var logger = app.Services.GetRequiredService<ILoggerFactory>().CreateLogger("Startup");
    foreach (var url in app.Urls)
    {
        logger.LogInformation("Swagger disponível em: {SwaggerUrl}", $"{url.TrimEnd('/')}/swagger");
    }
});

// --- CONFIGURAÇÃO DO PIPELINE DE REQUISIÇÕES ---

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
else
{
    app.UseExceptionHandler("/Home/Error");
    app.UseHsts();
    // Ativa o redirecionamento HTTPS apenas quando NÃO for ambiente de desenvolvimento
    app.UseHttpsRedirection();
}

app.UseStaticFiles();
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(
        Path.Combine(builder.Environment.ContentRootPath, "uploads")),
    RequestPath = "/uploads"
});
app.UseCors("AllowAll");
app.UseRouting();

app.UseAuthentication();
app.UseAuthorization();

app.MapStaticAssets();
app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}")
    .WithStaticAssets();

app.MapControllers();

app.Run();

public partial class Program { }