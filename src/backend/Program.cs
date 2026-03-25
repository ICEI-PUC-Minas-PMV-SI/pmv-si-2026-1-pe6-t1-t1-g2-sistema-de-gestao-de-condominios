using backend.Data;
using backend.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Npgsql;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Microsoft.AspNetCore.Mvc;
using backend.Services;
using Microsoft.OpenApi;

var builder = WebApplication.CreateBuilder(args);

// Se DefaultConnection estiver vazio, usa DATABASE_URL ou SUPABASE_DB_URL (URI postgresql://... do Supabase).
// Isso alinha com o "Direct connection" do painel. Variaveis de ambiente no Windows: DATABASE_URL ou
// ConnectionStrings__DefaultConnection (com dois sublinhados).
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
builder.Services.AddSwaggerGen(c =>
{
    c.AddSecurityDefinition("Bearer",new OpenApiSecurityScheme
    {
       In=ParameterLocation.Header,
       Description="Please enter a valid token",
       Name="Authorization",
       Type=SecuritySchemeType.ApiKey,
       Scheme="Bearer" 
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference=new OpenApiReference
                {
                    Type=ReferenceType.SecurityScheme,
                    Id="Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// Add authentication services (JWT Bearer)
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
    options.RequireHttpsMetadata = false; // Em produção, isso deve ser true.
    options.TokenValidationParameters = new Microsoft.IdentityModel.Tokens.TokenValidationParameters()
    {
        ValidateIssuer=false,
        ValidateAudience=false,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(signInKey))
    };

});

// Add services to the container.
builder.Services.AddControllersWithViews();
builder.Services.AddHttpClient();

// Enum nativo PostgreSQL (coluna status em public.reservations). Nome do tipo deve coincidir com o Supabase.
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

app.Lifetime.ApplicationStarted.Register(() =>
{
    if (!app.Environment.IsDevelopment())
    {
        return;
    }

    var logger = app.Services.GetRequiredService<ILoggerFactory>().CreateLogger("Startup");
    foreach (var url in app.Urls)
    {
        logger.LogInformation("Swagger disponível em: {SwaggerUrl}", $"{url.TrimEnd('/')}/swagger");
    }
});

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseRouting();

// Utilizar autenticação e autorização.
app.UseAuthentication();
app.UseAuthorization();

app.MapStaticAssets();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}")
    .WithStaticAssets();

app.MapControllers();

app.Run();
