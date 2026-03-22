namespace backend.Services;

/// <summary>
/// Regras de sobreposição de intervalos de tempo para reservas na mesma área.
/// Mantém a mesma semântica do SQL usado em ReservasController.
/// </summary>
public static class ReservaConflito
{
    /// <summary>
    /// Dois intervalos [inicio, fim] se sobrepõem se houver qualquer interseção estrita
    /// (equivalente a: inicioA &lt; fimB &amp;&amp; inicioB &lt; fimA).
    /// </summary>
    public static bool IntervalosSeSobrepoe(DateTime inicioA, DateTime fimA, DateTime inicioB, DateTime fimB)
    {
        return inicioA < fimB && inicioB < fimA;
    }
}
