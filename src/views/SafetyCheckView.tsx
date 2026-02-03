import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';

/**
 * SafetyCheckView - Safety Gateway (Spec 5.2)
 *
 * Goal: Enforce mandatory safety compliance before work begins.
 * User must complete all safety checks before proceeding.
 *
 * Following Prime Directive Rule #1: No keyboard inputs, only tap/toggle interactions.
 */

interface ShiftContext {
  shiftId: string;
  rigId: string;
  rigName: string;
  crewId: string;
  crewName: string;
}

export const SafetyCheckView = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const shiftContext = location.state as ShiftContext | null;

  const [checksCompleted, setChecksCompleted] = useState({
    ppe: false,
    emergencyStops: false,
    guards: false,
    hazards: false,
    emergency: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const allChecksComplete = Object.values(checksCompleted).every(Boolean);

  const handleToggle = (key: keyof typeof checksCompleted) => {
    setChecksCompleted(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleProceed = async () => {
    if (!allChecksComplete || isSubmitting) return;

    setIsSubmitting(true);

    try {
      // Update shift record to mark safety check as completed
      if (shiftContext?.shiftId) {
        const { error } = await supabase
          .from('shifts')
          .update({ safety_check_completed: true })
          .eq('id', shiftContext.shiftId);

        if (error) {
          console.error('Error updating shift:', error);
        }
      }

      // Navigate to Main Log with shift context
      navigate('/main-log', { state: shiftContext });
    } catch (error) {
      console.error('Error updating shift:', error);
      setIsSubmitting(false);
    }
  };

  // Redirect to splash if no shift context (page refresh or direct navigation)
  if (!shiftContext) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-8">
        <p className="text-white text-xl mb-8">No active shift found.</p>
        <button
          onClick={() => navigate('/')}
          className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-xl px-8 py-4 rounded-lg"
        >
          Return to Start
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      {/* Header */}
      <header className="bg-slate-800 py-6 px-6">
        <h1 className="text-2xl uppercase tracking-wide text-white font-black text-center">
          Pre-Start Safety Checks
        </h1>
        <p className="text-slate-400 text-center mt-2">
          {shiftContext.rigName} • {shiftContext.crewName}
        </p>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 pb-32 overflow-y-auto">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Safety Checklist - 5 mandatory checks */}
          <SafetyCheckItem
            label="PPE Equipment Worn"
            sublabel="Hard hat, gloves, safety boots, hi-vis"
            checked={checksCompleted.ppe}
            onToggle={() => handleToggle('ppe')}
          />

          <SafetyCheckItem
            label="Emergency Stops Tested"
            sublabel="All E-stop buttons functional and accessible"
            checked={checksCompleted.emergencyStops}
            onToggle={() => handleToggle('emergencyStops')}
          />

          <SafetyCheckItem
            label="Guards in Place"
            sublabel="All machine guards secure and undamaged"
            checked={checksCompleted.guards}
            onToggle={() => handleToggle('guards')}
          />

          <SafetyCheckItem
            label="Hazards Identified"
            sublabel="Work area assessed for risks"
            checked={checksCompleted.hazards}
            onToggle={() => handleToggle('hazards')}
          />

          <SafetyCheckItem
            label="Emergency Procedures Known"
            sublabel="Exit routes and first aid location confirmed"
            checked={checksCompleted.emergency}
            onToggle={() => handleToggle('emergency')}
          />
        </div>
      </main>

      {/* Fixed Bottom Action Button */}
      <footer className="fixed bottom-0 left-0 right-0 p-6 bg-slate-900 border-t border-slate-800">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={handleProceed}
            disabled={!allChecksComplete || isSubmitting}
            className={`w-full h-24 rounded-lg font-black text-2xl uppercase tracking-wide transition-colors ${
              allChecksComplete && !isSubmitting
                ? 'bg-green-600 hover:bg-green-500 text-white'
                : 'bg-slate-700 text-slate-500 cursor-not-allowed opacity-50'
            }`}
          >
            {isSubmitting
              ? 'Confirming...'
              : allChecksComplete
              ? 'Confirm Safety & Start Work'
              : 'Complete All Checks'}
          </button>
        </div>
      </footer>
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
      className={`w-full min-h-[96px] rounded-lg p-6 flex items-center justify-between transition-all ${
        checked
          ? 'bg-green-600 text-white'
          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
      }`}
    >
      <div className="text-left">
        <div className="font-bold text-lg">{label}</div>
        <div className="text-sm opacity-80">{sublabel}</div>
      </div>
      {/* Toggle area: 80x80px minimum per spec */}
      <div className={`w-20 h-20 rounded-lg flex items-center justify-center flex-shrink-0 ${
        checked ? 'bg-white' : 'bg-red-600'
      }`}>
        {checked ? (
          <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <span className="text-white font-black text-xl">NO</span>
        )}
      </div>
    </button>
  );
};

export default SafetyCheckView;
