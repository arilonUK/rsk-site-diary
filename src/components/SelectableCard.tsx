/**
 * SelectableCard Component - For selection without dropdowns
 *
 * Prime Directive Rule #1: Anti-Typing Axiom (no dropdowns, use cards)
 * Prime Directive Rule #2: Minimum 80px height for glove-first design
 */

interface SelectableCardProps {
  label: string;
  sublabel?: string;
  selected: boolean;
  onClick: () => void;
  disabled?: boolean;
}

export const SelectableCard = ({
  label,
  sublabel,
  selected,
  onClick,
  disabled = false,
}: SelectableCardProps) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full min-h-[80px] rounded-lg p-6 flex items-center justify-between transition-all ${
        disabled
          ? 'bg-slate-800 text-slate-600 cursor-not-allowed opacity-50'
          : selected
          ? 'bg-yellow-500 text-black hover:bg-yellow-400'
          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
      }`}
    >
      <div className="text-left">
        <div className={`font-bold text-lg ${selected ? 'text-black' : 'text-white'}`}>
          {label}
        </div>
        {sublabel && (
          <div className={`text-sm ${selected ? 'text-black opacity-70' : 'text-slate-400'}`}>
            {sublabel}
          </div>
        )}
      </div>

      {selected && (
        <div className="w-12 h-12 rounded-lg bg-black flex items-center justify-center flex-shrink-0 ml-4">
          <svg className="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}
    </button>
  );
};

export default SelectableCard;
