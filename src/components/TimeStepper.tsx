/**
 * TimeStepper Component - For time inputs without keyboard
 *
 * Prime Directive Rule #1: Anti-Typing Axiom
 * Prime Directive Rule #2: Massive buttons for glove-wearing users
 *
 * Displays time in HH:MM format with 5-minute increment buttons
 */

interface TimeStepperProps {
  label: string;
  value: string; // HH:MM format
  onChange: (value: string) => void;
  step?: number; // Minutes per step (default 5)
}

export const TimeStepper = ({
  label,
  value,
  onChange,
  step = 5,
}: TimeStepperProps) => {
  // Parse HH:MM to total minutes
  const parseTime = (timeStr: string): number => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };

  // Convert total minutes to HH:MM
  const formatTime = (totalMinutes: number): string => {
    // Wrap around 24 hours
    const normalized = ((totalMinutes % 1440) + 1440) % 1440;
    const hours = Math.floor(normalized / 60);
    const minutes = normalized % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  const currentMinutes = parseTime(value);

  const handleDecrement = () => {
    onChange(formatTime(currentMinutes - step));
  };

  const handleIncrement = () => {
    onChange(formatTime(currentMinutes + step));
  };

  return (
    <div className="space-y-4">
      {/* Label */}
      <label className="text-slate-300 font-medium text-lg uppercase tracking-wide">
        {label}
      </label>

      {/* Stepper Controls */}
      <div className="flex items-center gap-4">
        {/* Decrement Button */}
        <button
          onClick={handleDecrement}
          className="w-20 h-20 rounded-lg font-black text-3xl bg-slate-700 hover:bg-slate-600 text-white transition-colors"
        >
          −{step}
        </button>

        {/* Time Display */}
        <div className="flex-1 h-20 bg-slate-800 rounded-lg flex items-center justify-center">
          <span className="text-3xl font-black text-white font-mono">
            {value}
          </span>
        </div>

        {/* Increment Button */}
        <button
          onClick={handleIncrement}
          className="w-20 h-20 rounded-lg font-black text-3xl bg-slate-700 hover:bg-slate-600 text-white transition-colors"
        >
          +{step}
        </button>
      </div>
    </div>
  );
};

export default TimeStepper;
