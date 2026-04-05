import "./App.css";
import { useRef, useState } from "react";
import Circuit from "@/components/Circuit/Circuit";
import type { CircuitColumnData } from "@/models/CircuitModels";
import { parseCircuit } from "./helpers/CircuitHelpers";

const bellState: CircuitColumnData[] = [
  { gates: ["Bloch"] },
  { gates: ["H"] },
  { gates: ["•", "X"] },
];

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cols, setCols] = useState<CircuitColumnData[]>(bellState);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleConfirm = () => {
    const json = textareaRef.current?.value;
    if (!json) return;
    try {
      setCols(parseCircuit(json));
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
      <Circuit cols={cols}></Circuit>
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
