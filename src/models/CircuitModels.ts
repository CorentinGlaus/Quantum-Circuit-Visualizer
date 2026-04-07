export type Gate = "H" | "X" | "Y" | "Z" | "S" | "T" | "•" | "Bloch" | 1;
export type InitState = "0" | "1" | "-" | "+" | "i" | "-i";

export interface CircuitColumnData {
  gates: Gate[];
}

export interface CircuitModel {
  numQubits: number;
  cols: CircuitColumnData[];
  init: InitState[];
}

export const SVG_COLORS = {
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
  greenAccent: "#00ff88",
  lightGreenAccent: "#1a3a1a",
  borderDark: "#333344",
  matrixFill: "#1a1a2e",
};

export const CELL_W = 72;
export const QUBIT_GAP = 64;
export const PAD_X = 10;
export const PAD_Y = 40;
export const GATE_SIZE = 36;
export const LABEL_W = 28;
export const CIRCUIT_RATIO = 4;
export const BLOCH_PAD = 2.5;
export const GATES_PAD = 10;
