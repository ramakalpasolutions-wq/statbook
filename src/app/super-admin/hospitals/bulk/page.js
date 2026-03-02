'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, Download, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function BulkUploadPage() {
  const router = useRouter()
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState([])
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)

  const downloadTemplate = () => {
    const headers = [
      'name', 'email', 'phone', 'address', 'state', 'district', 'city',
      'timings', 'type', 'website', 'locationLink', 'password',
      'isEmergency', 'isOnline', 'description', 'facilities'
    ]
    const sample = [
      'Sample Hospital', 'sample@hospital.com', '9876543210',
      '123 Main Street Hyderabad', 'Telangana', 'Hyderabad', 'Hyderabad',
      '9AM-9PM', 'NORMAL', 'https://sample.com', 'https://maps.google.com',
      'Password@123', 'false', 'true', 'Sample description', 'ICU|Pharmacy|Lab'
    ]
    const csv = [headers.join(','), sample.join(',')].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'hospital_bulk_template.csv'; a.click()
  }

  const parseCSV = (text) => {
    const lines = text.trim().split('\n')
    const headers = lines[0].split(',').map((h) => h.trim())
    return lines.slice(1).map((line) => {
      const values = line.split(',').map((v) => v.trim())
      const obj = {}
      headers.forEach((h, i) => { obj[h] = values[i] || '' })
      obj.isEmergency = obj.isEmergency === 'true'
      obj.isOnline = obj.isOnline === 'true'
      obj.facilities = obj.facilities ? obj.facilities.split('|') : []
      return obj
    }).filter((r) => r.name)
  }

  const handleFileChange = (e) => {
    const f = e.target.files[0]
    if (!f) return
    setFile(f)
    const reader = new FileReader()
    reader.onload = (ev) => {
      const parsed = parseCSV(ev.target.result)
      setPreview(parsed)
      setStep(2)
    }
    reader.readAsText(f)
  }

  const handleUpload = async () => {
    setLoading(true)
    const res = await fetch('/api/super-admin/hospitals/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hospitals: preview }),
    })
    const data = await res.json()
    setResults(data.results || [])
    setStep(3)
    setLoading(false)
    const success = data.results.filter((r) => r.success).length
    toast.success(`${success} hospitals uploaded successfully`)
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="text-gray-500 hover:text-gray-700 text-sm">← Back</button>
        <h2 className="text-2xl font-bold text-gray-800">Bulk Upload Hospitals</h2>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center gap-2 mb-6">
        {[{ n: 1, label: 'Upload CSV' }, { n: 2, label: 'Preview' }, { n: 3, label: 'Results' }].map(({ n, label }) => (
          <div key={n} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
              ${step >= n ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
              {step > n ? '✓' : n}
            </div>
            <span className={`text-sm font-medium ${step >= n ? 'text-blue-600' : 'text-gray-400'}`}>{label}</span>
            {n < 3 && <div className={`w-8 h-0.5 ${step > n ? 'bg-blue-600' : 'bg-gray-200'}`} />}
          </div>
        ))}
      </div>

      {/* Step 1 — Upload */}
      {step === 1 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 text-center">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Upload size={28} className="text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Upload CSV File</h3>
          <p className="text-gray-500 text-sm mb-6">Upload a CSV file with hospital details. Download the template below.</p>

          <button onClick={downloadTemplate}
            className="flex items-center gap-2 mx-auto mb-6 text-blue-600 hover:underline text-sm font-medium">
            <Download size={15} /> Download Template
          </button>

          <label className="cursor-pointer">
            <div className="border-2 border-dashed border-gray-300 hover:border-blue-400 rounded-xl p-8 transition">
              <p className="text-gray-500 text-sm">Click to select CSV file or drag & drop</p>
              {file && <p className="text-blue-600 font-medium mt-2">{file.name}</p>}
            </div>
            <input type="file" accept=".csv" onChange={handleFileChange} className="hidden" />
          </label>
        </div>
      )}

      {/* Step 2 — Preview */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center justify-between">
            <p className="text-sm font-medium text-gray-700">
              <span className="text-blue-600 font-bold">{preview.length}</span> hospitals ready to upload
            </p>
            <div className="flex gap-2">
              <button onClick={() => { setStep(1); setPreview([]) }}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm">
                Re-upload
              </button>
              <button onClick={handleUpload} disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50">
                {loading ? 'Uploading...' : 'Upload All'}
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  {['#', 'Name', 'Email', 'Phone', 'Type', 'City', 'State', 'Emergency', 'Online'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-gray-600 font-medium whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {preview.map((h, i) => (
                  <tr key={i} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                    <td className="px-4 py-3 font-medium text-gray-800">{h.name}</td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{h.email}</td>
                    <td className="px-4 py-3 text-gray-600">{h.phone}</td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{h.type}</td>
                    <td className="px-4 py-3 text-gray-600">{h.city}</td>
                    <td className="px-4 py-3 text-gray-600">{h.state}</td>
                    <td className="px-4 py-3">{h.isEmergency ? '✅' : '—'}</td>
                    <td className="px-4 py-3">{h.isOnline ? '✅' : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Step 3 — Results */}
      {step === 3 && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Total', value: results.length, color: 'blue' },
              { label: 'Success', value: results.filter((r) => r.success).length, color: 'green' },
              { label: 'Failed', value: results.filter((r) => !r.success).length, color: 'red' },
            ].map(({ label, value, color }) => (
              <div key={label} className={`bg-white rounded-xl border-2 p-4 text-center
                border-${color}-200`}>
                <p className="text-2xl font-bold text-gray-800">{value}</p>
                <p className="text-sm text-gray-500">{label}</p>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            {results.map((r, i) => (
              <div key={i} className={`flex items-center gap-3 px-5 py-3 border-b
                ${r.success ? 'bg-green-50' : 'bg-red-50'}`}>
                {r.success
                  ? <CheckCircle size={16} className="text-green-600 flex-shrink-0" />
                  : <XCircle size={16} className="text-red-600 flex-shrink-0" />}
                <p className="text-sm font-medium text-gray-800">{r.name}</p>
                {!r.success && <p className="text-xs text-red-600 ml-auto">{r.error}</p>}
                {r.success && <p className="text-xs text-green-600 ml-auto">{r.hospitalId}</p>}
              </div>
            ))}
          </div>

          <button onClick={() => router.push('/super-admin/hospitals')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl font-medium transition">
            Go to Hospitals
          </button>
        </div>
      )}
    </div>
  )
}
