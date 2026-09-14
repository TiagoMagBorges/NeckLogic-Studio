export interface ModuleSummary {
  id: number;
  title: string;
  orderIndex: number;
  isSkipTest: boolean;
}

export interface Section {
  id: number;
  title: string;
  description: string | null;
  orderIndex: number;
  modules: ModuleSummary[];
  skipRequiresTest: boolean;
  skipTestModuleId: number | null;
  skipPassThreshold: number | null;
}