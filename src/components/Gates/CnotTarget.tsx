import { SVG_COLORS } from "@/models/CircuitModels";

interface CnotTargetProps {
  x: number;
  y: number;
}

function CnotTarget({ x, y }: CnotTargetProps) {
  const r = 14;
  return (
    <g>
      <circle
        cx={x}
        cy={y}
        r={r}
        fill="none"
        stroke={SVG_COLORS.cnotTarget}
        strokeWidth={2}
      />
      <line
        x1={x}
        y1={y - r}
        x2={x}
        y2={y + r}
        stroke={SVG_COLORS.cnotTarget}
        strokeWidth={2}
      />
      <line
        x1={x - r}
        y1={y}
        x2={x + r}
        y2={y}
        stroke={SVG_COLORS.cnotTarget}
        strokeWidth={2}
      />
    </g>
  );
}

export default CnotTarget;
