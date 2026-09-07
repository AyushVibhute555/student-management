import React, { useState, useEffect } from 'react';
import { studentService } from '../api/studentService';
import { Loader2, AlertCircle, Trash2, Edit2, Plus, GraduationCap, Users } from 'lucide-react';
import StudentFormModal from './StudentFormModal';

export default function StudentList() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [studentToEdit, setStudentToEdit] = useState(null);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await studentService.getStudents(page, 10, statusFilter);
      setStudents(response.data);
      setTotalPages(response.meta.pages);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch students. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [page, statusFilter]);

  const handleFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setPage(1);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this student record?")) {
      try {
        await studentService.deleteStudent(id);
        fetchStudents();
      } catch (err) {
        alert("Failed to delete student.");
      }
    }
  };

  const openCreateModal = () => {
    setStudentToEdit(null);
    setIsModalOpen(true);
  };

  const openEditModal = (student) => {
    setStudentToEdit(student);
    setIsModalOpen(true);
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'active': return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'graduated': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'dropped': return 'bg-slate-200 text-slate-800 border-slate-400';
      default: return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  return (
    <div className="min-h-screen bg-[#F1F5F9] font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">

        {/* Header Section */}
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <div className="mb-2 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-sm border border-slate-300 text-indigo-600">
              <GraduationCap size={28} />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Student Directory</h1>
            <p className="mt-1 text-sm font-medium text-slate-600">Manage enrollments, update records, and monitor student statuses.</p>
          </div>

          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
            {/* UPDATED: Darker border and slightly gray bg for the dropdown */}
            <select
              value={statusFilter}
              onChange={handleFilterChange}
              className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm outline-none transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 sm:w-48 hover:border-slate-400"
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="graduated">Graduated</option>
              <option value="dropped">Dropped</option>
            </select>

            <button
              onClick={openCreateModal}
              className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 text-sm font-bold text-white shadow-md transition-all hover:bg-indigo-700 hover:shadow-lg focus:ring-4 focus:ring-indigo-500/20 active:scale-95 sm:w-auto"
            >
              <Plus size={18} />
              New Student
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 flex items-center rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-800 shadow-sm animate-in fade-in">
            <AlertCircle className="mr-3 h-5 w-5 flex-shrink-0" />
            <span className="font-bold">{error}</span>
          </div>
        )}

        {/* Table Card - UPDATED: border-slate-300 and shadow-md for better pop */}
        <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-300 bg-white shadow-md">
          {loading ? (
            <div className="flex h-64 flex-col items-center justify-center bg-white">
              <Loader2 className="mb-4 h-8 w-8 animate-spin text-indigo-600" />
              <p className="text-sm font-semibold text-slate-500">Loading records...</p>
            </div>
          ) : (
            <div className="flex-1 overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-slate-300 bg-slate-100">
                  <tr>
                    <th className="px-6 py-4 font-bold text-slate-700">Student</th>
                    <th className="px-6 py-4 font-bold text-slate-700">Contact</th>
                    <th className="px-6 py-4 text-center font-bold text-slate-700">Date of Birth</th>
                    <th className="px-6 py-4 text-center font-bold text-slate-700">Status</th>
                    <th className="px-6 py-4 text-right font-bold text-slate-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {students.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="py-20 text-center bg-white">
                        <div className="mx-auto flex max-w-sm flex-col items-center justify-center">
                          <div className="mb-4 rounded-full border border-slate-200 bg-slate-100 p-4 shadow-sm">
                            <Users className="h-8 w-8 text-slate-500" />
                          </div>
                          <p className="text-base font-bold text-slate-900">No students found</p>
                          <p className="mt-1 text-sm font-medium text-slate-500">Try adjusting your filters or add a new student to get started.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    students.map((student) => (
                      <tr key={student.id} className="group bg-white transition-colors hover:bg-indigo-50/50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-indigo-100 bg-indigo-100 font-bold text-indigo-800 shadow-sm">
                              {student.first_name.charAt(0)}{student.last_name.charAt(0)}
                            </div>
                            <div className="font-bold text-slate-900">
                              {student.first_name} {student.last_name}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="max-w-[200px] truncate font-medium text-slate-600" title={student.email}>
                            {student.email}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center font-medium text-slate-600">
                          {student.date_of_birth}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-bold shadow-sm ${getStatusStyle(student.enrollment_status)}`}>
                            {student.enrollment_status.charAt(0).toUpperCase() + student.enrollment_status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openEditModal(student)}
                              className="rounded-lg border border-slate-200 bg-white p-2 text-slate-500 shadow-sm transition-all hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700"
                              title="Edit"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(student.id)}
                              className="rounded-lg border border-slate-200 bg-white p-2 text-slate-500 shadow-sm transition-all hover:border-red-300 hover:bg-red-50 hover:text-red-700"
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {!loading && students.length > 0 && (
            <div className="flex items-center justify-between border-t border-slate-300 bg-slate-50 px-6 py-4">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm transition-colors hover:bg-slate-100 hover:text-slate-900 disabled:opacity-50 disabled:pointer-events-none"
              >
                Previous
              </button>
              <div className="text-sm font-semibold text-slate-600">
                Page <span className="font-bold text-slate-900">{page}</span> of {totalPages || 1}
              </div>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(p => p + 1)}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm transition-colors hover:bg-slate-100 hover:text-slate-900 disabled:opacity-50 disabled:pointer-events-none"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      <StudentFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => { setIsModalOpen(false); fetchStudents(); }}
        studentToEdit={studentToEdit}
      />
    </div>
  );
}