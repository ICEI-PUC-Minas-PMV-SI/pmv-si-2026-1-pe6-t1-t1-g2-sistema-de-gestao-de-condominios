using backend.Controllers;
using backend.Data;
using backend.Models;
using backend.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.tests;

public class ReservasControllerTests
{
    [Fact]
    public async Task Create_ComAreaInvalida_RetornaBadRequest()
    {
        var controller = CreateController();

        var request = new ReservaAreaComum
        {
            AreaComumId = 0,
            MoradorId = 10,
            DataHoraInicio = DateTime.UtcNow,
            DataHoraFim = DateTime.UtcNow.AddHours(1),
            Status = ReservationStatus.Pendente
        };

        var result = await controller.Create(request, CancellationToken.None);

        var badRequest = Assert.IsType<BadRequestObjectResult>(result.Result);
        Assert.Equal("AreaComumId deve ser maior que zero.", badRequest.Value);
    }

    [Fact]
    public async Task Create_ComPeriodoInvalido_RetornaBadRequest()
    {
        var controller = CreateController();

        var start = DateTime.UtcNow;
        var request = new ReservaAreaComum
        {
            AreaComumId = 1,
            MoradorId = 10,
            DataHoraInicio = start,
            DataHoraFim = start,
            Status = ReservationStatus.Pendente
        };

        var result = await controller.Create(request, CancellationToken.None);

        var badRequest = Assert.IsType<BadRequestObjectResult>(result.Result);
        Assert.Equal("DataHoraFim deve ser maior que DataHoraInicio.", badRequest.Value);
    }

    [Fact]
    public async Task GetAll_SemProviderConfigurado_Retorna500()
    {
        var controller = CreateController();

        var result = await controller.GetAll(CancellationToken.None);

        var objectResult = Assert.IsType<ObjectResult>(result.Result);
        Assert.Equal(StatusCodes.Status500InternalServerError, objectResult.StatusCode);
    }

    [Fact]
    public async Task Create_ModelStateInvalido_RetornaValidationProblem()
    {
        var controller = CreateController();
        controller.ModelState.AddModelError("x", "erro");

        var result = await controller.Create(new ReservaAreaComum(), CancellationToken.None);

        Assert.IsType<ObjectResult>(result.Result);
    }

    private static ReservasController CreateController()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>().Options;
        var context = new ApplicationDbContext(options);
        var emailService = new EmailService(new HttpClient());
        return new ReservasController(context, emailService);
    }
}
