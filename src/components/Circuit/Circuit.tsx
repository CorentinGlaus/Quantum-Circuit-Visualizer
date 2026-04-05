import "./Circuit.css";
import { qubitY, numQubits, gateX, findBlochPositions } from "@/helpers/CircuitHelpers";
import {
  BLOCH_PAD,
  CELL_W,
  CIRCUIT_RATIO,
  COLORS,
  GATE_SIZE,
  LABEL_W,
  PAD_X,
  PAD_Y,
  QUBIT_GAP,
  type CircuitColumnData,
} from "@/models/CircuitModels";
import CircuitColumn from "@/components/CircuitColumn/CircuitColumn";
import { useEffect, useMemo } from "react";
import { rdmToBloch, simulate } from "@/services/CircuitSimulator";
import { ketZero } from "@/models/MatrixModels";
import BlochSphere from "../BlochSphere/BlochSphere";

interface CircuitProps {
  cols: CircuitColumnData[];
}

function Circuit(props: CircuitProps) {
  const { cols } = props;
  const nQubits = numQubits(cols);
  const nSteps = cols.length;

  const svgW = PAD_X * 2 + LABEL_W + nSteps * CELL_W;
  const svgH = PAD_Y * 2 + (nQubits - 1) * QUBIT_GAP;

  const wireX1 = PAD_X + LABEL_W - 8;
  const wireX2 = svgW - PAD_X;

  const quantumStates = useMemo(() => {
    const initialState = ketZero.kron(ketZero);
    return simulate(cols, nQubits, initialState);
  }, [cols, nQubits]);

  useEffect(() => {
    for (const result of quantumStates) {
      console.log(result.densityMatrix.toString());
    }
  }, [quantumStates]);

  return (
    <div className="circuit-container">
      {findBlochPositions(cols).map(({ x, y }, index) => {
        const rdm = quantumStates[x]?.qubits[y]?.reducedDensityMatrix;
        const bloch = rdm ? rdmToBloch(rdm) : { x: 0, y: 0, z: 1 };

        return (
          <div className="bloch-sphere" key={`${x}-${y}`} style={{
            top: (qubitY(y) + BLOCH_PAD - GATE_SIZE / 2) * CIRCUIT_RATIO,
            left: (gateX(x) + BLOCH_PAD / 2 - GATE_SIZE / 2) * CIRCUIT_RATIO
          }}>
            <BlochSphere key={index} x={bloch.x} y={bloch.y} z={bloch.z} />
          </div>
        );
      })}

      <svg
        width={svgW * CIRCUIT_RATIO}
        height={svgH * CIRCUIT_RATIO}
        viewBox={`0 0 ${svgW} ${svgH}`}
        xmlns="http://www.w3.org/2000/svg"
      >
        {Array.from({ length: nQubits }, (_, i) => (
          <line
            key={i}
            x1={wireX1}
            y1={qubitY(i)}
            x2={wireX2}
            y2={qubitY(i)}
            stroke={COLORS.wire}
            strokeWidth={2}
          />
        ))}

        {Array.from({ length: nQubits }, (_, i) => (
          // Use monospaced font to keep the letters the same size
          <text
            key={i}
            x={PAD_X}
            y={qubitY(i)}
            dy="0.35em"
            fill={COLORS.qubitLabel}
            fontSize={13}
            fontFamily="'JetBrains Mono', 'Fira Mono', monospace"
            textAnchor="start"
          >
            q{i}
          </text>
        ))}

        {cols.map((col, stepIndex) => (
          <CircuitColumn key={stepIndex} col={col} stepIndex={stepIndex} />
        ))}
      </svg>
    </div>
  );
}

export default Circuit;
