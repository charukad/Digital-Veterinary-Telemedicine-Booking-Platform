'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import apiClient from '@/lib/api-client';

interface Vet {
  id: string;
  firstName: string;
  lastName: string;
  licenseNumber: string;
  bio: string;
  yearsOfExperience: number;
  consultationFeeClinic: number;
  rating: number;
  reviewCount: number;
  profileImage?: string;
  specializations: Array<{ name: string }>;
  clinicAffiliations: Array<{
    clinic: {
      name: string;
      city: string;
      address: string;
    };
  }>;
}

function VetSearchPageFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  );
}

function VetSearchPageContent() {
  const searchParams = useSearchParams();
  const [vets, setVets] = useState<Vet[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [query, setQuery] = useState(searchParams.get('query') || '');
  const [city, setCity] = useState(searchParams.get('city') || '');
  const [specialization, setSpecialization] = useState(searchParams.get('specialization') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [minRating, setMinRating] = useState(searchParams.get('minRating') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'rating');

  useEffect(() => {
    searchVets();
  }, [query, city, specialization, minPrice, maxPrice, minRating, sort]);

  const searchVets = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (query) params.append('query', query);
      if (city) params.append('city', city);
      if (specialization) params.append('specialization', specialization);
      if (minPrice) params.append('minPrice', minPrice);
      if (maxPrice) params.append('maxPrice', maxPrice);
      if (minRating) params.append('minRating', minRating);
      if (sort) params.append('sort', sort);

      const response = await apiClient.get(`/veterinarians?${params.toString()}`);
      setVets(response.data);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Find a Veterinarian</h1>
          <p className="mt-2 text-gray-600">Search and filter to find the perfect vet for your pet</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filters Sidebar */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow p-6 sticky top-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Filters</h2>

              {/* Search Query */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Name, bio..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* City */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">All Cities</option>
                  <option value="Colombo">Colombo</option>
                  <option value="Kandy">Kandy</option>
                  <option value="Galle">Galle</option>
                  <option value="Jaffna">Jaffna</option>
                  <option value="Negombo">Negombo</option>
                </select>
              </div>

              {/* Specialization */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Specialization</label>
                <select
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">All Specializations</option>
                  <option value="Small Animal">Small Animal</option>
                  <option value="Large Animal">Large Animal</option>
                  <option value="Exotic">Exotic Animals</option>
                  <option value="Surgery">Surgery</option>
                  <option value="Dentistry">Dentistry</option>
                </select>
              </div>

              {/* Price Range */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Price Range (LKR)</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    placeholder="Min"
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <input
                    type="number"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    placeholder="Max"
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Rating */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Rating</label>
                <select
                  value={minRating}
                  onChange={(e) => setMinRating(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Any Rating</option>
                  <option value="4">4+ Stars</option>
                  <option value="4.5">4.5+ Stars</option>
                </select>
              </div>

              {/* Clear Filters */}
              <button
                onClick={() => {
                  setQuery('');
                  setCity('');
                  setSpecialization('');
                  setMinPrice('');
                  setMaxPrice('');
                  setMinRating('');
                }}
                className="w-full px-4 py-2 text-sm text-indigo-600 border border-indigo-600 rounded-md hover:bg-indigo-50 transition"
              >
                Clear All Filters
              </button>
            </div>
          </div>

          {/* Results */}
          <div className="flex-1">
            {/* Sort */}
            <div className="flex justify-between items-center mb-6">
              <p className="text-gray-600">{vets.length} veterinarians found</p>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="rating">Highest Rated</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="experience">Most Experienced</option>
              </select>
            </div>

            {/* Loading */}
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              </div>
            ) : vets.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <h3 className="mt-2 text-lg font-medium text-gray-900">No results found</h3>
                <p className="mt-1 text-gray-500">Try adjusting your filters</p>
              </div>
            ) : (
              <div className="grid gap-6">
                {vets.map((vet) => (
                  <div key={vet.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <h3 className="text-xl font-semibold text-gray-900">
                            Dr. {vet.firstName} {vet.lastName}
                          </h3>
                          <div className="ml-3 flex items-center">
                            <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <span className="ml-1 text-sm font-medium text-gray-700">{vet.rating.toFixed(1)} ({vet.reviewCount})</span>
                          </div>
                        </div>

                        <p className="text-gray-600 mb-3">{vet.bio || 'Professional veterinarian'}</p>

                        <div className="flex flex-wrap gap-2 mb-3">
                          {vet.specializations.map((spec, idx) => (
                            <span key={idx} className="px-3 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-full">
                              {spec.name}
                            </span>
                          ))}
                        </div>

                        <div className="grid md:grid-cols-2 gap-2 text-sm text-gray-600">
                          <div>📍 {vet.clinicAffiliations[0]?.clinic.city || 'Location not specified'}</div>
                          <div>💼 {vet.yearsOfExperience || 0} years experience</div>
                        </div>
                      </div>

                      <div className="ml-6 text-right">
                        <p className="text-2xl font-bold text-indigo-600">LKR {Number(vet.consultationFeeClinic).toFixed(0)}</p>
                        <p className="text-xs text-gray-500 mb-4">Consultation fee</p>
                        <Link
                          href={`/vets/${vet.id}`}
                          className="inline-block px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                        >
                          View Profile
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VetSearchPage() {
  return (
    <Suspense fallback={<VetSearchPageFallback />}>
      <VetSearchPageContent />
    </Suspense>
  );
}
