import { COLORS } from "@/models/CircuitModels";

interface ControlDotProps {
  x: number;
  y: number;
}

function ControlDot({ x, y }: ControlDotProps) {
  return <circle cx={x} cy={y} r={7} fill={COLORS.controlDot} />;
}

export default ControlDot;
