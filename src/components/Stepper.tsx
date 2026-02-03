/**
 * Stepper Component - For numeric inputs without keyboard
 *
 * Prime Directive Rule #1: Anti-Typing Axiom
 * Prime Directive Rule #2: Massive 96x96px buttons for glove-wearing users
 */

interface StepperProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
}

export const Stepper = ({
  label,
  value,
  onChange,
  min = 0,
  max = 9999,
  step = 1,
  unit = '',
}: StepperProps) => {
  const handleDecrement = () => {
    const newValue = value - step;
    if (newValue >= min) {
      onChange(newValue);
    }
  };

  const handleIncrement = () => {
    const newValue = value + step;
    if (newValue <= max) {
      onChange(newValue);
    }
  };

  const canDecrement = value > min;
  const canIncrement = value < max;

  return (
    <div className="space-y-4">
      {/* Label */}
      <label className="text-slate-300 font-medium text-lg uppercase tracking-wide">
        {label}
      </label>

      {/* Stepper Controls */}
      <div className="flex items-center gap-6">
        {/* Decrement Button */}
        <button
          onClick={handleDecrement}
          disabled={!canDecrement}
          className={`w-24 h-24 rounded-lg font-black text-4xl transition-colors ${
            canDecrement
              ? 'bg-slate-700 hover:bg-slate-600 text-white'
              : 'bg-slate-800 text-slate-600 cursor-not-allowed opacity-50'
          }`}
        >
          −
        </button>

        {/* Value Display */}
        <div className="flex-1 h-24 bg-slate-800 rounded-lg flex items-center justify-center">
          <span className="text-4xl font-black text-white">
            {value}
            {unit && <span className="text-2xl text-slate-400 ml-2">{unit}</span>}
          </span>
        </div>

        {/* Increment Button */}
        <button
          onClick={handleIncrement}
          disabled={!canIncrement}
          className={`w-24 h-24 rounded-lg font-black text-4xl transition-colors ${
            canIncrement
              ? 'bg-slate-700 hover:bg-slate-600 text-white'
              : 'bg-slate-800 text-slate-600 cursor-not-allowed opacity-50'
          }`}
        >
          +
        </button>
      </div>
    </div>
  );
};

export default Stepper;
