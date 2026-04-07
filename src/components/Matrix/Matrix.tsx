import { SVG_COLORS } from "@/models/CircuitModels";
import "./Matrix.css";
import type { Matrix } from "@/models/MatrixModels";

function ComplexCell({ re, im, size }: { re: number; im: number; size: number }) {
  const magnitude = Math.sqrt(re * re + im * im);
  const phase = Math.atan2(im, re);
  const radius = size / 2;
  const lineLength = radius * Math.min(magnitude, 1) - 1;

  const x2 = radius + lineLength * Math.cos(phase);
  const y2 = radius - lineLength * Math.sin(phase);

  return (
    <svg width={size} height={size} style={{ display: "block" }}>
      <title>{`${re.toFixed(4)}${im >= 0 ? "+" : ""}${im.toFixed(4)}i`}</title>

      <rect width={size} height={size} fill={SVG_COLORS.matrixFill} />

      <circle cx={radius} cy={radius} r={radius - 1} fill="none" stroke={SVG_COLORS.borderDark} strokeWidth={0.8} />

      <circle
        cx={radius}
        cy={radius}
        r={(radius - 1) * Math.min(magnitude, 1)}
        fill={SVG_COLORS.lightGreenAccent}
        opacity={0.6}
      />

      {magnitude > 0.001 && (
        <line
          x1={radius}
          y1={radius}
          x2={x2}
          y2={y2}
          stroke={SVG_COLORS.greenAccent}
          strokeWidth={1.2}
          strokeLinecap="round"
        />
      )}
    </svg>
  );
}

export function MatrixDisplay({ matrix }: { matrix: Matrix }) {
  return (
    <div className="matrix-container">
      {matrix.m.map((row, r) => (
        <div key={r} className="column-container">
          {row.map((cell, c) => (
            <ComplexCell key={c} re={cell.re} im={cell.im} size={22} />
          ))}
        </div>
      ))}
    </div>
  );
}
