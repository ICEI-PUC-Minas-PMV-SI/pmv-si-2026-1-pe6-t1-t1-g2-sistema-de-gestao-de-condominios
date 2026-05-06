export type OccurrenceStatus = 'Aberto' | 'Em Andamento' | 'Resolvido' | 'Fechado';

export type OccurrenceApiRecord = {
  id: number;
  userId: number;
  title: string;
  description: string;
  status: OccurrenceStatus;
  imageUrl?: string; // ADICIONADO
  createdAt: string;
  updatedAt: string;
};

export type Occurrence = {
  id: number;
  title: string;
  description: string;
  status: OccurrenceStatus;
  imageUrl?: string; // ADICIONADO
  createdAt: string;
};

export type CreateOccurrenceForm = {
  title: string;
  description: string;
  status?: OccurrenceStatus;
  imageUrl?: string;
};

export type OccurrenceStats = {
  totalAberto: number;
  emAnalise: number;
  resolvidos: number;
};