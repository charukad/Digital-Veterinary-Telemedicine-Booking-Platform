'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import apiClient from '@/lib/api-client';
import { useAuth } from '@/contexts/AuthContext';

interface Appointment {
  id: string;
  type: string;
  status: string;
  scheduledAt: string;
  symptoms?: string;
  pet: {
    name: string;
    species: string;
  };
  veterinarian?: {
    firstName?: string;
    lastName?: string;
    user: {
      email: string;
    };
  };
  clinic?: {
    name: string;
    address: string;
  };
}

export default function AppointmentsPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'upcoming' | 'past' | 'all'>('upcoming');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    } else if (isAuthenticated) {
      fetchAppointments();
    }
  }, [authLoading, isAuthenticated, router]);

  const fetchAppointments = async () => {
    try {
      const role = user?.userType === 'VETERINARIAN' ? 'vet' : 'owner';
      const response = await apiClient.get(`/appointments?role=${role}`);
      setAppointments(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this appointment?')) return;

    try {
      await apiClient.delete(`/appointments/${id}`);
      setAppointments(appointments.map(apt =>
        apt.id === id ? { ...apt, status: 'CANCELLED' } : apt
      ));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to cancel appointment');
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      CONFIRMED: 'bg-green-100 text-green-800',
      IN_PROGRESS: 'bg-blue-100 text-blue-800',
      COMPLETED: 'bg-gray-100 text-gray-800',
      CANCELLED: 'bg-red-100 text-red-800',
      NO_SHOW: 'bg-orange-100 text-orange-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filteredAppointments = appointments.filter((apt) => {
    const aptDate = new Date(apt.scheduledAt);
    const now = new Date();

    if (filter === 'upcoming') {
      return aptDate >= now && apt.status !== 'CANCELLED' && apt.status !== 'COMPLETED';
    } else if (filter === 'past') {
      return aptDate < now || apt.status === 'COMPLETED' || apt.status === 'CANCELLED';
    }
    return true;
  });

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
                ← Back
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">My Appointments</h1>
            </div>
            {user?.userType === 'PET_OWNER' && (
              <Link
                href="/vets"
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
              >
                Book New Appointment
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Filters */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex space-x-4">
            <button
              onClick={() => setFilter('upcoming')}
              className={`px-4 py-2 rounded-lg transition ${
                filter === 'upcoming'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Upcoming
            </button>
            <button
              onClick={() => setFilter('past')}
              className={`px-4 py-2 rounded-lg transition ${
                filter === 'past'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Past
            </button>
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg transition ${
                filter === 'all'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {filteredAppointments.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-6xl mb-4">📅</div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">No appointments found</h2>
            <p className="text-gray-600 mb-6">
              {filter === 'upcoming' && "You don't have any upcoming appointments"}
              {filter === 'past' && "You don't have any past appointments"}
              {filter === 'all' && "You haven't booked any appointments yet"}
            </p>
            {user?.userType === 'PET_OWNER' && (
              <Link
                href="/vets"
                className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
              >
                Find a Veterinarian
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAppointments.map((appointment) => (
              <div
                key={appointment.id}
                className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {appointment.pet.name} - {appointment.type.replace('_', ' ')}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                        {appointment.status}
                      </span>
                    </div>

                    <div className="space-y-1 text-sm text-gray-600">
                      <p>
                        <span className="font-medium">📅 Date:</span> {formatDate(appointment.scheduledAt)} at {formatTime(appointment.scheduledAt)}
                      </p>
                      {appointment.veterinarian && (
                        <p>
                          <span className="font-medium">👨‍⚕️ Vet:</span>{' '}
                          {appointment.veterinarian.firstName && appointment.veterinarian.lastName
                            ? `Dr. ${appointment.veterinarian.firstName} ${appointment.veterinarian.lastName}`
                            : appointment.veterinarian.user.email}
                        </p>
                      )}
                      {appointment.clinic && (
                        <p>
                          <span className="font-medium">📍 Clinic:</span> {appointment.clinic.name}
                        </p>
                      )}
                      {appointment.symptoms && (
                        <p>
                          <span className="font-medium">Symptoms:</span> {appointment.symptoms}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <Link
                      href={`/appointments/${appointment.id}`}
                      className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition text-sm"
                    >
                      View Details
                    </Link>
                    {appointment.status === 'PENDING' || appointment.status === 'CONFIRMED' ? (
                      <button
                        onClick={() => handleCancel(appointment.id)}
                        className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition text-sm"
                      >
                        Cancel
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
