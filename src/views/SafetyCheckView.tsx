import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * SafetyCheckView - First step in linear flow
 *
 * User must complete safety checklist before starting shift.
 * Following Prime Directive Rule #1: No keyboard inputs, only tap/toggle interactions.
 */
export const SafetyCheckView = () => {
  const navigate = useNavigate();
  const [checksCompleted, setChecksCompleted] = useState({
    ppe: false,
    equipment: false,
    hazards: false,
    emergency: false,
  });

  const allChecksComplete = Object.values(checksCompleted).every(Boolean);

  const handleToggle = (key: keyof typeof checksCompleted) => {
    setChecksCompleted(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleProceed = () => {
    if (allChecksComplete) {
      navigate('/main-log');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl uppercase tracking-wide text-white font-black">
            Safety Check
          </h1>
          <p className="text-slate-300 font-medium text-lg">
            Complete all checks before starting shift
          </p>
        </div>

        {/* Safety Checklist */}
        <div className="space-y-6">
          {/* PPE Check */}
          <SafetyCheckItem
            label="PPE Equipment Worn"
            sublabel="Hard hat, gloves, safety boots, hi-vis"
            checked={checksCompleted.ppe}
            onToggle={() => handleToggle('ppe')}
          />

          {/* Equipment Check */}
          <SafetyCheckItem
            label="Equipment Inspected"
            sublabel="Rig systems operational and safe"
            checked={checksCompleted.equipment}
            onToggle={() => handleToggle('equipment')}
          />

          {/* Hazards Check */}
          <SafetyCheckItem
            label="Hazards Identified"
            sublabel="Work area assessed for risks"
            checked={checksCompleted.hazards}
            onToggle={() => handleToggle('hazards')}
          />

          {/* Emergency Check */}
          <SafetyCheckItem
            label="Emergency Procedures Known"
            sublabel="Exit routes and first aid location confirmed"
            checked={checksCompleted.emergency}
            onToggle={() => handleToggle('emergency')}
          />
        </div>

        {/* Proceed Button */}
        <button
          onClick={handleProceed}
          disabled={!allChecksComplete}
          className={`w-full h-24 text-2xl uppercase tracking-wide rounded-lg font-black transition-colors ${
            allChecksComplete
              ? 'bg-green-600 hover:bg-green-500 text-white'
              : 'bg-slate-700 text-slate-500 cursor-not-allowed opacity-50'
          }`}
        >
          {allChecksComplete ? 'Proceed to Shift' : 'Complete All Checks'}
        </button>
      </div>
    </div>
  );
};

// Safety Check Item Component (Massive Toggle Button)
interface SafetyCheckItemProps {
  label: string;
  sublabel: string;
  checked: boolean;
  onToggle: () => void;
}

const SafetyCheckItem = ({ label, sublabel, checked, onToggle }: SafetyCheckItemProps) => {
  return (
    <button
      onClick={onToggle}
      className={`w-full h-24 rounded-lg p-6 flex items-center justify-between transition-all ${
        checked
          ? 'bg-green-600 text-white'
          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
      }`}
    >
      <div className="text-left">
        <div className="font-bold text-lg">{label}</div>
        <div className="text-sm opacity-80">{sublabel}</div>
      </div>
      <div className={`w-16 h-16 rounded-lg flex items-center justify-center ${
        checked ? 'bg-white' : 'bg-slate-700'
      }`}>
        {checked && (
          <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>
    </button>
  );
};

export default SafetyCheckView;
