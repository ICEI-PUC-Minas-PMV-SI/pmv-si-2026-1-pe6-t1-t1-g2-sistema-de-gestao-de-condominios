export type OccurrenceStatus = 'Aberto' | 'Em Análise' | 'Finalizado' | 'Resolvido';

export type OccurrenceApiRecord = {
  id: number;
  userId: number;
  title: string;
  description: string;
  status: OccurrenceStatus;
  createdAt: string;
  updatedAt: string;
};

export type Occurrence = {
  id: number;
  title: string;
  description: string;
  status: OccurrenceStatus;
  createdAt: string;
};

export type CreateOccurrenceForm = {
  title: string;
  description: string;
};

export type OccurrenceStats = {
  totalAberto: number;
  emAnalise: number;
  resolvidos: number;
};
