'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import apiClient from '@/lib/api-client';
import { useAuth } from '@/contexts/AuthContext';
import PaymentButton from '@/components/PaymentButton';

interface Appointment {
  id: string;
  type: string;
  status: string;
  scheduledAt: string;
  durationMinutes: number;
  symptoms?: string;
  notes?: string;
  pet: {
    id: string;
    name: string;
    species: string;
    breed: string;
    owner: {
      firstName: string;
      lastName: string;
    };
  };
  veterinarian: {
    id: string;
    firstName?: string;
    lastName?: string;
    licenseNumber: string;
    user: {
      email: string;
      phone?: string;
    };
  };
  clinic?: {
    name: string;
    address: string;
    phone: string;
  };
  owner: {
    firstName: string;
    lastName: string;
  };
}

export default function AppointmentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    } else if (isAuthenticated && params.id) {
      fetchAppointment();
    }
  }, [authLoading, isAuthenticated, params.id, router]);

  const fetchAppointment = async () => {
    try {
      const response = await apiClient.get(`/appointments/${params.id}`);
      setAppointment(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load appointment');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus: string) => {
    if (!appointment) return;

    setUpdating(true);
    try {
      const response = await apiClient.patch(`/appointments/${appointment.id}`, {
        status: newStatus,
      });
      setAppointment(response.data);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this appointment?')) return;

    try {
      await apiClient.delete(`/appointments/${params.id}`);
      router.push('/appointments');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to cancel appointment');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      CONFIRMED: 'bg-green-100 text-green-800 border-green-200',
      IN_PROGRESS: 'bg-blue-100 text-blue-800 border-blue-200',
      COMPLETED: 'bg-gray-100 text-gray-800 border-gray-200',
      CANCELLED: 'bg-red-100 text-red-800 border-red-200',
      NO_SHOW: 'bg-orange-100 text-orange-800 border-orange-200',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const isVet = user?.userType === 'VETERINARIAN';
  const canUpdateStatus = isVet && appointment?.status !== 'COMPLETED' && appointment?.status !== 'CANCELLED';
  const canCancel = appointment?.status === 'PENDING' || appointment?.status === 'CONFIRMED';

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !appointment) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Appointment not found'}</p>
          <Link href="/appointments" className="text-indigo-600 hover:text-indigo-700">
            ← Back to Appointments
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-4">
            <Link href="/appointments" className="text-gray-600 hover:text-gray-900">
              ← Back
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Appointment Details</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {/* Status Banner */}
          <div className={`p-4 border-b-4 ${getStatusColor(appointment.status)}`}>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium">Status</p>
                <p className="text-2xl font-bold">{appointment.status}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">Appointment Type</p>
                <p className="text-lg font-semibold">{appointment.type.replace('_', ' ')}</p>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="p-6 space-y-6">
            {/* Date & Time */}
            <div className="border-b pb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Schedule</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="text-lg font-medium text-gray-900">{formatDate(appointment.scheduledAt)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Time</p>
                  <p className="text-lg font-medium text-gray-900">
                    {formatTime(appointment.scheduledAt)} ({appointment.durationMinutes} minutes)
                  </p>
                </div>
              </div>
            </div>

            {/* Pet Information */}
            <div className="border-b pb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Pet Information</h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Name:</span>
                  <span className="font-medium">{appointment.pet.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Species:</span>
                  <span className="font-medium">{appointment.pet.species}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Breed:</span>
                  <span className="font-medium">{appointment.pet.breed}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Owner:</span>
                  <span className="font-medium">
                    {appointment.pet.owner.firstName} {appointment.pet.owner.lastName}
                  </span>
                </div>
              </div>
            </div>

            {/* Veterinarian Information */}
            <div className="border-b pb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Veterinarian</h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Name:</span>
                  <span className="font-medium">
                    {appointment.veterinarian.firstName && appointment.veterinarian.lastName
                      ? `Dr. ${appointment.veterinarian.firstName} ${appointment.veterinarian.lastName}`
                      : appointment.veterinarian.user.email}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">License:</span>
                  <span className="font-medium">{appointment.veterinarian.licenseNumber}</span>
                </div>
                {appointment.veterinarian.user.phone && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phone:</span>
                    <span className="font-medium">{appointment.veterinarian.user.phone}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Clinic Information */}
            {appointment.clinic && (
              <div className="border-b pb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Clinic</h2>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Name:</span>
                    <span className="font-medium">{appointment.clinic.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Address:</span>
                    <span className="font-medium text-right max-w-xs">{appointment.clinic.address}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phone:</span>
                    <span className="font-medium">{appointment.clinic.phone}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Symptoms & Notes */}
            {(appointment.symptoms || appointment.notes) && (
              <div className="border-b pb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h2>
                {appointment.symptoms && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-500 mb-1">Symptoms / Reason for Visit</p>
                    <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{appointment.symptoms}</p>
                  </div>
                )}
                {appointment.notes && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Additional Notes</p>
                    <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{appointment.notes}</p>
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap gap-3">
              {/* Vet Status Updates */}
              {canUpdateStatus && (
                <>
                  {appointment.status === 'PENDING' && (
                    <button
                      onClick={() => handleStatusUpdate('CONFIRMED')}
                      disabled={updating}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition"
                    >
                      Confirm Appointment
                    </button>
                  )}
                  {appointment.status === 'CONFIRMED' && (
                    <button
                      onClick={() => handleStatusUpdate('IN_PROGRESS')}
                      disabled={updating}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
                    >
                      Start Consultation
                    </button>
                  )}
                  {appointment.status === 'IN_PROGRESS' && (
                    <button
                      onClick={() => handleStatusUpdate('COMPLETED')}
                      disabled={updating}
                      className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition"
                    >
                      Mark as Completed
                    </button>
                  )}
                  {(appointment.status === 'PENDING' || appointment.status === 'CONFIRMED') && (
                    <button
                      onClick={() => handleStatusUpdate('NO_SHOW')}
                      disabled={updating}
                      className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 transition"
                    >
                      Mark as No-Show
                    </button>
                  )}
                </>
              )}

              {/* Write Review Button (Pet Owners only, completed appointments) */}
              {!isVet && appointment.status === 'COMPLETED' && (
                <Link
                  href={`/appointments/${appointment.id}/review`}
                  className="px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition"
                >
                  ⭐ Write Review
                </Link>
              )}

              {/* Cancel Button */}
              {canCancel && !isVet && (
                <button
                  onClick={handleCancel}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                  Cancel Appointment
                </button>
              )}

              {/* Back Button */}
              <Link
                href="/appointments"
                className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
              >
                Back to List
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
