import { Assistant, DaySchedule, AvailabilityWarning } from '../types'
import { getWeek } from 'date-fns'

// Farbpalette für die Assistenten
export const COLORS = [
  '#FF6B6B', // Rot
  '#4ECDC4', // Türkis
  '#45B7D1', // Blau
  '#96CEB4', // Mint
  '#FFEEAD', // Gelb
  '#D4A5A5', // Rosa
  '#9B59B6', // Lila
  '#3498DB', // Hellblau
  '#E67E22', // Orange
  '#2ECC71', // Grün
]

// Extrahiere gewünschtes Pensum aus dem Namen
export function extractDesiredShifts(name: string): string | undefined {
  const match = name.match(/\((\d+-\d+\/\d+-\d+)\)/)
  return match ? match[1] : undefined
}

// Berechne die Verfügbarkeit pro Woche
export function calculateWeeklyAvailability(assistant: Assistant): AvailabilityWarning[] {
  const weeklyAvailability = new Map<number, number>()
  
  assistant.availability.forEach(day => {
    if (day.status === 'Yes') {
      const weekNumber = getWeek(new Date(day.date))
      weeklyAvailability.set(weekNumber, (weeklyAvailability.get(weekNumber) || 0) + 1)
    }
  })

  return Array.from(weeklyAvailability.entries())
    .filter(([_, days]) => days < 3)
    .map(([weekNumber, days]) => ({
      assistant,
      weekNumber,
      availableDays: days
    }))
}

// Generiere Vorschläge für die Schichtplanung
export function generateScheduleSuggestions(
  assistants: Assistant[],
  schedule: DaySchedule[]
): DaySchedule[] {
  // Initialisiere Zähler für zugewiesene Schichten
  const updatedAssistants = assistants.map(assistant => ({
    ...assistant,
    assignedShifts: 0,
    assignedBackups: 0,
    color: COLORS[assistants.indexOf(assistant) % COLORS.length]
  }))

  // Sortiere Assistenten nach Anzahl der zugewiesenen Schichten
  const getSortedAssistants = (date: string, role: 'shift' | 'backup') => {
    return [...updatedAssistants]
      .filter(assistant => {
        const availability = assistant.availability.find(a => a.date === date)
        return availability?.status === 'Yes'
      })
      .sort((a, b) => {
        // Berücksichtige gewünschtes Pensum
        const aDesired = extractDesiredShifts(a.name)
        const bDesired = extractDesiredShifts(b.name)
        
        // Zuerst nach Anzahl der zugewiesenen Schichten
        const shiftDiff = (role === 'shift' ? a.assignedShifts : a.assignedBackups) - 
                         (role === 'shift' ? b.assignedShifts : b.assignedBackups)
        if (shiftDiff !== 0) return shiftDiff

        // Dann nach gewünschtem Pensum
        if (aDesired && bDesired) {
          const [aMin] = aDesired.split('/')[0].split('-').map(Number)
          const [bMin] = bDesired.split('/')[0].split('-').map(Number)
          return aMin - bMin
        }
        return 0
      })
  }

  // Generiere Vorschläge für jeden Tag
  return schedule.map(day => {
    const availableAssistants = getSortedAssistants(day.date, 'shift')
    const availableBackups = getSortedAssistants(day.date, 'backup')
      .filter(a => a !== availableAssistants[0]) // Verhindere doppelte Zuweisung

    const suggestedShift = availableAssistants[0] || null
    const suggestedBackup = availableBackups[0] || null

    // Aktualisiere Zähler
    if (suggestedShift) {
      suggestedShift.assignedShifts++
    }
    if (suggestedBackup) {
      suggestedBackup.assignedBackups++
    }

    return {
      ...day,
      shift: suggestedShift ? [suggestedShift] : [],
      backup: suggestedBackup ? [suggestedBackup] : []
    }
  })
}

// Überprüfe Verfügbarkeitswarnungen
export function checkAvailabilityWarnings(assistants: Assistant[]): AvailabilityWarning[] {
  return assistants.flatMap(calculateWeeklyAvailability)
} 