import {
  CELL_W,
  LABEL_W,
  PAD_X,
  PAD_Y,
  QUBIT_GAP,
  type CircuitColumnData,
} from "@/models/CircuitModels";

export function numQubits(cols: CircuitColumnData[]) {
  return cols.reduce((max: number, col) => Math.max(max, col.gates.length), 0);
}

export function gateX(stepIndex: number) {
  return PAD_X + LABEL_W + stepIndex * CELL_W + CELL_W / 2;
}

export function qubitY(qubitIndex: number) {
  return PAD_Y + qubitIndex * QUBIT_GAP;
}
