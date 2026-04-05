import "./Circuit.css";
import { qubitY, numQubits, gateX, findBlochPositions } from "@/helpers/CircuitHelpers";
import {
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
import { useEffect } from "react";
import { simulate } from "@/services/CircuitSimulator";
import { ketOne } from "@/models/MatrixModels";
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

  useEffect(() => {
    const initialState = ketOne.kron(ketOne);
    const results = simulate(cols, nQubits, initialState);
    for (const result of results) {
      console.log(result.densityMatrix.toString());
    }
  }, [cols, nQubits]);

  return (
    <div className="circuit-container">
      {findBlochPositions(cols).map(({ x, y }) => (
        <div className="bloch-sphere" style={{
          top: (qubitY(y) - GATE_SIZE / 2) * CIRCUIT_RATIO,
          left: (gateX(x) - GATE_SIZE / 2) * CIRCUIT_RATIO
        }}>
          <BlochSphere x={1} y={0} z={0} />
        </div>
      ))}

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
