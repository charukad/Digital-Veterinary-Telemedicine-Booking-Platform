'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import apiClient from '@/lib/api-client';
import { useAuth } from '@/contexts/AuthContext';

interface AvailabilitySlot {
  id?: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function AvailabilityPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    } else if (isAuthenticated && user?.userType !== 'VETERINARIAN') {
      router.push('/dashboard');
    } else if (isAuthenticated) {
      fetchAvailability();
    }
  }, [authLoading, isAuthenticated, user, router]);

  const fetchAvailability = async () => {
    try {
      const response = await apiClient.get('/veterinarians/availability/me');
      setSlots(response.data || []);
    } catch (err: any) {
      console.error('Failed to load availability:', err);
    } finally {
      setLoading(false);
    }
  };

  const addSlot = (dayOfWeek: number) => {
    setSlots([
      ...slots,
      {
        dayOfWeek,
        startTime: '09:00',
        endTime: '17:00',
        isAvailable: true,
      },
    ]);
  };

  const removeSlot = (index: number) => {
    setSlots(slots.filter((_, i) => i !== index));
  };

  const updateSlot = (index: number, field: keyof AvailabilitySlot, value: any) => {
    const updated = [...slots];
    updated[index] = { ...updated[index], [field]: value };
    setSlots(updated);
  };

  const handleSave = async () => {
    setError('');
    setSuccess('');

    // Validate slots
    for (const slot of slots) {
      if (slot.startTime >= slot.endTime) {
        setError('Start time must be before end time for all slots');
        return;
      }
    }

    setSaving(true);
    try {
      await apiClient.post('/veterinarians/availability', { slots });
      setSuccess('Availability schedule saved successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save availability');
    } finally {
      setSaving(false);
    }
  };

  const getSlotsForDay = (dayOfWeek: number) => {
    return slots
      .map((slot, index) => ({ ...slot, originalIndex: index }))
      .filter((slot) => slot.dayOfWeek === dayOfWeek)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  };

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
          <div className="flex items-center space-x-4">
            <Link href="/dashboard/vet-profile" className="text-gray-600 hover:text-gray-900">
              ← Back to Profile
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Manage Availability</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Messages */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg">
            {success}
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Weekly Schedule</h2>
            <p className="text-sm text-gray-600">
              Set your available hours for each day of the week. Pet owners will only see these times when booking.
            </p>
          </div>

          {/* Weekly Grid */}
          <div className="space-y-6">
            {DAYS.map((dayName, dayIndex) => {
              const daySlots = getSlotsForDay(dayIndex);

              return (
                <div key={dayIndex} className="border rounded-lg p-4">
                  {/* Day Header */}
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-base font-semibold text-gray-900">{dayName}</h3>
                    <button
                      onClick={() => addSlot(dayIndex)}
                      className="px-3 py-1 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
                    >
                      + Add Time Slot
                    </button>
                  </div>

                  {/* Time Slots */}
                  {daySlots.length === 0 ? (
                    <p className="text-sm text-gray-500 italic">No availability set for this day</p>
                  ) : (
                    <div className="space-y-2">
                      {daySlots.map((slot) => (
                        <div
                          key={slot.originalIndex}
                          className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex-1 grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs text-gray-600 mb-1">Start Time</label>
                              <input
                                type="time"
                                value={slot.startTime}
                                onChange={(e) =>
                                  updateSlot(slot.originalIndex!, 'startTime', e.target.value)
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-gray-600 mb-1">End Time</label>
                              <input
                                type="time"
                                value={slot.endTime}
                                onChange={(e) =>
                                  updateSlot(slot.originalIndex!, 'endTime', e.target.value)
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 text-sm"
                              />
                            </div>
                          </div>

                          <button
                            onClick={() => removeSlot(slot.originalIndex!)}
                            className="px-3 py-2 bg-red-50 text-red-600 rounded hover:bg-red-100 transition text-sm"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Save Button */}
          <div className="mt-8 flex gap-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
            >
              {saving ? 'Saving...' : 'Save Schedule'}
            </button>
            <Link
              href="/dashboard/vet-profile"
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
            >
              Cancel
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
