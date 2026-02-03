/**
 * Database Types - Based on Supabase Schema
 *
 * These types mirror the database schema defined in 02_DATABASE_SCHEMA.md
 */

export interface Rig {
  id: string; // UUID
  name: string; // e.g., "Rig 001 (Comacchio)"
}

export interface CrewMember {
  id: string; // UUID
  name: string; // e.g., "John Smith"
  role: string; // e.g., "Lead Driller", "Second Man"
}

export interface DrillBit {
  id: string; // UUID
  serial_number: string; // e.g., "SN-B555"
  type: string; // e.g., "PDC 150mm"
  status: 'Available' | 'In Use' | 'Retired';
}

export interface Shift {
  id: string; // UUID
  date: string; // ISO date string
  rig_id: string; // UUID reference to rigs table
  lead_driller_id: string; // UUID reference to crew_members table
  safety_check_completed: boolean;
  status: 'In Progress' | 'Submitted';
}

export type ActivityType = 'DRILLING' | 'STANDBY';

export interface ActivityLog {
  id: string; // UUID
  shift_id: string; // UUID reference to shifts table
  sequence_order: number; // Chronological order
  start_time: string; // ISO timestamp
  end_time: string; // ISO timestamp
  activity_type: ActivityType;
  // DRILLING fields (only used when activity_type is DRILLING)
  start_depth?: number;
  end_depth?: number;
  drill_bit_id?: string; // UUID reference to drill_bits table
  // STANDBY fields (only used when activity_type is STANDBY)
  standby_reason?: string; // e.g., "Weather", "Client Delay", "Maintenance"
}

// Helper type for creating new records (omits auto-generated fields)
export type NewShift = Omit<Shift, 'id'>;
export type NewActivityLog = Omit<ActivityLog, 'id'>;
