using backend.Models;
using Npgsql;
using Npgsql.NameTranslation;

var builder = WebApplication.CreateBuilder(args);

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

// Mapeia o enum do Postgres antes de construir o DataSource
var dataSourceBuilder = new NpgsqlDataSourceBuilder(connectionString);
dataSourceBuilder.MapEnum<ReservationStatus>("reservation_status");
dataSourceBuilder.MapEnum<ReservationStatus>("reservation_status", nameTranslator: new NpgsqlNullNameTranslator());

var dataSource = dataSourceBuilder.Build();

// DataSource compartilhado por todos os controllers
builder.Services.AddSingleton(dataSource);

// Controllers com o converter do enum no JSON
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new ReservationStatusJsonConverter());
    });

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();

    var logger = app.Services.GetRequiredService<ILoggerFactory>().CreateLogger("Startup");
    foreach (var url in app.Urls)
    {
        logger.LogInformation("Swagger disponível em: {SwaggerUrl}", $"{url.TrimEnd('/')}/swagger");
    }
}
else
{
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

app.Run();

public partial class Program { }