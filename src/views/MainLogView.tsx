import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { DrillBit, ActivityType, ActivityLog, ShiftContext } from '../types/database';
import { SelectableCard } from '../components/SelectableCard';
import { Stepper } from '../components/Stepper';
import { TimeStepper } from '../components/TimeStepper';
import { useToast } from '../hooks/useToast';

/**
 * MainLogView - Main Shift Hub (Spec 5.3) + Add Activity Flow (Spec 5.4)
 *
 * Goal: High-level overview of shift progress and entry point for data.
 *
 * Following Prime Directives:
 * - No keyboard inputs (steppers, cards, toggles only)
 * - 80px+ touch targets throughout
 * - High-contrast industrial design
 */

interface CurrentActivity {
  activityType: ActivityType;
  startTime: string; // HH:MM format
  endTime: string;   // HH:MM format
  startDepth: number;
  endDepth: number;
  drillBitId: string;
  standbyReason: string;
}

// Get current time rounded to nearest 5 minutes
const getCurrentTimeRounded = (): string => {
  const now = new Date();
  const minutes = Math.round(now.getMinutes() / 5) * 5;
  const hours = now.getHours() + (minutes >= 60 ? 1 : 0);
  return `${(hours % 24).toString().padStart(2, '0')}:${(minutes % 60).toString().padStart(2, '0')}`;
};

export const MainLogView = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const shiftContext = location.state as ShiftContext | null;
  const { showToast, ToastContainer } = useToast();

  // Lookup data from Supabase
  const [drillBits, setDrillBits] = useState<DrillBit[]>([]);

  // Current activity being logged
  const [currentActivity, setCurrentActivity] = useState<CurrentActivity>({
    activityType: 'DRILLING',
    startTime: getCurrentTimeRounded(),
    endTime: getCurrentTimeRounded(),
    startDepth: 0,
    endDepth: 0,
    drillBitId: '',
    standbyReason: '',
  });

  // Activity log timeline
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);

  // UI state
  const [showReasonSelection, setShowReasonSelection] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load drill bits on mount
  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      try {
        const { data: bitsData, error } = await supabase
          .from('drill_bits')
          .select('*')
          .eq('status', 'Available')
          .order('serial_number');
        if (error) {
          showToast('Could not load drill bits. Please retry.', 'error');
          return;
        }
        if (mounted && bitsData) setDrillBits(bitsData);
      } catch (error) {
        console.error('Error loading drill bits:', error);
        if (mounted) showToast('Could not load drill bits. Please retry.', 'error');
      }
    };

    fetchData();
    return () => { mounted = false; };
  }, [showToast]);

  // Load existing activity logs for this shift
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
          return;
        }

        if (mounted && data) {
          setActivityLogs(data);
          // Continue depth from last drilling activity
          const lastDrillingLog = data
            .filter(log => log.activity_type === 'DRILLING')
            .sort((a, b) => b.sequence_order - a.sequence_order)[0];
          if (lastDrillingLog?.end_depth) {
            setCurrentActivity(prev => ({
              ...prev,
              startDepth: lastDrillingLog.end_depth,
              endDepth: lastDrillingLog.end_depth,
            }));
          }
        }
      } catch (error) {
        console.error('Error loading activity logs:', error);
        if (mounted) showToast('Could not load activity logs. Please retry.', 'error');
      }
    };

    fetchLogs();
    return () => { mounted = false; };
  }, [shiftContext, showToast]);

  const selectedBit = drillBits.find((b) => b.id === currentActivity.drillBitId);

  const canLogActivity =
    currentActivity.activityType === 'DRILLING'
      ? currentActivity.drillBitId && currentActivity.endDepth > currentActivity.startDepth
      : currentActivity.standbyReason;

  const handleLogActivity = async () => {
    if (!canLogActivity || !shiftContext || isSaving) return;

    setIsSaving(true);

    // Convert HH:MM times to ISO timestamps for today
    const today = new Date().toISOString().split('T')[0];
    const startTimeISO = `${today}T${currentActivity.startTime}:00.000Z`;
    const endTimeISO = `${today}T${currentActivity.endTime}:00.000Z`;

    // Create activity log entry
    const newLog: ActivityLog = {
      id: crypto.randomUUID(),
      shift_id: shiftContext.shiftId,
      sequence_order: activityLogs.length + 1,
      start_time: startTimeISO,
      end_time: endTimeISO,
      activity_type: currentActivity.activityType,
      ...(currentActivity.activityType === 'DRILLING'
        ? {
            start_depth: currentActivity.startDepth,
            end_depth: currentActivity.endDepth,
            drill_bit_id: currentActivity.drillBitId,
          }
        : {
            standby_reason: currentActivity.standbyReason,
          }),
    };

    try {
      // Save to Supabase
      const { error } = await supabase
        .from('activity_logs')
        .insert({
          shift_id: newLog.shift_id,
          sequence_order: newLog.sequence_order,
          start_time: newLog.start_time,
          end_time: newLog.end_time,
          activity_type: newLog.activity_type,
          start_depth: newLog.start_depth,
          end_depth: newLog.end_depth,
          drill_bit_id: newLog.drill_bit_id,
          standby_reason: newLog.standby_reason,
        });

      if (error) {
        console.error('Error saving activity log:', error);
        showToast('Could not save activity. Please try again.', 'error');
        setIsSaving(false);
        return;
      }
    } catch (error) {
      console.error('Error saving activity log:', error);
      showToast('Could not save activity. Please try again.', 'error');
      setIsSaving(false);
      return;
    }

    setActivityLogs([...activityLogs, newLog]);

    // Reset form - continue from last depth and current time
    const newStartTime = currentActivity.endTime;
    setCurrentActivity({
      activityType: 'DRILLING',
      startTime: newStartTime,
      endTime: newStartTime,
      startDepth: currentActivity.endDepth,
      endDepth: currentActivity.endDepth,
      drillBitId: currentActivity.drillBitId,
      standbyReason: '',
    });

    setIsSaving(false);
  };

  const standbyReasons = [
    'Weather Delay',
    'Client Delay',
    'Equipment Maintenance',
    'Safety Issue',
    'Waiting on Materials',
    'Break Time',
  ];

  // Calculate totals
  const totalMeters = activityLogs
    .filter((log) => log.activity_type === 'DRILLING')
    .reduce((sum, log) => sum + ((log.end_depth || 0) - (log.start_depth || 0)), 0);

  const currentDepth = activityLogs.length > 0
    ? activityLogs
        .filter((log) => log.activity_type === 'DRILLING')
        .reduce((max, log) => Math.max(max, log.end_depth || 0), 0)
    : 0;

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
      {/* Header with Shift Info */}
      <header className="bg-slate-800 py-4 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="w-24" /> {/* Spacer for centering */}
            <h1 className="text-2xl uppercase tracking-wide text-white font-black text-center">
              Activity Log
            </h1>
            <button
              onClick={() => navigate('/end-shift', { state: shiftContext })}
              className="w-24 h-12 bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-sm uppercase rounded-lg"
            >
              End Shift
            </button>
          </div>
          <p className="text-slate-400 text-center mt-1">
            {shiftContext.rigName} • {shiftContext.crewName}
          </p>
          <p className="text-slate-500 text-center text-sm mt-1">
            {new Date().toLocaleDateString('en-GB', {
              weekday: 'short',
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })}
          </p>
        </div>
      </header>

      {/* Progress Banner */}
      <div className="bg-slate-700 py-4 px-6">
        <div className="max-w-3xl mx-auto flex justify-around">
          <div className="text-center">
            <p className="text-slate-400 text-xs uppercase tracking-wide">Total Meters</p>
            <p className="text-white text-2xl font-black">{totalMeters.toFixed(1)}m</p>
          </div>
          <div className="text-center">
            <p className="text-slate-400 text-xs uppercase tracking-wide">Current Depth</p>
            <p className="text-white text-2xl font-black">{currentDepth.toFixed(1)}m</p>
          </div>
          <div className="text-center">
            <p className="text-slate-400 text-xs uppercase tracking-wide">Activities</p>
            <p className="text-white text-2xl font-black">{activityLogs.length}</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-6 pb-32 overflow-y-auto">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Activity Logging Section */}
          <div className="bg-slate-800 rounded-lg p-6 space-y-6">
            <h2 className="text-xl uppercase tracking-wide text-white font-bold">
              Add Activity Block
            </h2>

            {/* Step 1: Activity Type Selection - Tall buttons */}
            <div className="space-y-4">
              <label className="text-slate-300 font-medium text-lg uppercase tracking-wide">
                Activity Type
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() =>
                    setCurrentActivity({ ...currentActivity, activityType: 'DRILLING' })
                  }
                  className={`h-32 rounded-lg font-black text-2xl uppercase tracking-wide transition-colors ${
                    currentActivity.activityType === 'DRILLING'
                      ? 'bg-green-600 text-white ring-4 ring-green-400'
                      : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                  }`}
                >
                  Drilling
                </button>
                <button
                  onClick={() =>
                    setCurrentActivity({ ...currentActivity, activityType: 'STANDBY' })
                  }
                  className={`h-32 rounded-lg font-black text-2xl uppercase tracking-wide transition-colors ${
                    currentActivity.activityType === 'STANDBY'
                      ? 'bg-red-600 text-white ring-4 ring-red-400'
                      : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                  }`}
                >
                  Standby
                </button>
              </div>
            </div>

            {/* Time Steppers - Both activity types */}
            <div className="grid grid-cols-2 gap-4">
              <TimeStepper
                label="Start Time"
                value={currentActivity.startTime}
                onChange={(value) =>
                  setCurrentActivity({ ...currentActivity, startTime: value })
                }
                step={5}
              />
              <TimeStepper
                label="End Time"
                value={currentActivity.endTime}
                onChange={(value) =>
                  setCurrentActivity({ ...currentActivity, endTime: value })
                }
                step={5}
              />
            </div>

            {/* Conditional Fields: DRILLING */}
            {currentActivity.activityType === 'DRILLING' && (
              <div className="space-y-6">
                {/* Start Depth - Read-only display */}
                <div className="space-y-4">
                  <label className="text-slate-300 font-medium text-lg uppercase tracking-wide">
                    Start Depth (from previous)
                  </label>
                  <div className="h-20 bg-slate-700 rounded-lg flex items-center justify-center">
                    <span className="text-3xl font-black text-white">
                      {currentActivity.startDepth}
                      <span className="text-xl text-slate-400 ml-2">m</span>
                    </span>
                  </div>
                </div>

                {/* End Depth - Editable */}
                <Stepper
                  label="End Depth"
                  value={currentActivity.endDepth}
                  onChange={(value) =>
                    setCurrentActivity({ ...currentActivity, endDepth: value })
                  }
                  min={currentActivity.startDepth}
                  max={1000}
                  step={1}
                  unit="m"
                />

                {/* Drill Bit Selection - Horizontal scroll */}
                <div className="space-y-4">
                  <label className="text-slate-300 font-medium text-lg uppercase tracking-wide">
                    Select Drill Bit
                  </label>
                  <div className="overflow-x-auto pb-4 -mx-6 px-6">
                    <div className="flex gap-4" style={{ minWidth: 'max-content' }}>
                      {drillBits.length === 0 ? (
                        <p className="text-slate-400 py-4">Loading drill bits...</p>
                      ) : (
                        drillBits.map((bit) => (
                          <button
                            key={bit.id}
                            onClick={() =>
                              setCurrentActivity({ ...currentActivity, drillBitId: bit.id })
                            }
                            className={`min-w-[160px] h-24 rounded-lg p-4 flex flex-col items-center justify-center transition-all ${
                              bit.id === currentActivity.drillBitId
                                ? 'bg-green-600 text-white ring-4 ring-green-400'
                                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                            }`}
                          >
                            <span className="font-bold text-lg">{bit.serial_number}</span>
                            <span className="text-sm opacity-80">{bit.type}</span>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                  {selectedBit && (
                    <p className="text-green-400 font-medium">
                      Selected: {selectedBit.serial_number} ({selectedBit.type})
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Conditional Fields: STANDBY */}
            {currentActivity.activityType === 'STANDBY' && (
              <div className="space-y-4">
                <label className="text-slate-300 font-medium text-lg uppercase tracking-wide">
                  Standby Reason
                </label>
                <button
                  onClick={() => setShowReasonSelection(!showReasonSelection)}
                  className="w-full min-h-[80px] bg-slate-700 hover:bg-slate-600 rounded-lg px-6 flex items-center justify-between text-white font-bold text-lg"
                >
                  <span>
                    {currentActivity.standbyReason || 'Select Reason...'}
                  </span>
                  <span className="text-2xl">{showReasonSelection ? '−' : '+'}</span>
                </button>

                {showReasonSelection && (
                  <div className="space-y-4 pl-4 border-l-4 border-red-600">
                    {standbyReasons.map((reason) => (
                      <SelectableCard
                        key={reason}
                        label={reason}
                        selected={reason === currentActivity.standbyReason}
                        onClick={() => {
                          setCurrentActivity({ ...currentActivity, standbyReason: reason });
                          setShowReasonSelection(false);
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Activity Timeline - Reverse chronological (newest first) */}
          {activityLogs.length > 0 && (
            <div className="bg-slate-800 rounded-lg p-6 space-y-6">
              <h2 className="text-xl uppercase tracking-wide text-white font-bold">
                Today's Activities ({activityLogs.length})
              </h2>

              <div className="space-y-4">
                {[...activityLogs].reverse().map((log) => {
                  // Find drill bit for this log
                  const logBit = log.drill_bit_id
                    ? drillBits.find((b) => b.id === log.drill_bit_id)
                    : null;

                  // Calculate duration between start and end time
                  const startTime = new Date(log.start_time);
                  const endTime = new Date(log.end_time);
                  const durationMs = endTime.getTime() - startTime.getTime();
                  const durationMins = Math.round(durationMs / 60000);

                  // Format times for display
                  const formatTimeDisplay = (isoTime: string) => {
                    const date = new Date(isoTime);
                    return `${date.getUTCHours().toString().padStart(2, '0')}:${date.getUTCMinutes().toString().padStart(2, '0')}`;
                  };

                  return (
                    <div
                      key={log.id}
                      className={`rounded-lg p-6 border-l-4 ${
                        log.activity_type === 'DRILLING'
                          ? 'bg-green-900/30 border-green-600'
                          : 'bg-red-900/30 border-red-600'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <div
                              className={`inline-block px-4 py-2 rounded font-bold text-sm uppercase tracking-wide ${
                                log.activity_type === 'DRILLING'
                                  ? 'bg-green-600 text-white'
                                  : 'bg-red-600 text-white'
                              }`}
                            >
                              {log.activity_type}
                            </div>
                            <span className="text-slate-400 text-sm font-mono">
                              {formatTimeDisplay(log.start_time)} - {formatTimeDisplay(log.end_time)}
                            </span>
                          </div>
                          {log.activity_type === 'DRILLING' && (
                            <div className="space-y-1">
                              <div className="text-white font-bold text-lg">
                                {log.start_depth}m → {log.end_depth}m
                                <span className="text-slate-400 text-sm ml-2">
                                  ({(log.end_depth! - log.start_depth!).toFixed(1)}m drilled)
                                </span>
                              </div>
                              {logBit && (
                                <div className="text-slate-400 text-sm">
                                  Bit: {logBit.serial_number} ({logBit.type})
                                </div>
                              )}
                            </div>
                          )}
                          {log.activity_type === 'STANDBY' && (
                            <div className="space-y-1">
                              <div className="text-white font-medium text-lg">
                                {log.standby_reason}
                              </div>
                              <div className="text-slate-400 text-sm">
                                Duration: {durationMins > 0 ? `${durationMins} min` : '< 1 min'}
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="text-slate-400 text-sm font-medium">
                          #{log.sequence_order}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Fixed Bottom Action Button - Green SAVE BLOCK */}
      <footer className="fixed bottom-0 left-0 right-0 p-6 bg-slate-900 border-t border-slate-800">
        <div className="max-w-3xl mx-auto">
          <button
            onClick={handleLogActivity}
            disabled={!canLogActivity || isSaving}
            className={`w-full h-24 rounded-lg font-black text-2xl uppercase tracking-wide transition-colors ${
              canLogActivity && !isSaving
                ? 'bg-green-600 hover:bg-green-500 text-white'
                : 'bg-slate-700 text-slate-500 cursor-not-allowed opacity-50'
            }`}
          >
            {isSaving ? 'Saving...' : 'Save Block'}
          </button>
        </div>
      </footer>
    </div>
  );
};

export default MainLogView;
