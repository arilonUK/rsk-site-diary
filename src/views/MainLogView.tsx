import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { DrillBit, ActivityType, ActivityLog } from '../types/database';
import { SelectableCard } from '../components/SelectableCard';
import { Stepper } from '../components/Stepper';

/**
 * MainLogView - Main Shift Hub (Spec 5.3)
 *
 * Goal: High-level overview of shift progress and entry point for data.
 *
 * Following Prime Directives:
 * - No keyboard inputs (steppers, cards, toggles only)
 * - 80px+ touch targets throughout
 * - High-contrast industrial design
 */

interface ShiftContext {
  shiftId: string;
  rigId: string;
  rigName: string;
  crewId: string;
  crewName: string;
}

interface CurrentActivity {
  activityType: ActivityType;
  startDepth: number;
  endDepth: number;
  drillBitId: string;
  standbyReason: string;
}

export const MainLogView = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const shiftContext = location.state as ShiftContext | null;

  // Lookup data from Supabase
  const [drillBits, setDrillBits] = useState<DrillBit[]>([]);

  // Current activity being logged
  const [currentActivity, setCurrentActivity] = useState<CurrentActivity>({
    activityType: 'DRILLING',
    startDepth: 0,
    endDepth: 0,
    drillBitId: '',
    standbyReason: '',
  });

  // Activity log timeline
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);

  // UI state
  const [showBitSelection, setShowBitSelection] = useState(false);
  const [showReasonSelection, setShowReasonSelection] = useState(false);

  // Load drill bits on mount
  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      try {
        const { data: bitsData } = await supabase
          .from('drill_bits')
          .select('*')
          .eq('status', 'Available')
          .order('serial_number');
        if (mounted && bitsData) setDrillBits(bitsData);
      } catch (error) {
        console.error('Error loading drill bits:', error);
      }
    };

    fetchData();
    return () => { mounted = false; };
  }, []);

  const selectedBit = drillBits.find((b) => b.id === currentActivity.drillBitId);

  const canLogActivity =
    currentActivity.activityType === 'DRILLING'
      ? currentActivity.drillBitId && currentActivity.endDepth > currentActivity.startDepth
      : currentActivity.standbyReason;

  const handleLogActivity = async () => {
    if (!canLogActivity || !shiftContext) return;

    // Create activity log entry
    const newLog: ActivityLog = {
      id: crypto.randomUUID(),
      shift_id: shiftContext.shiftId,
      sequence_order: activityLogs.length + 1,
      start_time: new Date().toISOString(),
      end_time: new Date().toISOString(),
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

    // TODO: Save to Supabase
    // const { error } = await supabase.from('activity_logs').insert(newLog);

    setActivityLogs([...activityLogs, newLog]);

    // Reset form - continue from last depth
    setCurrentActivity({
      activityType: 'DRILLING',
      startDepth: currentActivity.endDepth,
      endDepth: currentActivity.endDepth,
      drillBitId: currentActivity.drillBitId,
      standbyReason: '',
    });
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
      {/* Header with Shift Info */}
      <header className="bg-slate-800 py-4 px-6">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl uppercase tracking-wide text-white font-black text-center">
            Activity Log
          </h1>
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
              Log Activity
            </h2>

            {/* Activity Type Toggle */}
            <div className="space-y-4">
              <label className="text-slate-300 font-medium text-lg uppercase tracking-wide">
                Activity Type
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() =>
                    setCurrentActivity({ ...currentActivity, activityType: 'DRILLING' })
                  }
                  className={`h-24 rounded-lg font-black text-xl uppercase tracking-wide transition-colors ${
                    currentActivity.activityType === 'DRILLING'
                      ? 'bg-green-600 text-white'
                      : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                  }`}
                >
                  Drilling
                </button>
                <button
                  onClick={() =>
                    setCurrentActivity({ ...currentActivity, activityType: 'STANDBY' })
                  }
                  className={`h-24 rounded-lg font-black text-xl uppercase tracking-wide transition-colors ${
                    currentActivity.activityType === 'STANDBY'
                      ? 'bg-red-600 text-white'
                      : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                  }`}
                >
                  Standby
                </button>
              </div>
            </div>

            {/* Conditional Fields: DRILLING */}
            {currentActivity.activityType === 'DRILLING' && (
              <div className="space-y-6">
                <Stepper
                  label="Start Depth"
                  value={currentActivity.startDepth}
                  onChange={(value) =>
                    setCurrentActivity({ ...currentActivity, startDepth: value })
                  }
                  min={0}
                  max={1000}
                  step={1}
                  unit="m"
                />

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

                {/* Drill Bit Selection */}
                <div className="space-y-4">
                  <label className="text-slate-300 font-medium text-lg uppercase tracking-wide">
                    Drill Bit
                  </label>
                  <button
                    onClick={() => setShowBitSelection(!showBitSelection)}
                    className="w-full min-h-[80px] bg-slate-700 hover:bg-slate-600 rounded-lg px-6 flex items-center justify-between text-white font-bold text-lg"
                  >
                    <span>
                      {selectedBit
                        ? `${selectedBit.serial_number} (${selectedBit.type})`
                        : 'Select Drill Bit...'}
                    </span>
                    <span className="text-2xl">{showBitSelection ? '−' : '+'}</span>
                  </button>

                  {showBitSelection && (
                    <div className="space-y-4 pl-4 border-l-4 border-green-600">
                      {drillBits.length === 0 ? (
                        <p className="text-slate-400 py-4">Loading drill bits...</p>
                      ) : (
                        drillBits.map((bit) => (
                          <SelectableCard
                            key={bit.id}
                            label={bit.serial_number}
                            sublabel={bit.type}
                            selected={bit.id === currentActivity.drillBitId}
                            onClick={() => {
                              setCurrentActivity({ ...currentActivity, drillBitId: bit.id });
                              setShowBitSelection(false);
                            }}
                          />
                        ))
                      )}
                    </div>
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

          {/* Activity Timeline */}
          {activityLogs.length > 0 && (
            <div className="bg-slate-800 rounded-lg p-6 space-y-6">
              <h2 className="text-xl uppercase tracking-wide text-white font-bold">
                Today's Activities ({activityLogs.length})
              </h2>

              <div className="space-y-4">
                {activityLogs.map((log, index) => (
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
                        <div
                          className={`inline-block px-4 py-2 rounded font-bold text-sm uppercase tracking-wide ${
                            log.activity_type === 'DRILLING'
                              ? 'bg-green-600 text-white'
                              : 'bg-red-600 text-white'
                          }`}
                        >
                          {log.activity_type}
                        </div>
                        {log.activity_type === 'DRILLING' && (
                          <div className="text-white font-bold text-lg">
                            {log.start_depth}m → {log.end_depth}m
                            <span className="text-slate-400 text-sm ml-2">
                              ({(log.end_depth! - log.start_depth!).toFixed(1)}m drilled)
                            </span>
                          </div>
                        )}
                        {log.activity_type === 'STANDBY' && (
                          <div className="text-white font-medium text-lg">
                            {log.standby_reason}
                          </div>
                        )}
                      </div>
                      <div className="text-slate-400 text-sm font-medium">
                        #{index + 1}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Fixed Bottom Action Button */}
      <footer className="fixed bottom-0 left-0 right-0 p-6 bg-slate-900 border-t border-slate-800">
        <div className="max-w-3xl mx-auto">
          <button
            onClick={handleLogActivity}
            disabled={!canLogActivity}
            className={`w-full h-24 rounded-lg font-black text-2xl uppercase tracking-wide transition-colors ${
              canLogActivity
                ? 'bg-yellow-500 hover:bg-yellow-400 text-black'
                : 'bg-slate-700 text-slate-500 cursor-not-allowed opacity-50'
            }`}
          >
            + Add Activity Block
          </button>
        </div>
      </footer>
    </div>
  );
};

export default MainLogView;
