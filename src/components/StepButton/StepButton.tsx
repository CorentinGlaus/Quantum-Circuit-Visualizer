import "./StepButton.css";

interface StepButtonProps {
  x: number;
  y: number;
  isSelected: boolean;
  onClick: () => void;
}

export function StepButton({ x, y, isSelected, onClick }: StepButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`step-button ${isSelected ? "selected" : ""}`}
      style={{ left: x, top: y }}
    />
  );
}
