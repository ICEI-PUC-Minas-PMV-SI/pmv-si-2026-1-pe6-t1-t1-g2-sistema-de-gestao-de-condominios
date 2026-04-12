using System.Security.Claims;
using backend.Controllers;
using backend.Models;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.FileProviders;

namespace backend.tests;

public class OccurrencesControllerTests
{
    [Fact]
    public async Task Create_SemUsuarioAutenticado_RetornaUnauthorized()
    {
        var controller = CreateController();

        var result = await controller.Create(new CreateOccurrenceRequest { Title = "t", Description = "d" }, CancellationToken.None);

        Assert.IsType<UnauthorizedObjectResult>(result.Result);
    }

    [Fact]
    public async Task Create_ComCamposObrigatoriosAusentes_RetornaBadRequest()
    {
        var controller = CreateControllerWithUser(5);

        var result = await controller.Create(new CreateOccurrenceRequest { Title = "", Description = "" }, CancellationToken.None);

        var badRequest = Assert.IsType<BadRequestObjectResult>(result.Result);
        Assert.Equal("Título e descrição são obrigatórios", badRequest.Value);
    }

    [Fact]
    public async Task UploadImage_TipoInvalido_RetornaBadRequest()
    {
        var controller = CreateControllerWithUser(5);
        await using var stream = new MemoryStream(new byte[] { 1, 2, 3 });
        IFormFile file = new FormFile(stream, 0, stream.Length, "file", "img.txt")
        {
            Headers = new HeaderDictionary(),
            ContentType = "text/plain"
        };

        var result = await controller.UploadImage(1, file, CancellationToken.None);

        var badRequest = Assert.IsType<BadRequestObjectResult>(result.Result);
        Assert.Contains("Tipo de arquivo não permitido", badRequest.Value?.ToString());
    }

    [Fact]
    public async Task GetById_SemConnectionString_Retorna500()
    {
        var controller = CreateControllerWithUser(10);

        var result = await controller.GetById(1, CancellationToken.None);

        var objectResult = Assert.IsType<ObjectResult>(result.Result);
        Assert.Equal(StatusCodes.Status500InternalServerError, objectResult.StatusCode);
    }

    private static OccurrencesController CreateController()
    {
        return new OccurrencesController(new ConfigurationBuilder().Build(), new TestWebHostEnvironment())
        {
            ControllerContext = new ControllerContext { HttpContext = new DefaultHttpContext() }
        };
    }

    private static OccurrencesController CreateControllerWithUser(int userId)
    {
        var identity = new ClaimsIdentity(new[] { new Claim(ClaimTypes.NameIdentifier, userId.ToString()) }, "test");
        return new OccurrencesController(new ConfigurationBuilder().Build(), new TestWebHostEnvironment())
        {
            ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = new ClaimsPrincipal(identity) }
            }
        };
    }

    private sealed class TestWebHostEnvironment : IWebHostEnvironment
    {
        public string ApplicationName { get; set; } = "tests";
        public IFileProvider WebRootFileProvider { get; set; } = default!;
        public string WebRootPath { get; set; } = Path.GetTempPath();
        public string EnvironmentName { get; set; } = "Development";
        public string ContentRootPath { get; set; } = Path.GetTempPath();
        public IFileProvider ContentRootFileProvider { get; set; } = default!;
    }
}
