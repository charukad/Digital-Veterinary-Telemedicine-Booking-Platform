'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import apiClient from '@/lib/api-client';
import { useAuth } from '@/contexts/AuthContext';

interface Pet {
  id: string;
  name: string;
  species: string;
  breed: string;
  gender?: string;
  dateOfBirth: string;
  weight?: number;
  color?: string;
  microchipId?: string;
  profileImage?: string;
  allergies?: string[];
  chronicConditions?: string[];
  medicalNotes?: string;
  currentMedications?: string[];
  healthRecords?: HealthRecord[];
  vaccinations?: Vaccination[];
}

interface HealthRecord {
  id: string;
  date: string;
  diagnosis: string;
  treatment?: string;
}

interface Vaccination {
  id: string;
  name: string;
  date: string;
  nextDueDate?: string;
}

export default function PetDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [pet, setPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    } else if (isAuthenticated && params.id) {
      fetchPet();
    }
  }, [authLoading, isAuthenticated, params.id, router]);

  const fetchPet = async () => {
    try {
      const response = await apiClient.get(`/pets/${params.id}`);
      setPet(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load pet details');
    } finally {
      setLoading(false);
    }
  };

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birth = new Date(dateOfBirth);
    const years = today.getFullYear() - birth.getFullYear();
    const months = today.getMonth() - birth.getMonth();

    if (years < 1) {
      return `${months + (years * 12)} months`;
    }
    return `${years} year${years > 1 ? 's' : ''}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !pet) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Pet not found'}</p>
          <Link href="/dashboard/pets" className="text-indigo-600 hover:text-indigo-700">
            ← Back to Pets
          </Link>
        </div>
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
              <Link href="/dashboard/pets" className="text-gray-600 hover:text-gray-900">
                ← Back
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">{pet.name}</h1>
            </div>
            <Link
              href={`/dashboard/pets/${pet.id}/edit`}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              Edit Pet
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Pet Profile */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-6">
              {/* Pet Image */}
              <div className="aspect-square bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg mb-6 overflow-hidden">
                {pet.profileImage ? (
                  <img
                    src={pet.profileImage}
                    alt={pet.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-8xl">
                    {pet.species === 'DOG' ? '🐕' : pet.species === 'CAT' ? '🐈' : '🐾'}
                  </div>
                )}
              </div>

              {/* Basic Info */}
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Species</p>
                  <p className="font-medium text-gray-900">{pet.species}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Breed</p>
                  <p className="font-medium text-gray-900">{pet.breed}</p>
                </div>
                {pet.gender && (
                  <div>
                    <p className="text-sm text-gray-500">Gender</p>
                    <p className="font-medium text-gray-900">{pet.gender}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-500">Age</p>
                  <p className="font-medium text-gray-900">{calculateAge(pet.dateOfBirth)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Date of Birth</p>
                  <p className="font-medium text-gray-900">{formatDate(pet.dateOfBirth)}</p>
                </div>
                {pet.weight && (
                  <div>
                    <p className="text-sm text-gray-500">Weight</p>
                    <p className="font-medium text-gray-900">{pet.weight} kg</p>
                  </div>
                )}
                {pet.color && (
                  <div>
                    <p className="text-sm text-gray-500">Color</p>
                    <p className="font-medium text-gray-900">{pet.color}</p>
                  </div>
                )}
                {pet.microchipId && (
                  <div>
                    <p className="text-sm text-gray-500">Microchip ID</p>
                    <p className="font-medium text-gray-900 text-xs">{pet.microchipId}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Health Info & Records */}
          <div className="lg:col-span-2 space-y-6">
            {/* Health Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Health Information</h2>

              <div className="space-y-4">
                {pet.allergies && pet.allergies.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Allergies</p>
                    <div className="flex flex-wrap gap-2">
                      {pet.allergies.map((allergy, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm"
                        >
                          {allergy}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {pet.chronicConditions && pet.chronicConditions.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Chronic Conditions</p>
                    <div className="flex flex-wrap gap-2">
                      {pet.chronicConditions.map((condition, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm"
                        >
                          {condition}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {pet.currentMedications && pet.currentMedications.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Current Medications</p>
                    <div className="flex flex-wrap gap-2">
                      {pet.currentMedications.map((medication, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                        >
                          {medication}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {pet.medicalNotes && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Medical Notes</p>
                    <p className="text-gray-600 text-sm bg-gray-50 p-3 rounded-lg">
                      {pet.medicalNotes}
                    </p>
                  </div>
                )}

                {!pet.allergies && !pet.chronicConditions && !pet.currentMedications && !pet.medicalNotes && (
                  <p className="text-gray-500 text-sm">No health information recorded yet.</p>
                )}
              </div>
            </div>

            {/* Health Records */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Health Records</h2>

              {pet.healthRecords && pet.healthRecords.length > 0 ? (
                <div className="space-y-3">
                  {pet.healthRecords.map((record) => (
                    <div
                      key={record.id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <p className="font-medium text-gray-900">{record.diagnosis}</p>
                        <span className="text-sm text-gray-500">{formatDate(record.date)}</span>
                      </div>
                      {record.treatment && (
                        <p className="text-sm text-gray-600">{record.treatment}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No health records yet.</p>
              )}
            </div>

            {/* Vaccinations */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Vaccinations</h2>

              {pet.vaccinations && pet.vaccinations.length > 0 ? (
                <div className="space-y-3">
                  {pet.vaccinations.map((vaccination) => (
                    <div
                      key={vaccination.id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-900">{vaccination.name}</p>
                          <p className="text-sm text-gray-500">
                            Administered: {formatDate(vaccination.date)}
                          </p>
                          {vaccination.nextDueDate && (
                            <p className="text-sm text-indigo-600 mt-1">
                              Next due: {formatDate(vaccination.nextDueDate)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No vaccination records yet.</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
