import { useCallback } from 'react'
import Papa from 'papaparse'
import { Assistant } from '../types'

interface CSVUploaderProps {
  onUpload: (data: Assistant[]) => void
}

const CSVUploader: React.FC<CSVUploaderProps> = ({ onUpload }) => {
  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    Papa.parse(file, {
      complete: (results) => {
        const data = results.data as string[][]
        const headers = data[0]
        
        // Skip header row and process data
        const assistants: Assistant[] = data.slice(1).map(row => {
          const name = row[0]
          const availability = headers.slice(1, -1).map((date, index) => ({
            date,
            status: row[index + 1] as 'Yes' | 'No' | 'Under reserve' | 'Unknown'
          }))

          return {
            name,
            availability
          }
        })

        onUpload(assistants)
      },
      header: false
    })
  }, [onUpload])

  return (
    <div className="mb-8">
      <label className="block text-sm font-medium text-gray-700">
        CSV-Datei hochladen
      </label>
      <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
        <div className="space-y-1 text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            stroke="currentColor"
            fill="none"
            viewBox="0 0 48 48"
            aria-hidden="true"
          >
            <path
              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <div className="flex text-sm text-gray-600">
            <label
              htmlFor="file-upload"
              className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
            >
              <span>Datei auswählen</span>
              <input
                id="file-upload"
                name="file-upload"
                type="file"
                className="sr-only"
                accept=".csv"
                onChange={handleFileUpload}
              />
            </label>
            <p className="pl-1">oder hierher ziehen</p>
          </div>
          <p className="text-xs text-gray-500">CSV bis zu 10MB</p>
        </div>
      </div>
    </div>
  )
}

export default CSVUploader 