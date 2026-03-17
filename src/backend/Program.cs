
var builder = WebApplication.CreateBuilder(args);

// Swagger UI Documentation
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Add services to the container.
builder.Services.AddControllersWithViews();
builder.Services.AddHttpClient();

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

app.UseAuthorization();

app.MapStaticAssets();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}")
    .WithStaticAssets();

app.MapControllers();

app.Run();
