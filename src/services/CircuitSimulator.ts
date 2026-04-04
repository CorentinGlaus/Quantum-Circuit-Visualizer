import type { CircuitColumnData, Gate } from "@/models/CircuitModels";
import { Complex, Matrix, qubitWiseMultiply } from "@/models/MatrixModels";
import type { ControlBit } from "@/models/MatrixModels";


export interface QuantumState {
  step: number;
  stateVector: Matrix;
  densityMatrix: Matrix;
}

//TO DO: Do optimisation, will be very slow for big circuits
export function simulate(
  columns: CircuitColumnData[],
  numQubits: number,
  initialState?: Matrix,
): QuantumState[] {
  let state = initialState ?? zeroState(numQubits);
  const snapshots: QuantumState[] = [buildSnapshot(0, state)];

  for (let i = 0; i < columns.length; i++) {
    state = applyColumn(state, columns[i], numQubits);
    snapshots.push(buildSnapshot(i + 1, state));
  }

  return snapshots;
}

function zeroState(numQubits: number): Matrix {
  const dim = 2 ** numQubits;
  return new Matrix(
    Array.from({ length: dim }, (_, i) => [new Complex(i === 0 ? 1 : 0)]),
  );
}

function applyColumn(state: Matrix, column: CircuitColumnData, numQubits: number): Matrix {
  const { gates } = column;

  const controlBits: ControlBit[] = gates
    .map((gate, i): ControlBit | null => (gate === "•" ? [i, true] : null))
    .filter((x): x is ControlBit => x !== null);

  const controls = controlBits.length > 0 ? controlBits : undefined;
  let current = state;

  for (let i = 0; i < gates.length; i++) {
    const U = gateMatrix(gates[i]);
    if (U !== null) {
      current = qubitWiseMultiply(U, i, numQubits, current, controls);
    }
  }

  return current;
}

function buildSnapshot(step: number, state: Matrix): QuantumState {
  return {
    step,
    stateVector: state,
    densityMatrix: toDensityMatrix(state),
  };
}

function toDensityMatrix(state: Matrix): Matrix {
  return state.mul(state.conjugateTranspose());
}

function gateMatrix(gate: Gate): Matrix | null {
  switch (gate) {
    case "H": return Matrix.H;
    case "X": return Matrix.X;
    default: return null;
  }
}

/*
  Rearrange the bits for the partial trace
  Based on this code: https://arxiv.org/abs/2506.08142
*/
function rearrangeBits(value: number, positions: number[]): number {
  let result = 0;
  for (let i = 0; i < positions.length; i++) {
    const bit = (value >> i) & 1;
    result |= bit << positions[i];
  }
  return result;
}

/*
  Returns the partial trace of the inputMatrix based on the qubits to traceout
  Based on this code: https://arxiv.org/abs/2506.08142
*/
export function partialTrace(
  n: number,
  inputMatrix: Matrix,
  qubitsToTraceOut: number[],
): Matrix {
  const tracedOutSet = new Set(qubitsToTraceOut);
  const qubitsToKeep = Array.from({ length: n }, (_, i) => i)
    .filter(i => !tracedOutSet.has(i));

  const tracedDimension = 1 << qubitsToTraceOut.length;
  const resultDimension = 1 << qubitsToKeep.length;

  const output = new Matrix(resultDimension, resultDimension);

  for (let shared = 0; shared < tracedDimension; shared++) {
    const sharedFull = rearrangeBits(shared, qubitsToTraceOut);

    for (let outRow = 0; outRow < resultDimension; outRow++) {
      const inRow = sharedFull | rearrangeBits(outRow, qubitsToKeep);

      for (let outCol = 0; outCol < resultDimension; outCol++) {
        const inCol = sharedFull | rearrangeBits(outCol, qubitsToKeep);
        output.m[outRow][outCol] = output.m[outRow][outCol]
          .add(inputMatrix.m[inRow][inCol]);
      }
    }
  }

  return output;
}
