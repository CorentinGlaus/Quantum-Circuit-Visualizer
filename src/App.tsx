import "./App.css";
import { useState } from "react";

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <section>
        <button className="import-button" onClick={() => setIsModalOpen(true)}>
          Import circuit
        </button>
      </section>

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
