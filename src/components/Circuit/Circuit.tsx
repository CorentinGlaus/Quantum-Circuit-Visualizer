import "./Circuit.css";
import { qubitY, gateX, findBlochPositions, getStepButtonX } from "@/helpers/CircuitHelpers";
import {
  BLOCH_PAD,
  CELL_W,
  CIRCUIT_RATIO,
  SVG_COLORS,
  GATE_SIZE,
  LABEL_W,
  PAD_X,
  PAD_Y,
  QUBIT_GAP,
  type CircuitModel,
} from "@/models/CircuitModels";
import CircuitColumn from "@/components/CircuitColumn/CircuitColumn";
import { useMemo, useState } from "react";
import { partialTrace, rdmToBloch, simulate } from "@/services/CircuitSimulator";
import BlochSphere from "../BlochSphere/BlochSphere";
import { StepButton } from "../StepButton/StepButton";
import { MatrixDisplay } from "../Matrix/Matrix";

interface StepId {
  step: number,
  qubit: number
}

interface CircuitProps {
  circuitState: CircuitModel;
}

function Circuit({ circuitState }: CircuitProps) {
  const cols = circuitState.cols;
  const nQubits = circuitState.numQubits;
  const nSteps = cols.length;

  const [selectedSteps, setSelectedSteps] = useState<StepId[]>([]);

  const toggleStep = (step: number, qubit: number) => {
    setSelectedSteps(prev => {
      const exists = prev.some(s => s.step === step && s.qubit === qubit);
      if (exists) return prev.filter(s => !(s.step === step && s.qubit === qubit));
      return [...prev, { step, qubit }];
    });
  };

  const isSelected = (step: number, qubit: number) =>
    selectedSteps.some(s => s.step === step && s.qubit === qubit);

  const svgW = PAD_X * 2 + LABEL_W + nSteps * CELL_W;
  const svgH = PAD_Y * 2 + (nQubits - 1) * QUBIT_GAP;

  const wireX1 = PAD_X + LABEL_W;
  const wireX2 = svgW;

  const quantumStates = useMemo(() => {
    return simulate(circuitState);
  }, [circuitState]);

  const displayMatrices = useMemo(() => {
    const stepsWithSelection = [...new Set(selectedSteps.map(s => s.step))];

    return stepsWithSelection.map(step => {
      const qubitsSelected = selectedSteps
        .filter(s => s.step === step)
        .map(s => s.qubit);

      const dm = quantumStates[step].densityMatrix;

      const traceOut = Array.from({ length: nQubits }, (_, i) => i)
        .filter(i => !qubitsSelected.includes(i));

      const matrix = traceOut.length === 0
        ? dm
        : partialTrace(nQubits, dm, traceOut);

      return { step, qubitsSelected, matrix };
    }).sort((a, b) => a.step - b.step); // keep them in order
  }, [selectedSteps, quantumStates, nQubits]);

  return (
    <div className="circuit-container">
      {quantumStates.map((_, step) =>
        Array.from({ length: nQubits }, (_, qubit) => (
          <StepButton
            key={`${step}-${qubit}`}
            x={getStepButtonX(step)}
            y={(qubitY(qubit) + BLOCH_PAD - GATE_SIZE / 4) * CIRCUIT_RATIO}
            isSelected={isSelected(step, qubit)}
            onClick={() => toggleStep(step, qubit)}
          />
        ))
      )}

      {findBlochPositions(cols).map(({ x, y }, index) => {
        console.log(quantumStates);
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
            stroke={SVG_COLORS.wire}
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
            fill={SVG_COLORS.qubitLabel}
            fontSize={13}
            fontFamily="'JetBrains Mono', 'Fira Mono', monospace"
            textAnchor="start"
          >
            |{circuitState.init[i]}⟩
          </text>
        ))}

        {cols.map((col, stepIndex) => (
          <CircuitColumn key={stepIndex} col={col} stepIndex={stepIndex} />
        ))}
      </svg>

      {displayMatrices.length > 0 && (
        <div style={{ display: "flex", gap: 16, marginTop: 16, flexWrap: "wrap" }}>
          {displayMatrices.map(({ step, matrix }) => (
            <div key={step} style={{
              position: "absolute",
              left: getStepButtonX(step),
              top: (qubitY(nQubits - 1) + GATE_SIZE / 2) * CIRCUIT_RATIO,
            }}>
              <MatrixDisplay matrix={matrix} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Circuit;
