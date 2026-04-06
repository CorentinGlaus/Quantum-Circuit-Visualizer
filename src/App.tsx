import "./App.css";
import { useRef, useState } from "react";
import Circuit from "@/components/Circuit/Circuit";
import type { CircuitModel } from "@/models/CircuitModels";
import { parseCircuit } from "./helpers/CircuitHelpers";

const bellState: CircuitModel = {
  cols: [
    { gates: ["Bloch"] },
    { gates: ["H"] },
    { gates: ["•", "X"] },
  ],
  numQubits: 2,
  init: ["0", "0"]
};

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [circuitState, setCircuitState] = useState<CircuitModel>(bellState);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleConfirm = () => {
    const json = textareaRef.current?.value;
    if (!json) return;
    try {
      setCircuitState(parseCircuit(json));
      setIsModalOpen(false);
    } catch (e) {
      alert(`Invalid circuit JSON: ${e}`);
    }
  };

  return (
    <>
      <button className="import-button" onClick={() => setIsModalOpen(true)}>
        Import circuit
      </button>
      <Circuit circuitState={circuitState}></Circuit>
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="import-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Import circuit</h2>
            <textarea className="import-text" ref={textareaRef}></textarea>
            <button
              className="confirm-button"
              onClick={handleConfirm}
            >
              Confirm
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default App;
