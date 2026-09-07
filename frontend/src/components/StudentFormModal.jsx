import React, { useState, useEffect } from 'react';
import { studentService } from '../api/studentService';
import { X, AlertCircle } from 'lucide-react';

export default function StudentFormModal({ isOpen, onClose, onSuccess, studentToEdit }) {
  const [formData, setFormData] = useState({
    first_name: '', last_name: '', email: '', date_of_birth: '', enrollment_status: 'active'
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (studentToEdit) setFormData({ ...studentToEdit });
    else setFormData({ first_name: '', last_name: '', email: '', date_of_birth: '', enrollment_status: 'active' });
    setErrors({});
    setApiError(null);
  }, [studentToEdit, isOpen]);

  if (!isOpen) return null;

  const validateForm = () => {
    const newErrors = {};
    if (!formData.first_name.trim()) newErrors.first_name = 'Required';
    if (!formData.last_name.trim()) newErrors.last_name = 'Required';
    if (!formData.email.trim() || !/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = 'Valid email required';
    if (!formData.date_of_birth) {
      newErrors.date_of_birth = 'Required';
    } else if (new Date(formData.date_of_birth) > new Date()) {
      newErrors.date_of_birth = 'Cannot be in the future';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    setApiError(null);

    try {
      if (studentToEdit) await studentService.updateStudent(studentToEdit.id, formData);
      else await studentService.createStudent(formData);
      onSuccess();
    } catch (err) {
      const status = err.response?.status;
      const responseData = err.response?.data;
      if (status === 409) setApiError(responseData.message || 'Email already exists.');
      else if (status === 400 && responseData.details) {
        const backendErrors = {};
        responseData.details.forEach(d => backendErrors[d.field[0]] = d.message);
        setErrors(backendErrors);
        setApiError('Please fix the validation errors below.');
      } else setApiError('An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: null });
  };

  // UPDATED: Gray background (bg-slate-50) and darker borders (border-slate-300) for inputs
  const inputClasses = (fieldName) => `
    w-full rounded-lg border px-4 py-2.5 text-sm outline-none transition-all duration-200
    ${errors[fieldName]
      ? 'border-red-400 bg-red-50 text-red-900 focus:border-red-500 focus:bg-white focus:ring-4 focus:ring-red-500/10 placeholder-red-300'
      : 'border-slate-300 bg-slate-50 text-slate-900 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 placeholder-slate-400 hover:border-slate-400'
    }
  `;

  const labelClasses = "block text-sm font-bold text-slate-700 mb-1.5";

  return (
    // UPDATED: Darker backdrop (bg-slate-900/60)
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm transition-opacity">
      {/* UPDATED: Added subtle border to the modal itself */}
      <div className="relative flex w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200 max-h-[90vh]">

        {/* Header */}
        <div className="flex flex-shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
          <h2 className="text-xl font-bold text-slate-900">
            {studentToEdit ? 'Edit Student Record' : 'Add New Student'}
          </h2>
          <button
            onClick={onClose}
            className="rounded-full bg-slate-100 p-2 text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-800"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto px-6 py-6 bg-white">
          <form id="student-form" onSubmit={handleSubmit} className="space-y-5">

            {apiError && (
              <div className="flex items-start rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-800 shadow-sm">
                <AlertCircle className="mr-2.5 h-5 w-5 flex-shrink-0 text-red-600" />
                <span className="font-semibold">{apiError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label className={labelClasses}>First Name</label>
                <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} className={inputClasses('first_name')} placeholder="e.g. Jane" />
                {errors.first_name && <p className="mt-1.5 text-xs font-bold text-red-500">{errors.first_name}</p>}
              </div>
              <div>
                <label className={labelClasses}>Last Name</label>
                <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} className={inputClasses('last_name')} placeholder="e.g. Doe" />
                {errors.last_name && <p className="mt-1.5 text-xs font-bold text-red-500">{errors.last_name}</p>}
              </div>
            </div>

            <div>
              <label className={labelClasses}>Email Address</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} className={inputClasses('email')} placeholder="jane.doe@university.edu" />
              {errors.email && <p className="mt-1.5 text-xs font-bold text-red-500">{errors.email}</p>}
            </div>

            <div>
              <label className={labelClasses}>Date of Birth</label>
              <input type="date" name="date_of_birth" max={new Date().toISOString().split("T")[0]} value={formData.date_of_birth} onChange={handleChange} className={inputClasses('date_of_birth')} />
              {errors.date_of_birth && <p className="mt-1.5 text-xs font-bold text-red-500">{errors.date_of_birth}</p>}
            </div>

            <div>
              <label className={labelClasses}>Enrollment Status</label>
              <select name="enrollment_status" value={formData.enrollment_status} onChange={handleChange} className={inputClasses('enrollment_status')}>
                <option value="active">Active</option>
                <option value="graduated">Graduated</option>
                <option value="dropped">Dropped</option>
              </select>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="flex flex-shrink-0 items-center justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-100 hover:text-slate-900 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="student-form"
            disabled={isSubmitting}
            className="flex min-w-[120px] items-center justify-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-indigo-700 hover:shadow-lg active:scale-95 disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : (studentToEdit ? 'Save Changes' : 'Create Student')}
          </button>
        </div>
      </div>
    </div>
  );
}