'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import apiClient from '@/lib/api-client';
import { useAuth } from '@/contexts/AuthContext';
import { appointmentSchema } from '@vetcare/validations';
import { AppointmentType } from '@vetcare/types';

interface Pet {
  id: string;
  name: string;
  species: string;
}

export default function BookAppointmentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, loading: authLoading } = useAuth();

  const [pets, setPets] = useState<Pet[]>([]);
  const [selectedPet, setSelectedPet] = useState('');
  const [appointmentType, setAppointmentType] = useState<AppointmentType>(AppointmentType.IN_CLINIC);
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [availabilityMessage, setAvailabilityMessage] = useState({ text: '', type: '' });
  const [error, setError] = useState('');

  const vetId = searchParams.get('vetId');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    } else if (isAuthenticated) {
      fetchPets();
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (scheduledDate && scheduledTime && vetId) {
      const checkSlotAvailability = async () => {
        setAvailabilityLoading(true);
        setAvailabilityMessage({ text: '', type: '' });
        try {
          const response = await apiClient.get('/appointments/check-availability', {
            params: {
              vetId,
              date: scheduledDate,
              startTime: scheduledTime,
            },
          });

          if (response.data.available) {
            setAvailabilityMessage({ text: 'Time slot is available!', type: 'success' });
          } else {
            setAvailabilityMessage({ 
              text: response.data.reason || 'This time slot is not available.', 
              type: 'error' 
            });
          }
        } catch (err) {
          console.error('Failed to check availability:', err);
        } finally {
          setAvailabilityLoading(false);
        }
      };

      const timeoutId = setTimeout(checkSlotAvailability, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [scheduledDate, scheduledTime, vetId]);

  const fetchPets = async () => {
    try {
      const response = await apiClient.get('/pets');
      setPets(response.data);
      if (response.data.length > 0) {
        setSelectedPet(response.data[0].id);
      }
    } catch (err) {
      console.error('Failed to load pets:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!vetId) {
      setError('Veterinarian not selected');
      return;
    }

    if (availabilityMessage.type === 'error') {
      setError('Please select an available time slot');
      return;
    }

    // Validate with Zod
    const validationResult = appointmentSchema.safeParse({
      petId: selectedPet,
      veterinarianId: vetId,
      type: appointmentType,
      scheduledAt: new Date(`${scheduledDate}T${scheduledTime}`),
      symptoms,
      notes,
    });

    if (!validationResult.success) {
      setError(validationResult.error.errors[0].message);
      return;
    }

    setError('');
    setLoading(true);

    try {
      await apiClient.post('/appointments', validationResult.data);
      router.push('/appointments');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to book appointment');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!vetId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">No veterinarian selected</p>
          <Link href="/vets" className="text-indigo-600 hover:text-indigo-700">
            ← Find a Veterinarian
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-4">
            <Link href={`/vets/${vetId}`} className="text-gray-600 hover:text-gray-900">
              ← Back
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Book Appointment</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-8">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Pet Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Pet *
              </label>
              {pets.length === 0 ? (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    You need to add a pet first.{' '}
                    <Link href="/dashboard/pets/new" className="underline">
                      Add Pet
                    </Link>
                  </p>
                </div>
              ) : (
                <select
                  value={selectedPet}
                  onChange={(e) => setSelectedPet(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  {pets.map((pet) => (
                    <option key={pet.id} value={pet.id}>
                      {pet.name} ({pet.species})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Appointment Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Appointment Type *
              </label>
              <select
                value={appointmentType}
                onChange={(e) => setAppointmentType(e.target.value as AppointmentType)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value={AppointmentType.IN_CLINIC}>In-Clinic Visit</option>
                <option value={AppointmentType.HOME_VISIT}>Home Visit</option>
                <option value={AppointmentType.TELEMEDICINE}>Telemedicine (Online)</option>
                <option value={AppointmentType.EMERGENCY}>Emergency</option>
              </select>
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date *
                </label>
                <input
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Time *
                </label>
                <input
                  type="time"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Availability Feedback */}
            {availabilityLoading && (
              <p className="text-sm text-gray-500 animate-pulse">Checking availability...</p>
            )}
            {availabilityMessage.text && (
              <p className={`text-sm font-medium ${
                availabilityMessage.type === 'success' ? 'text-green-600' : 'text-red-600'
              }`}>
                {availabilityMessage.text}
              </p>
            )}

            {/* Symptoms */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Symptoms / Reason for Visit
              </label>
              <textarea
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="Describe what's happening with your pet..."
              />
            </div>

            {/* Additional Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Additional Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="Any special requests or information..."
              />
            </div>

            {/* Submit */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading || availabilityLoading || pets.length === 0 || availabilityMessage.type === 'error'}
                className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
              >
                {loading ? 'Booking...' : 'Book Appointment'}
              </button>
              <Link
                href={`/vets/${vetId}`}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
