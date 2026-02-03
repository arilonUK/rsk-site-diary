import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Rig, CrewMember } from '../types/database';
import { SelectableCard } from '../components/SelectableCard';

/**
 * SplashView - Shift Initialization (Spec 5.1)
 *
 * Goal: Quick, accurate setup of the shift context (Rig & Driller)
 *
 * Design Constraints Applied:
 * - Rule #1 (Anti-Typing): Selection cards only, no text inputs
 * - Rule #2 (Glove-First): 88px+ touch targets
 * - Rule #3 (High-Contrast): Yellow header, dark background
 */
export const SplashView = () => {
  const navigate = useNavigate();

  // Lookup data from Supabase
  const [rigs, setRigs] = useState<Rig[]>([]);
  const [crewMembers, setCrewMembers] = useState<CrewMember[]>([]);

  // Selection state
  const [selectedRigId, setSelectedRigId] = useState<string>('');
  const [selectedCrewId, setSelectedCrewId] = useState<string>('');

  // UI state
  const [showRigSelection, setShowRigSelection] = useState(false);
  const [showCrewSelection, setShowCrewSelection] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load lookup data on mount
  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      try {
        const { data: rigsData } = await supabase
          .from('rigs')
          .select('*')
          .order('name');
        if (mounted && rigsData) setRigs(rigsData);

        const { data: crewData } = await supabase
          .from('crew_members')
          .select('*')
          .order('name');
        if (mounted && crewData) setCrewMembers(crewData);
      } catch (error) {
        console.error('Error loading lookup data:', error);
      }
    };

    fetchData();
    return () => { mounted = false; };
  }, []);

  const selectedRig = rigs.find((r) => r.id === selectedRigId);
  const selectedCrew = crewMembers.find((c) => c.id === selectedCrewId);

  const canProceed = selectedRigId && selectedCrewId && !isSubmitting;

  const handleBeginChecks = async () => {
    if (!canProceed) return;

    setIsSubmitting(true);

    try {
      // Create new shift record in Supabase
      const { data: newShift, error } = await supabase
        .from('shifts')
        .insert({
          date: new Date().toISOString().split('T')[0],
          rig_id: selectedRigId,
          lead_driller_id: selectedCrewId,
          safety_check_completed: false,
          status: 'In Progress',
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating shift:', error);
        setIsSubmitting(false);
        return;
      }

      // Navigate to Safety Check with shift context
      navigate('/safety-check', {
        state: {
          shiftId: newShift.id,
          rigId: selectedRigId,
          rigName: selectedRig?.name,
          crewId: selectedCrewId,
          crewName: selectedCrew?.name,
        },
      });
    } catch (error) {
      console.error('Error creating shift:', error);
      setIsSubmitting(false);
    }
  };

  const todayFormatted = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      {/* Fixed Yellow Header Banner */}
      <header className="bg-yellow-500 py-6 px-6">
        <h1 className="text-2xl uppercase tracking-wide text-black font-black text-center">
          RSK Site Diary - Start Shift
        </h1>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 pb-32 overflow-y-auto">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Date Display */}
          <div className="text-center py-6">
            <p className="text-slate-400 text-sm uppercase tracking-wide mb-2">
              Today's Date
            </p>
            <p className="text-white text-2xl font-bold">
              {todayFormatted}
            </p>
          </div>

          {/* Rig Selection */}
          <div className="space-y-4">
            <label className="text-slate-300 font-medium text-lg uppercase tracking-wide">
              Select Rig
            </label>
            <button
              onClick={() => setShowRigSelection(!showRigSelection)}
              className={`w-full min-h-[88px] rounded-lg px-6 flex items-center justify-between font-bold text-lg transition-colors ${
                selectedRig
                  ? 'bg-yellow-500 text-black hover:bg-yellow-400'
                  : 'bg-slate-700 text-white hover:bg-slate-600'
              }`}
            >
              <span>{selectedRig ? selectedRig.name : 'Tap to select rig...'}</span>
              <span className="text-2xl">{showRigSelection ? '−' : '+'}</span>
            </button>

            {showRigSelection && (
              <div className="space-y-4 pl-4 border-l-4 border-yellow-500">
                {rigs.length === 0 ? (
                  <p className="text-slate-400 py-4">Loading rigs...</p>
                ) : (
                  rigs.map((rig) => (
                    <SelectableCard
                      key={rig.id}
                      label={rig.name}
                      selected={rig.id === selectedRigId}
                      onClick={() => {
                        setSelectedRigId(rig.id);
                        setShowRigSelection(false);
                      }}
                    />
                  ))
                )}
              </div>
            )}
          </div>

          {/* Driller Selection */}
          <div className="space-y-4">
            <label className="text-slate-300 font-medium text-lg uppercase tracking-wide">
              Select Lead Driller
            </label>
            <button
              onClick={() => setShowCrewSelection(!showCrewSelection)}
              className={`w-full min-h-[88px] rounded-lg px-6 flex items-center justify-between font-bold text-lg transition-colors ${
                selectedCrew
                  ? 'bg-yellow-500 text-black hover:bg-yellow-400'
                  : 'bg-slate-700 text-white hover:bg-slate-600'
              }`}
            >
              <span>
                {selectedCrew
                  ? `${selectedCrew.name} (${selectedCrew.role})`
                  : 'Tap to select lead driller...'}
              </span>
              <span className="text-2xl">{showCrewSelection ? '−' : '+'}</span>
            </button>

            {showCrewSelection && (
              <div className="space-y-4 pl-4 border-l-4 border-yellow-500">
                {crewMembers.length === 0 ? (
                  <p className="text-slate-400 py-4">Loading crew members...</p>
                ) : (
                  crewMembers.map((crew) => (
                    <SelectableCard
                      key={crew.id}
                      label={crew.name}
                      sublabel={crew.role}
                      selected={crew.id === selectedCrewId}
                      onClick={() => {
                        setSelectedCrewId(crew.id);
                        setShowCrewSelection(false);
                      }}
                    />
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Fixed Bottom Action Button */}
      <footer className="fixed bottom-0 left-0 right-0 p-6 bg-slate-900 border-t border-slate-800">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={handleBeginChecks}
            disabled={!canProceed}
            className={`w-full h-24 rounded-lg font-black text-2xl uppercase tracking-wide transition-colors ${
              canProceed
                ? 'bg-yellow-500 hover:bg-yellow-400 text-black'
                : 'bg-slate-700 text-slate-500 cursor-not-allowed opacity-50'
            }`}
          >
            {isSubmitting ? 'Creating Shift...' : 'Begin Pre-Start Checks'}
          </button>
        </div>
      </footer>
    </div>
  );
};

export default SplashView;
