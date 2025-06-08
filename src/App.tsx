import { useState } from 'react'
import { DndContext, DragEndEvent } from '@dnd-kit/core'
import CSVUploader from './components/CSVUploader'
import Calendar from './components/Calendar'
import { Assistant, DaySchedule, AvailabilityWarning } from './types'
import { generateScheduleSuggestions, checkAvailabilityWarnings } from './utils/planningUtils'

function App() {
  const [assistants, setAssistants] = useState<Assistant[]>([])
  const [schedule, setSchedule] = useState<DaySchedule[]>([])
  const [availabilityWarnings, setAvailabilityWarnings] = useState<AvailabilityWarning[]>([])

  const handleCSVUpload = (data: Assistant[]) => {
    setAssistants(data)
    // Initialize empty schedule based on CSV data
    const initialSchedule = data[0]?.availability.map(day => ({
      date: day.date,
      shift: [],
      backup: []
    })) || []
    
    // Generate initial schedule suggestions
    const suggestedSchedule = generateScheduleSuggestions(data, initialSchedule)
    setSchedule(suggestedSchedule)
    
    // Check for availability warnings
    const warnings = checkAvailabilityWarnings(data)
    setAvailabilityWarnings(warnings)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    
    if (!over) return;
    
    // active.id format: "assistantName|date|role|index"
    const [assistantName, sourceDate, sourceRoleStr, sourceIndexStr] = active.id.toString().split('|');
    const sourceIndex = parseInt(sourceIndexStr, 10);
    const sourceRole = sourceRoleStr as 'shift' | 'backup';

    // over.id format: "date-role"
    const overId = over.id.toString();
    const parts = overId.split('-');
    const targetRole = parts.pop() as 'shift' | 'backup';
    const targetDate = parts.join('-');

    setSchedule(currentSchedule => {
      // Deep copy to avoid mutation issues
      const newSchedule = JSON.parse(JSON.stringify(currentSchedule));

      const sourceDay = newSchedule.find((d: DaySchedule) => d.date === sourceDate);
      const targetDay = newSchedule.find((d: DaySchedule) => d.date === targetDate);

      if (!sourceDay || !targetDay) {
        return currentSchedule; // Should not happen
      }
      
      // Remove from source and keep the moved assistant with all its data
      const sourceList = sourceDay[sourceRole];
      const [movedAssistant] = sourceList.splice(sourceIndex, 1);
      if (!movedAssistant) {
        return currentSchedule;
      }

      // Add to target
      const targetList = targetDay[targetRole];
      targetList.push(movedAssistant);
      
      return newSchedule;
    });
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
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <h2 className="text-lg font-medium text-yellow-800 mb-2">Verfügbarkeitswarnungen</h2>
              <ul className="list-disc pl-5">
                {availabilityWarnings.map((warning, index) => (
                  <li key={index} className="text-yellow-700">
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