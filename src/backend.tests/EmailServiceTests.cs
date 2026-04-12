using System.Net;
using System.Net.Http.Headers;
using backend.Services;

namespace backend.tests;

public class EmailServiceTests
{
    [Fact]
    public async Task SendMail_ComApiKey_ConfiguraHeadersEEnviaRequisicao()
    {
        var previous = Environment.GetEnvironmentVariable("SB_PUBLISHABLE_KEY");
        Environment.SetEnvironmentVariable("SB_PUBLISHABLE_KEY", "token_teste");

        try
        {
            var handler = new CaptureHttpMessageHandler();
            var client = new HttpClient(handler);
            var service = new EmailService(client);

            await service.SendMail(123);

            Assert.NotNull(handler.LastRequest);
            Assert.Equal(HttpMethod.Post, handler.LastRequest!.Method);
            Assert.Equal("https://fjodlqgvypumoyvlmsbc.supabase.co/functions/v1/send-encomenda-email", handler.LastRequest.RequestUri!.ToString());
            Assert.Equal("Bearer", handler.LastRequest.Headers.Authorization?.Scheme);
            Assert.Equal("token_teste", handler.LastRequest.Headers.Authorization?.Parameter);
            Assert.Contains("token_teste", handler.LastRequest.Headers.GetValues("apikey"));
            Assert.Contains(handler.LastRequest.Headers.Accept, h => h.MediaType == "application/json");
        }
        finally
        {
            Environment.SetEnvironmentVariable("SB_PUBLISHABLE_KEY", previous);
        }
    }

    [Fact]
    public async Task SendMail_SemApiKey_LancaInvalidOperationException()
    {
        var previous = Environment.GetEnvironmentVariable("SB_PUBLISHABLE_KEY");
        Environment.SetEnvironmentVariable("SB_PUBLISHABLE_KEY", null);

        try
        {
            var service = new EmailService(new HttpClient(new CaptureHttpMessageHandler()));

            await Assert.ThrowsAsync<InvalidOperationException>(() => service.SendMail(1));
        }
        finally
        {
            Environment.SetEnvironmentVariable("SB_PUBLISHABLE_KEY", previous);
        }
    }

    private sealed class CaptureHttpMessageHandler : HttpMessageHandler
    {
        public HttpRequestMessage? LastRequest { get; private set; }

        protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
        {
            LastRequest = request;
            return Task.FromResult(new HttpResponseMessage(HttpStatusCode.OK));
        }
    }
}
