import { qubitY, gateX } from "@/helpers/CircuitHelpers";
import { COLORS, type CircuitColumnData } from "@/models/CircuitModels";
import CnotTarget from "@/components/Gates/CnotTarget";
import ControlDot from "@/components/Gates/ControlDot";
import GateBox from "@/components/Gates/GateBox";

interface CircuitColumnProps {
  col: CircuitColumnData;
  stepIndex: number;
}

function CircuitColumn({ col, stepIndex }: CircuitColumnProps) {
  const x = gateX(stepIndex);

  const controlQubit = col.gates.indexOf("•");
  const targetQubit = col.gates.indexOf("X");
  const isCnot = controlQubit !== -1 && targetQubit !== -1;

  return (
    <g>
      {isCnot && (
        <line
          x1={x}
          y1={qubitY(controlQubit)}
          x2={x}
          y2={qubitY(targetQubit)}
          stroke={COLORS.cnotLine}
          strokeWidth={2}
        />
      )}

      {col.gates.map((gate, qi) => {
        if (!gate || gate === 1) return null;

        const y = qubitY(qi);

        if (gate === "•") return <ControlDot key={qi} x={x} y={y} />;
        if (gate === "X" && isCnot) return <CnotTarget key={qi} x={x} y={y} />;

        return <GateBox key={qi} x={x} y={y} label={gate} />;
      })}
    </g>
  );
}

export default CircuitColumn;
