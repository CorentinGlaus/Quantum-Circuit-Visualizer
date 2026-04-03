import "./Circuit.css";
import { qubitY, numQubits } from "@/helpers/CircuitHelpers";
import {
  CELL_W,
  COLORS,
  LABEL_W,
  PAD_X,
  PAD_Y,
  QUBIT_GAP,
  type CircuitColumnData,
} from "@/models/CircuitModels";
import CircuitColumn from "@/components/CircuitColumn/CircuitColumn";

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

  return (
    <div
      style={{
        display: "inline-block",
        background: COLORS.bg,
        borderRadius: 12,
        padding: 0,
        fontFamily: "monospace",
      }}
    >
      <svg
        width={svgW * 2}
        height={svgH * 2}
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
