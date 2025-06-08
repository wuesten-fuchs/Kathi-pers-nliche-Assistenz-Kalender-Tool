export interface Availability {
  date: string;
  status: 'Yes' | 'No' | 'Under reserve' | 'Unknown';
}

export interface Assistant {
  name: string;
  availability: Availability[];
  desiredShifts?: string; // Format: "3-4/3-4"
  color: string;
  assignedShifts: number;
  assignedBackups: number;
  lowAvailabilityWarning?: boolean;
}

export interface DaySchedule {
  date: string;
  shift: Assistant[];
  backup: Assistant[];
}

export interface AvailabilityWarning {
  assistant: Assistant;
  weekNumber: number;
  availableDays: number;
} 