/**
 * DepthStepper Component - Multi-increment depth control
 *
 * Spec 5.4: "Below it, a row of four giant buttons: [-1.0] [-0.1] [+0.1] [+1.0]"
 *
 * Prime Directive Rule #1: Anti-Typing Axiom
 * Prime Directive Rule #2: Massive 80px+ buttons for glove-wearing users
 */

interface DepthStepperProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  unit?: string;
}

export const DepthStepper = ({
  label,
  value,
  onChange,
  min = 0,
  max = 9999,
  unit = 'm',
}: DepthStepperProps) => {
  const handleChange = (delta: number) => {
    const newValue = Math.round((value + delta) * 10) / 10; // Avoid floating point errors
    if (newValue >= min && newValue <= max) {
      onChange(newValue);
    }
  };

  const canDecrement = (delta: number) => Math.round((value + delta) * 10) / 10 >= min;
  const canIncrement = (delta: number) => Math.round((value + delta) * 10) / 10 <= max;

  return (
    <div className="space-y-4">
      {/* Label */}
      <label className="text-slate-300 font-medium text-lg uppercase tracking-wide">
        {label}
      </label>

      {/* Value Display */}
      <div className="h-24 bg-slate-800 rounded-lg flex items-center justify-center">
        <span className="text-4xl font-black text-white">
          {value.toFixed(1)}
          {unit && <span className="text-2xl text-slate-400 ml-2">{unit}</span>}
        </span>
      </div>

      {/* Four-button control row: -1.0, -0.1, +0.1, +1.0 */}
      <div className="grid grid-cols-4 gap-3">
        <button
          onClick={() => handleChange(-1.0)}
          disabled={!canDecrement(-1.0)}
          className={`h-20 rounded-lg font-bold text-xl transition-colors ${
            canDecrement(-1.0)
              ? 'bg-slate-700 hover:bg-slate-600 text-white'
              : 'bg-slate-800 text-slate-600 cursor-not-allowed opacity-50'
          }`}
        >
          -1.0
        </button>
        <button
          onClick={() => handleChange(-0.1)}
          disabled={!canDecrement(-0.1)}
          className={`h-20 rounded-lg font-bold text-xl transition-colors ${
            canDecrement(-0.1)
              ? 'bg-slate-700 hover:bg-slate-600 text-white'
              : 'bg-slate-800 text-slate-600 cursor-not-allowed opacity-50'
          }`}
        >
          -0.1
        </button>
        <button
          onClick={() => handleChange(0.1)}
          disabled={!canIncrement(0.1)}
          className={`h-20 rounded-lg font-bold text-xl transition-colors ${
            canIncrement(0.1)
              ? 'bg-slate-700 hover:bg-slate-600 text-white'
              : 'bg-slate-800 text-slate-600 cursor-not-allowed opacity-50'
          }`}
        >
          +0.1
        </button>
        <button
          onClick={() => handleChange(1.0)}
          disabled={!canIncrement(1.0)}
          className={`h-20 rounded-lg font-bold text-xl transition-colors ${
            canIncrement(1.0)
              ? 'bg-slate-700 hover:bg-slate-600 text-white'
              : 'bg-slate-800 text-slate-600 cursor-not-allowed opacity-50'
          }`}
        >
          +1.0
        </button>
      </div>
    </div>
  );
};

export default DepthStepper;
