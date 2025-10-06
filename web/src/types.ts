// src/types.ts

export type StepId =
  | 'units' | 'tens' | 'hunds'
  | 'thous' | 'tenThous' | 'hundThous'
  | 'millions';

export interface Hint {
  text: string;
  delay_seconds?: number;
}

export interface Hints {
  preventive: Hint[];
  corrective: Record<string, string[]>;
}

export interface SpatialItem {
  kind: 'spatial_relations';
  prompt: string;
  sceneObjects: Array<{
    id: string;
    name: string;
    // 👇 ¡CAMBIO AQUÍ! 👇
    sprite_name: string; 
    position_key: string;
  }>;
  correctObjectId: string;
  hints: Hints;
}

export type MixedItem =
  | { kind: 'horizontal-mcq'; a: number; b: number; options: number[]; correctIndex: number; difficulty?: string }
  | { kind: 'horizontal-input'; operands: number[]; answer: number; difficulty?: string }
  | {
      kind: 'column-steps';
      a: number;
      b: number;
      steps: Array<{ id: StepId; expected: number }>;
      result: number;
      difficulty?: string;
    }
  | SpatialItem;