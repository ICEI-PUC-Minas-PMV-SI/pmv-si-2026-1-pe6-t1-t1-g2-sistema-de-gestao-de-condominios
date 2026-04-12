using System.IdentityModel.Tokens.Jwt;
using backend.Services;

namespace backend.tests;

public class JwtGenTests
{
    [Fact]
    public void CreateToken_GeraTokenComClaimsEsperadas()
    {
        JwtGen.secret_key = "01234567890123456789012345678901";

        var token = JwtGen.CreateToken(42, "Administrador");
        var jwt = new JwtSecurityTokenHandler().ReadJwtToken(token);

        Assert.Contains(jwt.Claims, c => c.Value == "42" && (c.Type.Contains("nameidentifier", StringComparison.OrdinalIgnoreCase) || c.Type.Equals("nameid", StringComparison.OrdinalIgnoreCase)));
        Assert.Contains(jwt.Claims, c => c.Value == "Administrador" && c.Type.Contains("role", StringComparison.OrdinalIgnoreCase));
        Assert.True(jwt.ValidTo > DateTime.UtcNow.AddHours(7));
    }
}
