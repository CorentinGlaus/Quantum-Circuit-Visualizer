export type Gate = "H" | "X" | "•" | "Bloch" | 1;

export interface CircuitColumnData {
  gates: Gate[];
}

export const COLORS = {
  bg: "#0d1117",
  wire: "#30363d",
  gateStroke: "#58a6ff",
  gateFill: "#161b22",
  gateText: "#e6edf3",
  controlDot: "#58a6ff",
  cnotTarget: "#58a6ff",
  cnotLine: "#58a6ff",
  qubitLabel: "#8b949e",
  labelBg: "#161b22",
};

export const CELL_W = 72;
export const QUBIT_GAP = 64;
export const PAD_X = 10;
export const PAD_Y = 40;
export const GATE_SIZE = 36;
export const LABEL_W = 28;
export const CIRCUIT_RATIO = 4;
export const BLOCH_PAD = 2.5
