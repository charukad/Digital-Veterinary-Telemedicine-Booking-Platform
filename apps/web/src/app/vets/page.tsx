'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import apiClient from '@/lib/api-client';

interface Vet {
  id: string;
  firstName?: string;
  lastName?: string;
  bio?: string;
  licenseNumber: string;
  yearsOfExperience?: number;
  rating: number;
  reviewCount: number;
  consultationFeeClinic: number;
  user: {
    email: string;
  };
  specializations: Array<{
    specialization: string;
  }>;
  clinicAffiliations: Array<{
    clinic: {
      name: string;
      city: string;
      address: string;
    };
  }>;
}

export default function VetsPage() {
  const [vets, setVets] = useState<Vet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [specializationFilter, setSpecializationFilter] = useState('');

  useEffect(() => {
    fetchVets();
  }, [cityFilter, specializationFilter]);

  const fetchVets = async () => {
    try {
      const params = new URLSearchParams();
      if (cityFilter) params.append('city', cityFilter);
      if (specializationFilter) params.append('specialization', specializationFilter);

      const response = await apiClient.get(`/veterinarians?${params.toString()}`);
      setVets(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load veterinarians');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Find a Veterinarian</h1>
              <p className="mt-1 text-sm text-gray-600">
                Search and connect with licensed veterinarians across Sri Lanka
              </p>
            </div>
            <Link
              href="/dashboard"
              className="text-gray-600 hover:text-gray-900 font-medium"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Filters */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City
              </label>
              <input
                type="text"
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                placeholder="e.g., Colombo"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Specialization
              </label>
              <input
                type="text"
                value={specializationFilter}
                onChange={(e) => setSpecializationFilter(e.target.value)}
                placeholder="e.g., Small Animals"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setCityFilter('');
                  setSpecializationFilter('');
                }}
                className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
              >
                Clear Filters
              </button>
            </div>
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

        {vets.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">No veterinarians found</h2>
            <p className="text-gray-600 mb-4">Try adjusting your search filters</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vets.map((vet) => (
              <div
                key={vet.id}
                className="bg-white rounded-lg shadow hover:shadow-xl transition overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-1">
                        {vet.firstName && vet.lastName
                          ? `Dr. ${vet.firstName} ${vet.lastName}`
                          : vet.user.email}
                      </h3>
                      <p className="text-sm text-gray-500">License: {vet.licenseNumber}</p>
                    </div>
                    {vet.rating > 0 && (
                      <div className="text-right">
                        <div className="flex items-center">
                          <span className="text-yellow-500">★</span>
                          <span className="ml-1 font-semibold">{vet.rating.toFixed(1)}</span>
                        </div>
                        <p className="text-xs text-gray-500">({vet.reviewCount} reviews)</p>
                      </div>
                    )}
                  </div>

                  {vet.bio && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{vet.bio}</p>
                  )}

                  {/* Specializations */}
                  {vet.specializations.length > 0 && (
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-2">
                        {vet.specializations.slice(0, 3).map((spec, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium"
                          >
                            {spec.specialization}
                          </span>
                        ))}
                        {vet.specializations.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                            +{vet.specializations.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Clinic Info */}
                  {vet.clinicAffiliations.length > 0 && (
                    <div className="mb-4 text-sm text-gray-600">
                      <p className="font-medium">📍 {vet.clinicAffiliations[0].clinic.name}</p>
                      <p className="text-xs">{vet.clinicAffiliations[0].clinic.city}</p>
                    </div>
                  )}

                  {/* Fee */}
                  <div className="mb-4 pb-4 border-b">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Consultation Fee:</span> LKR{' '}
                      {parseFloat(vet.consultationFeeClinic.toString()).toLocaleString()}
                    </p>
                  </div>

                  <Link
                    href={`/vets/${vet.id}`}
                    className="block w-full text-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                  >
                    View Profile
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
