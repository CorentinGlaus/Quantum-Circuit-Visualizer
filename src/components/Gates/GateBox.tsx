import { COLORS, GATE_SIZE } from "@/models/CircuitModels";

interface GateBoxProps {
  x: number;
  y: number;
  label: string;
}

function GateBox({ x, y, label }: GateBoxProps) {
  return (
    <g>
      <rect
        x={x - GATE_SIZE / 2}
        y={y - GATE_SIZE / 2}
        width={GATE_SIZE}
        height={GATE_SIZE}
        rx={5}
        fill={COLORS.gateFill}
        stroke={COLORS.gateStroke}
        strokeWidth={1.5}
      />
      <text
        x={x}
        y={y}
        dy="0.35em"
        fill={COLORS.gateText}
        fontSize={14}
        fontFamily="'JetBrains Mono', 'Fira Mono', monospace"
        fontWeight={600}
        textAnchor="middle"
      >
        {label}
      </text>
    </g>
  );
}

export default GateBox;
