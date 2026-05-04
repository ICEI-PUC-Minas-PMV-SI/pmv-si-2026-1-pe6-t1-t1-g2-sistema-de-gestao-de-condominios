import { Button } from "#/components/ui";

type OccurrencesPageHeaderProps = {
  onCreateClick: () => void;
};

export function OccurrencesPageHeader({
  onCreateClick,
}: OccurrencesPageHeaderProps) {
  return (
    <section className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
      <div>
        <h1 className="text-5xl font-black tracking-tight text-slate-800">
          Minhas Ocorrências
        </h1>
        <p className="mt-2 max-w-2xl text-xl text-slate-500">
          Acompanhe e registre solicitações de manutenção ou limpeza.
        </p>
      </div>

      <Button color="primary" size="lg" onClick={onCreateClick}>
        Nova Ocorrência
      </Button>
    </section>
  );
}
