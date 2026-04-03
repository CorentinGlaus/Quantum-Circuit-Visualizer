import "./App.css";
import { useState } from "react";
import Circuit from "@/components/Circuit/Circuit";
import type { CircuitColumnData } from "@/models/CircuitModels";

const bellState: CircuitColumnData[] = [
  { gates: ["H"] },
  { gates: ["•", "X"] },
];

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button className="import-button" onClick={() => setIsModalOpen(true)}>
        Import circuit
      </button>
      <Circuit cols={bellState}></Circuit>
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="import-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Import circuit</h2>
            <textarea className="import-text"></textarea>
            <button
              className="confirm-button"
              onClick={() => setIsModalOpen(false)}
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
