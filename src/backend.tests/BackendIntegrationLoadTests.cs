using System.Collections.Concurrent;
using System.Diagnostics;
using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;

namespace backend.tests;

public sealed class BackendApiFactory : WebApplicationFactory<Program>
{
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        Environment.SetEnvironmentVariable("JWT_SECRET", "test-secret-key-with-32-bytes-1234");
        Environment.SetEnvironmentVariable("RESEND_API_KEY", "test-api-key");

        builder.UseEnvironment("Development");
        builder.ConfigureAppConfiguration((_, configBuilder) =>
        {
            configBuilder.AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["ConnectionStrings:DefaultConnection"] = "Host=localhost;Port=5432;Database=backend_test;Username=test;Password=test"
            });
        });
    }
}

public class BackendIntegrationLoadTests : IClassFixture<BackendApiFactory>
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web)
    {
        PropertyNameCaseInsensitive = true
    };

    private readonly HttpClient _client;

    public BackendIntegrationLoadTests(BackendApiFactory factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task Integracao_CreateUser_ComPerfilInvalido_RetornaBadRequest()
    {
        var payload = new
        {
            username = "usuario-int",
            password_hash = "123456",
            email = "usuario-int@test.local",
            profile = "PerfilInvalido"
        };

        using var response = await _client.PostAsJsonAsync("/api/Users", payload);
        var body = await response.Content.ReadAsStringAsync();

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Contains("Perfil inválido", body, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task Integracao_GetUsers_SemToken_RetornaUnauthorized()
    {
        using var response = await _client.GetAsync("/api/Users");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Carga_CreateUser_ComPerfilInvalido_ColetaThroughputLatenciaEErros()
    {
        const int totalRequests = 200;
        const int concurrency = 20;

        var durationsMs = new ConcurrentBag<double>();
        var statusCodes = new ConcurrentBag<int>();
        var errors = 0;

        var started = Stopwatch.StartNew();
        var semaphore = new SemaphoreSlim(concurrency);

        var tasks = Enumerable.Range(0, totalRequests).Select(async i =>
        {
            await semaphore.WaitAsync();
            try
            {
                var payload = new
                {
                    username = $"usuario-carga-{i}",
                    password_hash = "123456",
                    email = $"usuario-carga-{i}@test.local",
                    profile = "PerfilInvalido"
                };

                var sw = Stopwatch.StartNew();
                using var response = await _client.PostAsJsonAsync("/api/Users", payload);
                sw.Stop();

                durationsMs.Add(sw.Elapsed.TotalMilliseconds);
                statusCodes.Add((int)response.StatusCode);

                if (response.StatusCode != HttpStatusCode.BadRequest)
                {
                    Interlocked.Increment(ref errors);
                }
            }
            catch
            {
                Interlocked.Increment(ref errors);
            }
            finally
            {
                semaphore.Release();
            }
        });

        await Task.WhenAll(tasks);
        started.Stop();

        var latencies = durationsMs.OrderBy(x => x).ToArray();
        Assert.NotEmpty(latencies);

        var totalSeconds = started.Elapsed.TotalSeconds;
        var throughput = totalRequests / totalSeconds;
        var p50 = Percentile(latencies, 50);
        var p95 = Percentile(latencies, 95);
        var p99 = Percentile(latencies, 99);
        var avg = latencies.Average();
        var max = latencies.Max();

        var metrics = new
        {
            totalRequests,
            concurrency,
            totalSeconds,
            throughputRps = throughput,
            errors,
            avgMs = avg,
            p50Ms = p50,
            p95Ms = p95,
            p99Ms = p99,
            maxMs = max,
            distinctStatusCodes = statusCodes.Distinct().OrderBy(c => c).ToArray()
        };

        var metricsJson = JsonSerializer.Serialize(metrics, JsonOptions);
        Console.WriteLine($"[LOAD_METRICS] {metricsJson}");

        Assert.Equal(0, errors);
    }

    private static double Percentile(double[] sortedValues, int percentile)
    {
        if (sortedValues.Length == 0)
        {
            return 0;
        }

        var rank = (percentile / 100d) * (sortedValues.Length - 1);
        var lower = (int)Math.Floor(rank);
        var upper = (int)Math.Ceiling(rank);

        if (lower == upper)
        {
            return sortedValues[lower];
        }

        var weight = rank - lower;
        return sortedValues[lower] + (sortedValues[upper] - sortedValues[lower]) * weight;
    }
}
