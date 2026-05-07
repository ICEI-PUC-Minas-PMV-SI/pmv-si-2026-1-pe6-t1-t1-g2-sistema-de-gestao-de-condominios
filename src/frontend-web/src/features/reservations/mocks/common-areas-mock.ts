import type { CommonArea } from "../types/common-area";

export const COMMON_AREAS_MOCK: CommonArea[] = [
  {
    id: 1,
    name: "Salao de Festas",
    capacity: 60,
    rules: "Permitido ate as 22h.",
  },
  {
    id: 2,
    name: "Churrasqueira",
    capacity: 20,
    rules: "Necessario agendar com 24h de antecedencia.",
  },
  {
    id: 3,
    name: "Quadra Poliesportiva",
    capacity: 30,
    rules: "Uso permitido entre 08h e 21h.",
  },
];
