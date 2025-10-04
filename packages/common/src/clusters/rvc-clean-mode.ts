export interface RvcCleanModeClusterState {
  supportedModes: { label: string; mode: number; modeTags: unknown }[];
  currentMode: number;
}
