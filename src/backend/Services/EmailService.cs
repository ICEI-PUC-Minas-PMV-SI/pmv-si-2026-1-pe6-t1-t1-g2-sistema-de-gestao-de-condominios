using System.Data;
using Npgsql;
using Resend;
using Microsoft.Extensions.Configuration;
using System.Net.Http.Headers;

namespace backend.Services;

public class EmailService
{
    private readonly HttpClient _httpClient;

    public EmailService(HttpClient httpClient)
    {
        _httpClient = httpClient;
    }
    // public async Task<string?> GetUserEmailById(int userId, CancellationToken cancellationToken)
    // {
    //     const string sql = "SELECT email FROM public.users WHERE id = @userId LIMIT 1;";

    //     await using var connection = new NpgsqlConnection(_connectionString);
    //     await connection.OpenAsync(cancellationToken);

    //     await using var command = new NpgsqlCommand(sql, connection);
    //     command.Parameters.AddWithValue("userId", userId);

    //     var result = await command.ExecuteScalarAsync(cancellationToken);
    //     return result as string;
    // }
    public async Task SendMail(int notificationId)
    {
        _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", Environment.GetEnvironmentVariable("SB_PUBLISHABLE_KEY") ?? throw new InvalidOperationException("SB_PUBLISHABLE_KEY environment variable is not set."));
        _httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
        _httpClient.DefaultRequestHeaders.Add("apikey", Environment.GetEnvironmentVariable("SB_PUBLISHABLE_KEY") ?? throw new InvalidOperationException("SB_PUBLISHABLE_KEY environment variable is not set."));

        var response = await _httpClient.PostAsJsonAsync("https://fjodlqgvypumoyvlmsbc.supabase.co/functions/v1/send-encomenda-email",new {name="deliver-email",notification_id=notificationId});
        if(response.IsSuccessStatusCode){
            Console.WriteLine("Email enviado com sucesso!");
        } else{
            Console.WriteLine($"Falha ao enviar email. Status code: {response.StatusCode} : {response.Content.ReadAsStringAsync()}");
        }
    }
}