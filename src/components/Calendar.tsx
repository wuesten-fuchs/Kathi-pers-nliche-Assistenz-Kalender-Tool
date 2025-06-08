import { useDraggable, useDroppable } from '@dnd-kit/core'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'
import { Assistant, DaySchedule } from '../types'

interface CalendarProps {
  assistants: Assistant[]
  schedule: DaySchedule[]
  onScheduleChange: (schedule: DaySchedule[]) => void
}

interface AssistantCardProps {
  assistant: Assistant
  date: string
  role: 'shift' | 'backup'
  index: number
  onMove: (direction: 'left' | 'right' | 'up' | 'down') => void
}

interface DropZoneProps {
  date: string
  role: 'shift' | 'backup'
  assistants: Assistant[]
  onMove: (assistant: Assistant, direction: 'left' | 'right' | 'up' | 'down') => void
}

const AssistantCard: React.FC<AssistantCardProps> = ({ assistant, date, role, index }) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: `${assistant.name}|${date}|${role}|${index}`,
    data: { assistant }
  })

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : {}

  return (
    <div 
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="relative bg-white shadow rounded-lg p-4 mb-2 min-h-[80px] flex flex-col items-center"
    >
      <div 
        className="text-lg font-medium mb-2 cursor-move w-full text-center"
        style={{ backgroundColor: assistant.color, color: '#fff', padding: '0.5rem', borderRadius: '0.25rem' }}
      >
        {assistant.name}
      </div>
    </div>
  )
}

const DropZone: React.FC<DropZoneProps> = ({ date, role, assistants, onMove }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `${date}-${role}`,
    data: { date, role }
  })

  const conflict = assistants.length > 1;

  return (
    <div
      ref={setNodeRef}
      className={`min-h-[100px] p-4 rounded-lg transition-colors ${
        isOver ? 'bg-gray-100' : ''
      } ${
        conflict ? 'border-2 border-red-500' : 'border border-gray-200'
      }`}
    >
      {assistants.length > 0 ? (
        assistants.map((assistant, index) => (
          <AssistantCard 
            key={`${assistant.name}-${index}`} 
            assistant={assistant} 
            date={date} 
            role={role} 
            index={index}
            onMove={(direction) => onMove(assistant, direction)}
          />
        ))
      ) : (
        <div className="text-gray-400 text-lg p-4 text-center">Nicht zugewiesen</div>
      )}
    </div>
  )
}

const NameList: React.FC<{ assistants: Assistant[] }> = ({ assistants }) => {
  return (
    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
      <div className="font-medium text-lg text-gray-500 mb-4">Verfügbare Assistenten</div>
      <div className="flex flex-wrap gap-2">
        {assistants.map((assistant) => {
          const { attributes, listeners, setNodeRef, transform } = useDraggable({
            id: `name-list-${assistant.name}`,
            data: { assistant }
          })

          const style = {
            transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
            backgroundColor: assistant.color
          }

          return (
            <div
              key={assistant.name}
              ref={setNodeRef}
              style={style}
              {...listeners}
              {...attributes}
              className="cursor-move px-4 py-2 rounded-lg text-white font-medium"
            >
              {assistant.name}
            </div>
          )
        })}
      </div>
    </div>
  )
}

const Calendar: React.FC<CalendarProps> = ({ assistants, schedule, onScheduleChange }) => {
  const handleMove = (assistant: Assistant, currentDate: string, currentRole: 'shift' | 'backup', direction: 'left' | 'right' | 'up' | 'down') => {
    const currentDayIndex = schedule.findIndex(day => day.date === currentDate);
    if (currentDayIndex === -1) return;

    const newSchedule = [...schedule];
    const currentDay = newSchedule[currentDayIndex];
    
    // Entferne den Assistenten von der aktuellen Position
    const currentList = currentDay[currentRole];
    const assistantIndex = currentList.findIndex(a => a.name === assistant.name);
    if (assistantIndex === -1) return;
    currentList.splice(assistantIndex, 1);

    // Berechne die neue Position
    let targetDayIndex = currentDayIndex;
    let targetRole = currentRole;

    switch (direction) {
      case 'left':
        targetDayIndex = Math.max(0, currentDayIndex - 1);
        break;
      case 'right':
        targetDayIndex = Math.min(schedule.length - 1, currentDayIndex + 1);
        break;
      case 'up':
        targetRole = 'shift';
        break;
      case 'down':
        targetRole = 'backup';
        break;
    }

    // Füge den Assistenten an der neuen Position hinzu
    const targetDay = newSchedule[targetDayIndex];
    targetDay[targetRole].push(assistant);

    onScheduleChange(newSchedule);
  };

  return (
    <div className="p-4">
      <NameList assistants={assistants} />
      <div className="overflow-x-auto">
        <div className="calendar-grid" style={{ gridTemplateColumns: `repeat(${schedule.length}, minmax(300px, 1fr))` }}>
          {schedule.map((day) => (
            <div key={day.date} className="calendar-cell border-r border-gray-200 p-4 flex flex-col" style={{ minHeight: '340px' }}>
              <div className="font-semibold mb-4 text-center text-xl">
                {format(new Date(day.date), 'EEEE', { locale: de })}
                <br/>
                <span className="text-lg font-normal text-gray-600">
                  {format(new Date(day.date), 'dd.MM.', { locale: de })}
                </span>
              </div>
              
              <div className="space-y-6 flex-1">
                <div>
                  <div className="font-medium text-lg text-gray-500 mb-2">Hauptdienst</div>
                  <DropZone
                    date={day.date}
                    role="shift"
                    assistants={day.shift}
                    onMove={(assistant, direction) => handleMove(assistant, day.date, 'shift', direction)}
                  />
                </div>

                <div>
                  <div className="font-medium text-lg text-gray-500 mb-2">Bereitschaft</div>
                  <DropZone
                    date={day.date}
                    role="backup"
                    assistants={day.backup}
                    onMove={(assistant, direction) => handleMove(assistant, day.date, 'backup', direction)}
                  />
                </div>
              </div>
              <div style={{ minHeight: '80px' }}></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Calendar 