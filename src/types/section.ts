export interface ModuleSummary {
  id: number;
  title: string;
  orderIndex: number;
}

export interface Section {
  id: number;
  title: string;
  description: string | null;
  orderIndex: number;
  modules: ModuleSummary[];
}