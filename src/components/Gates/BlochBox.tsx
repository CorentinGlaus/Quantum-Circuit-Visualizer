import { COLORS, GATE_SIZE } from "@/models/CircuitModels";

interface BlochBoxProps {
  x: number;
  y: number;
}

function BlochBox({ x, y }: BlochBoxProps) {
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
    </g>
  );
}

export default BlochBox;
