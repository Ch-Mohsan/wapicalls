import React, { useState, useRef } from 'react'

const CSVUpload = ({ onUpload, onCancel, loading = false }) => {
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState([])
  const [errors, setErrors] = useState([])
  const fileInputRef = useRef(null)

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0]
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile)
      parseCSV(selectedFile)
    } else {
      setErrors(['Please select a valid CSV file'])
      setFile(null)
      setPreview([])
    }
  }

  const parseCSV = (file) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const text = e.target.result
        const lines = text.split('\n')
        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
        
        // Validate headers
        const requiredHeaders = ['name', 'phone']
        const missingHeaders = requiredHeaders.filter(h => 
          !headers.some(header => header.toLowerCase().includes(h))
        )
        
        if (missingHeaders.length > 0) {
          setErrors([`Missing required columns: ${missingHeaders.join(', ')}`])
          setPreview([])
          return
        }

        // Parse data rows
        const data = []
        const parseErrors = []
        
        for (let i = 1; i < lines.length && i <= 6; i++) { // Preview first 5 rows
          const line = lines[i].trim()
          if (!line) continue
          
          const values = line.split(',').map(v => v.trim().replace(/"/g, ''))
          const row = {}
          
          headers.forEach((header, index) => {
            const key = header.toLowerCase()
            if (key.includes('name')) row.name = values[index] || ''
            else if (key.includes('email')) row.email = values[index] || ''
            else if (key.includes('phone')) row.phone = values[index] || ''
            else if (key.includes('company')) row.company = values[index] || ''
            else if (key.includes('note')) row.notes = values[index] || ''
            else if (key.includes('status')) row.status = values[index] || 'New'
          })
          
          // Validate row
          if (!row.name || !row.phone) {
            parseErrors.push(`Row ${i + 1}: Missing required fields (name, phone)`)
          } else if (row.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email)) {
            parseErrors.push(`Row ${i + 1}: Invalid email format`)
          } else {
            data.push(row)
          }
        }
        
        setErrors(parseErrors)
        setPreview(data)
        
      } catch (error) {
        setErrors(['Error parsing CSV file'])
        setPreview([])
      }
    }
    reader.readAsText(file)
  }

  const handleUpload = async () => {
    if (!file) {
      setErrors(['Please select a file'])
      return
    }

    if (errors.length > 0) {
      setErrors(['Please fix the errors before uploading'])
      return
    }

    try {
      const reader = new FileReader()
      reader.onload = async (e) => {
        const text = e.target.result
        const lines = text.split('\n')
        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
        
        const data = []
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim()
          if (!line) continue
          
          const values = line.split(',').map(v => v.trim().replace(/"/g, ''))
          const row = {}
          
          headers.forEach((header, index) => {
            const key = header.toLowerCase()
            if (key.includes('name')) row.name = values[index] || ''
            else if (key.includes('email')) row.email = values[index] || ''
            else if (key.includes('phone')) row.phone = values[index] || ''
            else if (key.includes('company')) row.company = values[index] || ''
            else if (key.includes('note')) row.notes = values[index] || ''
            else if (key.includes('status')) row.status = values[index] || 'New'
          })
          
          if (row.name && row.phone) {
            // Transform phone to phoneNumber for backend compatibility
            const transformedRow = {
              ...row,
              phoneNumber: row.phone
            }
            delete transformedRow.phone // Remove the old phone field
            data.push(transformedRow)
          }
        }
        
        await onUpload(data)
      }
      reader.readAsText(file)
    } catch (error) {
      setErrors(['Upload failed: ' + error.message])
    }
  }

  const resetForm = () => {
    setFile(null)
    setPreview([])
    setErrors([])
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select CSV File
        </label>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md outline-none focus:ring-2 focus:ring-blue-200"
          disabled={loading}
        />
        <p className="mt-1 text-sm text-gray-500">
          Required columns: name, phone. Optional: email, company, notes, status
        </p>
      </div>

      {errors.length > 0 && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <h4 className="text-sm font-medium text-red-800 mb-1">Errors:</h4>
          <ul className="text-sm text-red-700 list-disc list-inside">
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {preview.length > 0 && (
        <div className="border border-gray-200 rounded-md overflow-hidden">
          <div className="bg-gray-50 px-3 py-2 border-b border-gray-200">
            <h4 className="text-sm font-medium text-gray-900">
              Preview (first 5 rows)
            </h4>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left font-medium text-gray-900">Name</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-900">Email</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-900">Phone</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-900">Company</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-900">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {preview.map((row, index) => (
                  <tr key={index}>
                    <td className="px-3 py-2 text-gray-900">{row.name}</td>
                    <td className="px-3 py-2 text-gray-900">{row.email}</td>
                    <td className="px-3 py-2 text-gray-900">{row.phone}</td>
                    <td className="px-3 py-2 text-gray-900">{row.company || '-'}</td>
                    <td className="px-3 py-2 text-gray-900">{row.status || 'New'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={() => {
            resetForm()
            onCancel()
          }}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleUpload}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
          disabled={loading || !file || errors.length > 0}
        >
          {loading ? 'Uploading...' : 'Upload Leads'}
        </button>
      </div>

      <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-md">
        <h5 className="font-medium mb-1">CSV Format Example:</h5>
        <code className="block">
          name,email,phone,company,status,notes<br/>
          John Doe,john@example.com,+1234567890,Acme Corp,New,Interested in product
        </code>
      </div>
    </div>
  )
}

export default CSVUpload
