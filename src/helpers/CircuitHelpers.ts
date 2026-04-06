import {
  CELL_W,
  LABEL_W,
  PAD_X,
  PAD_Y,
  QUBIT_GAP,
  type CircuitColumnData,
  type CircuitModel,
  type Gate,
  type InitState,
} from "@/models/CircuitModels";

export function getNumQubits(cols: CircuitColumnData[]) {
  return cols.reduce((max: number, col) => Math.max(max, col.gates.length), 0);
}

export function gateX(stepIndex: number) {
  return PAD_X + LABEL_W + stepIndex * CELL_W + CELL_W / 2;
}

export function qubitY(qubitIndex: number) {
  return PAD_Y + qubitIndex * QUBIT_GAP;
}

export interface BlochPosition {
  x: number;
  y: number;
}

export function findBlochPositions(columns: CircuitColumnData[]): BlochPosition[] {
  return columns.flatMap((col, x) =>
    col.gates
      .map((gate, y) => (gate === "Bloch" ? { x, y } : null))
      .filter((pos): pos is BlochPosition => pos !== null)
  );
}

const gateAliases: Record<string, string> = {
  "Z^½": "S",
  "Z^¼": "T",
};

export function parseCircuit(json: string): CircuitModel {
  const parsed = JSON.parse(json);
  const cols = parsed.cols.map((col: Gate[]) => ({
    gates: col.map((gate) => gateAliases[gate as string] ?? gate),
  }));
  const numQubits = getNumQubits(cols);
  const initStates: InitState[] = Array.from({ length: numQubits }, (_, i) =>
    (String(parsed.init?.[i] ?? "0")) as InitState
  );
  return { numQubits: numQubits, cols: cols, init: initStates };
}
