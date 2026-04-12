using System.Security.Claims;
using backend.Controllers;
using backend.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;

namespace backend.tests;

public class UsersControllerTests
{
    [Fact]
    public async Task GetAll_SemConnectionString_Retorna500()
    {
        var controller = new UsersController(new ConfigurationBuilder().Build());

        var result = await controller.GetAll(CancellationToken.None);

        var objectResult = Assert.IsType<ObjectResult>(result.Result);
        Assert.Equal(StatusCodes.Status500InternalServerError, objectResult.StatusCode);
    }

    [Fact]
    public async Task Create_ComPerfilInvalido_RetornaBadRequest()
    {
        var controller = new UsersController(new ConfigurationBuilder().Build());
        var request = new User { Profile = "Invalido" };

        var result = await controller.Create(request, CancellationToken.None);

        var badRequest = Assert.IsType<BadRequestObjectResult>(result.Result);
        Assert.Contains("Perfil inválido", badRequest.Value?.ToString());
    }

    [Fact]
    public async Task Create_AnonimoComPerfilAdministrador_RetornaForbid()
    {
        var controller = new UsersController(new ConfigurationBuilder().Build())
        {
            ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext
                {
                    User = new ClaimsPrincipal(new ClaimsIdentity())
                }
            }
        };

        var result = await controller.Create(new User { Profile = "Administrador" }, CancellationToken.None);

        Assert.IsType<ForbidResult>(result.Result);
    }

    [Fact]
    public async Task Create_ModelStateInvalido_RetornaValidationProblem()
    {
        var controller = new UsersController(new ConfigurationBuilder().Build());
        controller.ModelState.AddModelError("x", "erro");

        var result = await controller.Create(new User { Profile = "Morador" }, CancellationToken.None);

        Assert.IsType<ObjectResult>(result.Result);
    }
}
