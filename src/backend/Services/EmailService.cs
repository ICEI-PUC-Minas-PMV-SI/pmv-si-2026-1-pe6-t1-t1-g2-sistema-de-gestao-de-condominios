using System.Data;
using Npgsql;
using Resend;
using Microsoft.Extensions.Configuration;

namespace backend.Services;

public class EmailService
{
    private readonly IResend _resendClient;
    private readonly string _connectionString;

    public EmailService(IResend resendClient, IConfiguration configuration)
    {
        _resendClient = resendClient;
        _connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("Configure ConnectionStrings:DefaultConnection no appsettings ou variaveis de ambiente.");
    }
    public async Task<string?> GetUserEmailById(int userId, CancellationToken cancellationToken)
    {
        const string sql = "SELECT email FROM public.users WHERE id = @userId LIMIT 1;";

        await using var connection = new NpgsqlConnection(_connectionString);
        await connection.OpenAsync(cancellationToken);

        await using var command = new NpgsqlCommand(sql, connection);
        command.Parameters.AddWithValue("userId", userId);

        var result = await command.ExecuteScalarAsync(cancellationToken);
        return result as string;
    }
    public Task SendMail(string email,string sub,string content)
    {
        var message = new EmailMessage();
        message.From = "condo <condo@sensodine.app>";
        message.To.Add(email);
        message.Subject = sub;
        message.TextBody = content;
        return _resendClient.EmailSendAsync(message);
    }
}