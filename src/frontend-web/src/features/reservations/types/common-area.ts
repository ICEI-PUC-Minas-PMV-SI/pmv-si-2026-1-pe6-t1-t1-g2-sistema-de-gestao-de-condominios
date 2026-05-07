export type CommonAreaApiRecord = {
  id?: number;
  Id?: number;
  name?: string;
  Name?: string;
  capacity?: number;
  Capacity?: number;
  rules?: string | null;
  Rules?: string | null;
};

export type CommonArea = {
  id: number;
  name: string;
  capacity: number;
  rules: string | null;
};
