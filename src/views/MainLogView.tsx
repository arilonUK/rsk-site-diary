import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Rig, CrewMember, DrillBit, ActivityType, ActivityLog } from '../types/database';
import { SelectableCard } from '../components/SelectableCard';
import { Stepper } from '../components/Stepper';

/**
 * MainLogView - Core activity logging interface
 *
 * Following Prime Directives:
 * - No keyboard inputs (steppers, cards, toggles only)
 * - 80px+ touch targets throughout
 * - High-contrast industrial design
 */

interface CurrentActivity {
  activityType: ActivityType;
  startDepth: number;
  endDepth: number;
  drillBitId: string;
  standbyReason: string;
}

export const MainLogView = () => {
  // Lookup data from Supabase
  const [rigs, setRigs] = useState<Rig[]>([]);
  const [crewMembers, setCrewMembers] = useState<CrewMember[]>([]);
  const [drillBits, setDrillBits] = useState<DrillBit[]>([]);

  // Shift header selections
  const [selectedRigId, setSelectedRigId] = useState<string>('');
  const [selectedCrewId, setSelectedCrewId] = useState<string>('');

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
  const [showRigSelection, setShowRigSelection] = useState(false);
  const [showCrewSelection, setShowCrewSelection] = useState(false);
  const [showBitSelection, setShowBitSelection] = useState(false);
  const [showReasonSelection, setShowReasonSelection] = useState(false);

  // Load lookup data on mount
  useEffect(() => {
    loadLookupData();
  }, []);

  const loadLookupData = async () => {
    try {
      // Load rigs
      const { data: rigsData } = await supabase
        .from('rigs')
        .select('*')
        .order('name');
      if (rigsData) setRigs(rigsData);

      // Load crew members
      const { data: crewData } = await supabase
        .from('crew_members')
        .select('*')
        .order('name');
      if (crewData) setCrewMembers(crewData);

      // Load available drill bits
      const { data: bitsData } = await supabase
        .from('drill_bits')
        .select('*')
        .eq('status', 'Available')
        .order('serial_number');
      if (bitsData) setDrillBits(bitsData);
    } catch (error) {
      console.error('Error loading lookup data:', error);
    }
  };

  const selectedRig = rigs.find((r) => r.id === selectedRigId);
  const selectedCrew = crewMembers.find((c) => c.id === selectedCrewId);
  const selectedBit = drillBits.find((b) => b.id === currentActivity.drillBitId);

  const shiftConfigured = selectedRigId && selectedCrewId;

  const canLogActivity =
    shiftConfigured &&
    (currentActivity.activityType === 'DRILLING'
      ? currentActivity.drillBitId && currentActivity.endDepth > currentActivity.startDepth
      : currentActivity.standbyReason);

  const handleLogActivity = () => {
    if (!canLogActivity) return;

    // Create activity log entry
    const newLog: ActivityLog = {
      id: crypto.randomUUID(),
      shift_id: 'temp-shift-id', // TODO: Create shift record first
      sequence_order: activityLogs.length + 1,
      start_time: new Date().toISOString(),
      end_time: new Date().toISOString(), // TODO: Real time tracking
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

    setActivityLogs([...activityLogs, newLog]);

    // Reset form
    setCurrentActivity({
      activityType: 'DRILLING',
      startDepth: currentActivity.endDepth, // Continue from last depth
      endDepth: currentActivity.endDepth,
      drillBitId: currentActivity.drillBitId, // Keep same bit
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

  return (
    <div className="min-h-screen bg-slate-900 p-6 pb-32">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl uppercase tracking-wide text-white font-black">
            Activity Log
          </h1>
          <p className="text-slate-400 text-sm uppercase tracking-wide">
            {new Date().toLocaleDateString('en-GB', {
              weekday: 'short',
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })}
          </p>
        </div>

        {/* Shift Configuration Section */}
        <div className="bg-slate-800 rounded-lg p-6 space-y-6">
          <h2 className="text-xl uppercase tracking-wide text-white font-bold">
            Shift Details
          </h2>

          {/* Rig Selection */}
          <div className="space-y-4">
            <label className="text-slate-300 font-medium text-lg uppercase tracking-wide">
              Rig
            </label>
            <button
              onClick={() => setShowRigSelection(!showRigSelection)}
              className="w-full h-20 bg-slate-700 hover:bg-slate-600 rounded-lg px-6 flex items-center justify-between text-white font-bold text-lg"
            >
              <span>{selectedRig ? selectedRig.name : 'Select Rig...'}</span>
              <span className="text-2xl">{showRigSelection ? '−' : '+'}</span>
            </button>

            {showRigSelection && (
              <div className="space-y-4 pl-4 border-l-4 border-yellow-500">
                {rigs.map((rig) => (
                  <SelectableCard
                    key={rig.id}
                    label={rig.name}
                    selected={rig.id === selectedRigId}
                    onClick={() => {
                      setSelectedRigId(rig.id);
                      setShowRigSelection(false);
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Crew Selection */}
          <div className="space-y-4">
            <label className="text-slate-300 font-medium text-lg uppercase tracking-wide">
              Lead Driller
            </label>
            <button
              onClick={() => setShowCrewSelection(!showCrewSelection)}
              className="w-full h-20 bg-slate-700 hover:bg-slate-600 rounded-lg px-6 flex items-center justify-between text-white font-bold text-lg"
            >
              <span>
                {selectedCrew ? `${selectedCrew.name} (${selectedCrew.role})` : 'Select Crew...'}
              </span>
              <span className="text-2xl">{showCrewSelection ? '−' : '+'}</span>
            </button>

            {showCrewSelection && (
              <div className="space-y-4 pl-4 border-l-4 border-yellow-500">
                {crewMembers.map((crew) => (
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
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Activity Logging Section */}
        {shiftConfigured && (
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
                {/* Start Depth */}
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

                {/* End Depth */}
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
                    className="w-full h-20 bg-slate-700 hover:bg-slate-600 rounded-lg px-6 flex items-center justify-between text-white font-bold text-lg"
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
                      {drillBits.map((bit) => (
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
                      ))}
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
                  className="w-full h-20 bg-slate-700 hover:bg-slate-600 rounded-lg px-6 flex items-center justify-between text-white font-bold text-lg"
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

            {/* Log Activity Button */}
            <button
              onClick={handleLogActivity}
              disabled={!canLogActivity}
              className={`w-full h-24 rounded-lg font-black text-2xl uppercase tracking-wide transition-colors ${
                canLogActivity
                  ? 'bg-yellow-500 hover:bg-yellow-400 text-black'
                  : 'bg-slate-700 text-slate-500 cursor-not-allowed opacity-50'
              }`}
            >
              Log Activity
            </button>
          </div>
        )}

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
                  className={`rounded-lg p-6 ${
                    log.activity_type === 'DRILLING' ? 'bg-green-900/30' : 'bg-red-900/30'
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
                            ({log.end_depth! - log.start_depth!}m drilled)
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

        {/* Placeholder for not configured */}
        {!shiftConfigured && (
          <div className="bg-slate-800 rounded-lg p-8 text-center">
            <p className="text-slate-400 text-lg">
              Please configure shift details above to begin logging activities
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MainLogView;
