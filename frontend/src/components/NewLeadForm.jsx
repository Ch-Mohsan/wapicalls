import React, { useState } from 'react'

const NewLeadForm = ({ onSubmit, onCancel, onSuccess, loading = false }) => {
  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: ''
  })
  
  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    
    // Format phone number as user types
    let processedValue = value
    if (name === 'phoneNumber') {
      // Remove all non-digit characters except +
      processedValue = value.replace(/[^\d+]/g, '')
      // Ensure + is only at the beginning
      if (processedValue.includes('+') && !processedValue.startsWith('+')) {
        processedValue = processedValue.replace(/\+/g, '')
      }
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
    
    // Clear submit error when user starts typing
    if (submitError) {
      setSubmitError('')
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }
    
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required'
    } else if (!/^\+?[1-9]\d{1,14}$/.test(formData.phoneNumber.replace(/\s/g, ''))) {
      newErrors.phoneNumber = 'Please provide a valid phone number (e.g., +1234567890 or 1234567890)'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitError('')
    
    if (!validateForm()) {
      return
    }

    try {
      await onSubmit(formData)
      // Reset form on success
      setFormData({
        name: '',
        phoneNumber: ''
      })
      setErrors({})
      setSubmitError('')
      // Call success callback
      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      console.error('Error submitting form:', error)
      // Display backend validation error
      setSubmitError(error.message || 'Failed to create lead')
    }
  }

  return (
    <div className="flex flex-col max-h-full">
      <form id="new-lead-form" onSubmit={handleSubmit} className="space-y-4 flex-1 overflow-y-auto">
        {/* Submit Error Display */}
        {submitError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-700">{submitError}</p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Name *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md outline-none focus:ring-2 ${
              errors.name 
                ? 'border-red-400 focus:ring-red-200' 
                : 'border-gray-300 focus:ring-blue-200'
            }`}
            placeholder="Enter lead name"
            disabled={loading}
          />
          {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number *
          </label>
          <input
            type="tel"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md outline-none focus:ring-2 ${
              errors.phoneNumber 
                ? 'border-red-400 focus:ring-red-200' 
                : 'border-gray-300 focus:ring-blue-200'
            }`}
            placeholder="Enter phone number (e.g., +1234567890)"
            disabled={loading}
          />
          {errors.phoneNumber && <p className="mt-1 text-sm text-red-600">{errors.phoneNumber}</p>}
          <p className="mt-1 text-xs text-gray-500">
            Format: +1234567890 or 1234567890 (international format)
          </p>
        </div>
      </form>    {/* Sticky Button Area */}
    <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 mt-4 bg-white">
      <button
        type="button"
        onClick={onCancel}
        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
        disabled={loading}
      >
        Cancel
      </button>
      <button
        type="submit"
        form="new-lead-form"
        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
        disabled={loading}
        onClick={handleSubmit}
      >
        {loading ? 'Creating...' : 'Create Lead'}
      </button>
    </div>
  </div>
  )
}

export default NewLeadForm
