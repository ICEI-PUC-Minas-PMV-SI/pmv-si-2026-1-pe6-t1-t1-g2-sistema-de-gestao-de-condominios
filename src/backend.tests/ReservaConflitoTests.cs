using backend.Services;

namespace backend.tests;

public class ReservaConflitoTests
{
    private static readonly DateTime T0 = new(2026, 3, 22, 10, 0, 0, DateTimeKind.Utc);

    [Fact]
    public void IntervalosSeSobrepoe_retorna_falso_quando_um_termina_no_inicio_do_outro()
    {
        var aInicio = T0;
        var aFim = T0.AddHours(2);
        var bInicio = aFim;
        var bFim = bInicio.AddHours(1);

        Assert.False(ReservaConflito.IntervalosSeSobrepoe(aInicio, aFim, bInicio, bFim));
    }

    [Fact]
    public void IntervalosSeSobrepoe_retorna_verdadeiro_quando_ha_intersecao()
    {
        var aInicio = T0;
        var aFim = T0.AddHours(2);
        var bInicio = T0.AddHours(1);
        var bFim = T0.AddHours(3);

        Assert.True(ReservaConflito.IntervalosSeSobrepoe(aInicio, aFim, bInicio, bFim));
    }

    [Fact]
    public void IntervalosSeSobrepoe_retorna_verdadeiro_quando_um_contem_o_outro()
    {
        var outerInicio = T0;
        var outerFim = T0.AddHours(4);
        var innerInicio = T0.AddHours(1);
        var innerFim = T0.AddHours(2);

        Assert.True(ReservaConflito.IntervalosSeSobrepoe(outerInicio, outerFim, innerInicio, innerFim));
    }
}
