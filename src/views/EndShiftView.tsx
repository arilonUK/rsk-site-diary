import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { ActivityLog, ShiftContext } from '../types/database';
import { useToast } from '../hooks/useToast';

/**
 * EndShiftView - End Shift (Spec 5.5)
 *
 * Goal: Final verification and submission.
 *
 * Following Prime Directives:
 * - No keyboard inputs (toggle only)
 * - 80px+ touch targets throughout
 * - High-contrast industrial design
 */

export const EndShiftView = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const shiftContext = location.state as ShiftContext | null;
  const { showToast, ToastContainer } = useToast();

  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load activity logs for this shift
  useEffect(() => {
    if (!shiftContext) return;

    let mounted = true;

    const fetchLogs = async () => {
      try {
        const { data, error } = await supabase
          .from('activity_logs')
          .select('*')
          .eq('shift_id', shiftContext.shiftId)
          .order('sequence_order');

        if (error) {
          showToast('Could not load activity logs. Please retry.', 'error');
        } else if (mounted && data) {
          setActivityLogs(data);
        }
      } catch (error) {
        console.error('Error loading activity logs:', error);
        if (mounted) showToast('Could not load activity logs. Please retry.', 'error');
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    fetchLogs();
    return () => { mounted = false; };
  }, [shiftContext, showToast]);

  // Calculate totals
  const drillingLogs = activityLogs.filter((log) => log.activity_type === 'DRILLING');
  const standbyLogs = activityLogs.filter((log) => log.activity_type === 'STANDBY');

  const totalMeters = drillingLogs.reduce(
    (sum, log) => sum + ((log.end_depth || 0) - (log.start_depth || 0)),
    0
  );

  const calculateDurationMinutes = (log: ActivityLog): number => {
    const start = new Date(log.start_time);
    const end = new Date(log.end_time);
    return Math.round((end.getTime() - start.getTime()) / 60000);
  };

  const totalDrillingMinutes = drillingLogs.reduce(
    (sum, log) => sum + calculateDurationMinutes(log),
    0
  );

  const totalStandbyMinutes = standbyLogs.reduce(
    (sum, log) => sum + calculateDurationMinutes(log),
    0
  );

  const totalMinutes = totalDrillingMinutes + totalStandbyMinutes;

  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const handleSubmit = async () => {
    if (!isConfirmed || !shiftContext || isSubmitting) return;

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('shifts')
        .update({ status: 'Submitted' })
        .eq('id', shiftContext.shiftId);

      if (error) {
        console.error('Error submitting shift:', error);
        showToast('Could not submit report. Please try again.', 'error');
        setIsSubmitting(false);
        return;
      }

      // Return to Splash
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Error submitting shift:', error);
      showToast('Could not submit report. Please try again.', 'error');
      setIsSubmitting(false);
    }
  };

  // Redirect to splash if no shift context
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
      <ToastContainer />
      {/* Header */}
      <header className="bg-yellow-500 py-6 px-6">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate('/main-log', { state: shiftContext })}
            className="w-24 h-12 bg-black/20 hover:bg-black/30 text-black font-bold text-sm uppercase rounded-lg"
          >
            ← Back
          </button>
          <h1 className="text-2xl uppercase tracking-wide text-black font-black">
            End Shift
          </h1>
          <div className="w-24" /> {/* Spacer for centering */}
        </div>
      </header>

      {/* Shift Info */}
      <div className="bg-slate-800 py-4 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-white font-bold text-lg">{shiftContext.rigName}</p>
          <p className="text-slate-400">{shiftContext.crewName}</p>
          <p className="text-slate-500 text-sm mt-1">
            {new Date().toLocaleDateString('en-GB', {
              weekday: 'long',
              day: '2-digit',
              month: 'long',
              year: 'numeric',
            })}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-6 pb-40 overflow-y-auto">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Shift Summary */}
          <div className="bg-slate-800 rounded-lg p-6 space-y-6">
            <h2 className="text-xl uppercase tracking-wide text-white font-bold text-center">
              Shift Summary
            </h2>

            {isLoading ? (
              <p className="text-slate-400 text-center py-8">Loading summary...</p>
            ) : (
              <div className="space-y-4">
                {/* Total Hours */}
                <div className="bg-slate-700 rounded-lg p-6 flex items-center justify-between">
                  <span className="text-slate-300 font-medium text-lg uppercase tracking-wide">
                    Total Hours
                  </span>
                  <span className="text-white text-3xl font-black">
                    {formatDuration(totalMinutes)}
                  </span>
                </div>

                {/* Total Meters */}
                <div className="bg-green-900/40 border-l-4 border-green-600 rounded-lg p-6 flex items-center justify-between">
                  <span className="text-slate-300 font-medium text-lg uppercase tracking-wide">
                    Total Meters Drilled
                  </span>
                  <span className="text-green-400 text-3xl font-black">
                    {totalMeters.toFixed(1)}m
                  </span>
                </div>

                {/* Drilling Time */}
                <div className="bg-green-900/20 rounded-lg p-6 flex items-center justify-between">
                  <span className="text-slate-300 font-medium text-lg uppercase tracking-wide">
                    Drilling Time
                  </span>
                  <span className="text-green-400 text-2xl font-bold">
                    {formatDuration(totalDrillingMinutes)}
                  </span>
                </div>

                {/* Standby Time */}
                <div className="bg-red-900/40 border-l-4 border-red-600 rounded-lg p-6 flex items-center justify-between">
                  <span className="text-slate-300 font-medium text-lg uppercase tracking-wide">
                    Total Standby
                  </span>
                  <span className="text-red-400 text-3xl font-black">
                    {formatDuration(totalStandbyMinutes)}
                  </span>
                </div>

                {/* Activity Count */}
                <div className="bg-slate-700 rounded-lg p-6 flex items-center justify-between">
                  <span className="text-slate-300 font-medium text-lg uppercase tracking-wide">
                    Activity Blocks
                  </span>
                  <span className="text-white text-2xl font-bold">
                    {activityLogs.length}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Confirmation Toggle */}
          <div className="bg-slate-800 rounded-lg p-6">
            <button
              onClick={() => setIsConfirmed(!isConfirmed)}
              className={`w-full min-h-[96px] rounded-lg px-6 flex items-center justify-between transition-colors ${
                isConfirmed
                  ? 'bg-green-600 text-white'
                  : 'bg-slate-700 text-slate-300'
              }`}
            >
              <span className="font-bold text-lg pr-4 text-left">
                I confirm this record is accurate ground truth
              </span>
              <div
                className={`w-24 h-14 rounded-full p-1 transition-colors flex-shrink-0 ${
                  isConfirmed ? 'bg-green-400' : 'bg-slate-600'
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-full bg-white shadow-lg transition-transform ${
                    isConfirmed ? 'translate-x-10' : 'translate-x-0'
                  }`}
                />
              </div>
            </button>
          </div>
        </div>
      </main>

      {/* Fixed Bottom Action Button */}
      <footer className="fixed bottom-0 left-0 right-0 p-6 bg-slate-900 border-t border-slate-800">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={handleSubmit}
            disabled={!isConfirmed || isSubmitting}
            className={`w-full h-24 rounded-lg font-black text-2xl uppercase tracking-wide transition-colors ${
              isConfirmed && !isSubmitting
                ? 'bg-yellow-500 hover:bg-yellow-400 text-black'
                : 'bg-slate-700 text-slate-500 cursor-not-allowed opacity-50'
            }`}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Final Report'}
          </button>
        </div>
      </footer>
    </div>
  );
};

export default EndShiftView;
