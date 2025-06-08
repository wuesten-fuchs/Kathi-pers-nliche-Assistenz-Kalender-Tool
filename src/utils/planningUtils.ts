import { Assistant, DaySchedule, AvailabilityWarning } from '../types'
import { getWeek } from 'date-fns'

// Farbpalette für die Assistenten - WCAG AAA compliant
export const COLORS = [
  '#0056b3', // Dunkelblau
  '#006400', // Dunkelgrün
  '#8B0000', // Dunkelrot
  '#4B0082', // Indigo
  '#800080', // Lila
  '#006666', // Dunkeltürkis
  '#663300', // Dunkelbraun
  '#8B4513', // Sattelbraun
  '#2F4F4F', // Dunkelschiefergrau
  '#4B0082', // Indigo
  '#800000', // Dunkelrot
  '#006400', // Dunkelgrün
]

// Function to determine if text should be light or dark based on background color
export function getTextColor(backgroundColor: string): string {
  // Convert hex to RGB
  const hex = backgroundColor.replace('#', '')
  const r = parseInt(hex.substr(0, 2), 16)
  const g = parseInt(hex.substr(2, 2), 16)
  const b = parseInt(hex.substr(4, 2), 16)
  
  // Calculate relative luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  
  // Return white for dark backgrounds, black for light backgrounds
  return luminance < 0.5 ? '#FFFFFF' : '#000000'
}

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