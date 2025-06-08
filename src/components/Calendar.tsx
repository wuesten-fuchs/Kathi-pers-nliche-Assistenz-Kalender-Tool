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
}

interface DropZoneProps {
  date: string
  role: 'shift' | 'backup'
  assistants: Assistant[]
}

const AssistantCard: React.FC<AssistantCardProps> = ({ assistant, date, role, index }) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: `${assistant.name}|${date}|${role}|${index}`,
    data: { assistant }
  })

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    backgroundColor: assistant.color,
    color: '#fff'
  } : {
    backgroundColor: assistant.color,
    color: '#fff'
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="assistant-card cursor-move p-2 rounded mb-1"
    >
      {assistant.name}
    </div>
  )
}

const DropZone: React.FC<DropZoneProps> = ({ date, role, assistants }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `${date}-${role}`,
    data: { date, role }
  })

  const conflict = assistants.length > 1;

  return (
    <div
      ref={setNodeRef}
      className={`min-h-[40px] p-2 rounded transition-colors ${
        isOver ? 'bg-gray-100' : ''
      } ${
        conflict ? 'border-2 border-red-500' : ''
      }`}
    >
      {assistants.length > 0 ? (
        assistants.map((assistant, index) => (
          <AssistantCard key={`${assistant.name}-${index}`} assistant={assistant} date={date} role={role} index={index} />
        ))
      ) : (
        <div className="text-gray-400 text-sm">Nicht zugewiesen</div>
      )}
    </div>
  )
}

const Calendar: React.FC<CalendarProps> = ({ schedule }) => {
  return (
    <div className="overflow-x-auto">
      <div className="calendar-grid" style={{ gridTemplateColumns: `repeat(${schedule.length}, minmax(200px, 1fr))` }}>
        {schedule.map((day) => (
          <div key={day.date} className="calendar-cell border-r border-gray-200 p-2">
            <div className="font-semibold mb-2 text-center">
              {format(new Date(day.date), 'EEEE', { locale: de })}
              <br/>
              <span className="text-sm font-normal text-gray-600">
                {format(new Date(day.date), 'dd.MM.', { locale: de })}
              </span>
            </div>
            
            <div className="space-y-4">
              <div>
                <div className="font-medium text-sm text-gray-500 mb-1">Hauptdienst</div>
                <DropZone
                  date={day.date}
                  role="shift"
                  assistants={day.shift}
                />
              </div>

              <div>
                <div className="font-medium text-sm text-gray-500 mb-1">Bereitschaft</div>
                <DropZone
                  date={day.date}
                  role="backup"
                  assistants={day.backup}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Calendar 