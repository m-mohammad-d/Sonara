export interface EqualizerPresetData {
  name: string;
  gains: number[]; // 10 values in dB (-12 to +12)
}

export const EQ_FREQUENCIES = [32, 64, 125, 250, 500, 1000, 2000, 4000, 8000, 16000] as const;

export const EQ_PRESETS: Record<string, EqualizerPresetData> = {
  Flat: {
    name: 'Flat',
    gains: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  },
  'Bass Boost': {
    name: 'Bass Boost',
    gains: [6, 5, 3.5, 2, 0.5, 0, 0, 0, 0, 0],
  },
  'Treble Boost': {
    name: 'Treble Boost',
    gains: [0, 0, 0, 0, 0, 0.5, 2, 3.5, 5, 6],
  },
  Vocal: {
    name: 'Vocal',
    gains: [-2, -1, 0, 2, 4, 4, 2, 1, 0, -1],
  },
  Rock: {
    name: 'Rock',
    gains: [4.5, 3.5, 2, 0.5, -1, -0.5, 1.5, 3, 4, 4.5],
  },
  Pop: {
    name: 'Pop',
    gains: [-1, 1, 3, 3.5, 2, 0, 1, 2, 3, 2],
  },
  Classical: {
    name: 'Classical',
    gains: [3.5, 3, 2, 1.5, -0.5, -0.5, 0, 1.5, 2.5, 3],
  },
  Electronic: {
    name: 'Electronic',
    gains: [5, 4, 2, 0, -1.5, 1.5, 1, 2, 3.5, 4],
  },
};
