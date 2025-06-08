import { useState } from 'react'
import { DndContext, DragEndEvent } from '@dnd-kit/core'
import CSVUploader from './components/CSVUploader'
import Calendar from './components/Calendar'
import { Assistant, DaySchedule, AvailabilityWarning } from './types'
import { generateScheduleSuggestions, checkAvailabilityWarnings, COLORS } from './utils/planningUtils'

function App() {
  const [assistants, setAssistants] = useState<Assistant[]>([])
  const [schedule, setSchedule] = useState<DaySchedule[]>([])
  const [availabilityWarnings, setAvailabilityWarnings] = useState<AvailabilityWarning[]>([])

  const handleCSVUpload = (data: Assistant[]) => {
    const assistantsWithColor = data.map((assistant, index) => ({
      ...assistant,
      color: COLORS[index % COLORS.length]
    }))
    setAssistants(assistantsWithColor)
    // Initialize empty schedule based on CSV data
    const initialSchedule = assistantsWithColor[0]?.availability.map(day => ({
      date: day.date,
      shift: [],
      backup: []
    })) || []

    // Generate initial schedule suggestions
    const suggestedSchedule = generateScheduleSuggestions(assistantsWithColor, initialSchedule)
    setSchedule(suggestedSchedule)

    // Check for availability warnings
    const warnings = checkAvailabilityWarnings(assistantsWithColor)
    setAvailabilityWarnings(warnings)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (!over) return

    // Handle dropping in trash zone
    if (over.id === 'trash-zone') {
      // Only handle drops from the calendar (not from the name list)
      if (typeof active.id === 'string' && !active.id.startsWith('name-list-')) {
        const [assistantName, sourceDate, sourceRoleStr] = active.id
          .toString()
          .split('|')
        const sourceIndex = parseInt(sourceRoleStr.split('|')[1], 10)
        const sourceRole = sourceRoleStr.split('|')[0] as 'shift' | 'backup'

        setSchedule(currentSchedule => {
          const newSchedule = JSON.parse(JSON.stringify(currentSchedule))
          const sourceDay = newSchedule.find((d: DaySchedule) => d.date === sourceDate)
          
          if (!sourceDay) return currentSchedule

          // Remove the assistant from the source position
          const sourceList = sourceDay[sourceRole]
          sourceList.splice(sourceIndex, 1)

          return newSchedule
        })
      }
      return
    }

    // over.id format: "date-role"
    const overId = over.id.toString()
    const overParts = overId.split('-')
    const targetRole = overParts.pop() as 'shift' | 'backup'
    const targetDate = overParts.join('-')

    // Dragged from the name list
    if (typeof active.id === 'string' && active.id.startsWith('name-list-')) {
      const assistantName = active.id.replace('name-list-', '')

      setSchedule(currentSchedule => {
        const newSchedule = JSON.parse(JSON.stringify(currentSchedule))
        const targetDay = newSchedule.find((d: DaySchedule) => d.date === targetDate)
        if (!targetDay) return currentSchedule

        const assistant = assistants.find(a => a.name === assistantName)
        if (!assistant) return currentSchedule

        const targetList = targetDay[targetRole]
        // Avoid duplicates
        if (!targetList.find((a: Assistant) => a.name === assistant.name)) {
          targetList.push(assistant)
        }

        return newSchedule
      })

      return
    }

    // active.id format: "assistantName|date|role|index" when dragging from the calendar
    const [, sourceDate, sourceRoleStr] = active.id
      .toString()
      .split('|')
    const sourceIndex = parseInt(sourceRoleStr.split('|')[1], 10)
    const sourceRole = sourceRoleStr.split('|')[0] as 'shift' | 'backup'

    setSchedule(currentSchedule => {
      // Deep copy to avoid mutation issues
      const newSchedule = JSON.parse(JSON.stringify(currentSchedule))

      const sourceDay = newSchedule.find((d: DaySchedule) => d.date === sourceDate)
      const targetDay = newSchedule.find((d: DaySchedule) => d.date === targetDate)

      if (!sourceDay || !targetDay) {
        return currentSchedule // Should not happen
      }

      // Remove from source and keep the moved assistant with all its data
      const sourceList = sourceDay[sourceRole]
      const [movedAssistant] = sourceList.splice(sourceIndex, 1)
      if (!movedAssistant) {
        return currentSchedule
      }

      // Add to target
      const targetList = targetDay[targetRole]
      targetList.push(movedAssistant)

      return newSchedule
    })
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4">
          <h1 className="text-3xl font-bold text-gray-900">
            Assistenz-Kalender Tool
          </h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <CSVUploader onUpload={handleCSVUpload} />
          
          {availabilityWarnings.length > 0 && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-700 rounded-md">
              <h2 className="text-lg font-medium text-yellow-900 mb-2">Verfügbarkeitswarnungen</h2>
              <ul className="list-disc pl-5">
                {availabilityWarnings.map((warning, index) => (
                  <li key={index} className="text-yellow-800">
                    {warning.assistant.name} ist in KW {warning.weekNumber} nur an {warning.availableDays} Tagen verfügbar
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {assistants.length > 0 && (
            <DndContext onDragEnd={handleDragEnd}>
              <Calendar 
                assistants={assistants}
                schedule={schedule}
                onScheduleChange={setSchedule}
              />
            </DndContext>
          )}
        </div>
      </main>
    </div>
  )
}

export default App 