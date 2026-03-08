'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/apiClient';

interface Veterinarian {
  id: string;
  user: {
    firstName: string;
    lastName: string;
  };
  bio: string;
  yearsOfExperience: number;
  consultationFeeClinic: number;
  rating: number;
  reviewCount: number;
  profileImage: string | null;
  specializations: Array<{ specialization: string }>;
  clinicAffiliations: Array<{
    clinic: {
      name: string;
      city: string;
    };
  }>;
}

const CITIES = [
  'Colombo', 'Kandy', 'Galle', 'Jaffna', 'Negombo', 'Matara', 'Batticaloa', 'Trincomalee'
];

const SPECIALIZATIONS = [
  'General Practice',
  'Surgery',
  'Dentistry',
  'Dermatology',
  'Cardiology',
  'Emergency Care',
];

export default function HomePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState('');
  const [featuredVets, setFeaturedVets] = useState<Veterinarian[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch featured vets on mount
  useEffect(() => {
    fetchFeaturedVets();
  }, []);

  const fetchFeaturedVets = async () => {
    try {
      const response = await apiClient.get('/veterinarians', {
        params: { sort: 'rating', limit: 6 },
      });
      setFeaturedVets(response.data.slice(0, 6));
    } catch (error) {
      console.error('Failed to fetch featured vets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.append('query', searchQuery);
    if (selectedCity) params.append('city', selectedCity);
    if (selectedSpecialization) params.append('specialization', selectedSpecialization);

    router.push(`/vets/search?${params.toString()}`);
  };

  const renderStars = (rating: number) => {
    return '⭐'.repeat(Math.round(rating));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-emerald-600">🐾 VetCare Sri Lanka</h1>
            <div className="space-x-4">
              <Link
                href="/login"
                className="text-gray-700 hover:text-emerald-600 font-medium transition"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium transition"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section with Search */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-16 md:py-24 text-center">
          <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Find the Best{' '}
            <span className="text-emerald-600">Veterinary Care</span>
            <br />
            in Sri Lanka
          </h2>
          <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto">
            Connect with licensed, verified veterinarians across the country.
            Search by location, specialization, or name to find the perfect care for your pet.
          </p>

          {/* Search Box */}
          <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl p-6 md:p-8">
            <div className="grid md:grid-cols-3 gap-4 mb-4">
              {/* Search Input */}
              <div className="md:col-span-3">
                <input
                  type="text"
                  placeholder="Search by vet name or specialization..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none text-lg"
                />
              </div>

              {/* City Filter */}
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none bg-white"
              >
                <option value="">All Cities</option>
                {CITIES.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>

              {/* Specialization Filter */}
              <select
                value={selectedSpecialization}
                onChange={(e) => setSelectedSpecialization(e.target.value)}
                className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none bg-white"
              >
                <option value="">All Specializations</option>
                {SPECIALIZATIONS.map((spec) => (
                  <option key={spec} value={spec}>
                    {spec}
                  </option>
                ))}
              </select>

              {/* Search Button */}
              <button
                onClick={handleSearch}
                className="px-8 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 font-semibold text-lg transition shadow-lg hover:shadow-xl"
              >
                🔍 Find Vets
              </button>
            </div>

            {/* Quick Specialization Chips */}
            <div className="flex flex-wrap gap-2 justify-center">
              {SPECIALIZATIONS.slice(0, 4).map((spec) => (
                <button
                  key={spec}
                  onClick={() => {
                    setSelectedSpecialization(spec);
                    setSearchQuery('');
                  }}
                  className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full hover:bg-emerald-100 font-medium text-sm transition"
                >
                  {spec}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Featured Veterinarians */}
        <div className="py-16">
          <div className="text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Top-Rated Veterinarians
            </h3>
            <p className="text-lg text-gray-600">
              Meet our highly-rated and verified veterinary professionals
            </p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent"></div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
              {featuredVets.map((vet) => (
                <div
                  key={vet.id}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition p-6"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                      {vet.user.firstName[0]}{vet.user.lastName[0]}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-lg text-gray-900">
                        Dr. {vet.user.firstName} {vet.user.lastName}
                      </h4>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-yellow-500">{renderStars(Number(vet.rating))}</span>
                        <span className="text-gray-600">({vet.reviewCount} reviews)</span>
                      </div>
                    </div>
                  </div>

                  {vet.specializations.length > 0 && (
                    <div className="mb-3">
                      <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">
                        {vet.specializations[0].specialization}
                      </span>
                    </div>
                  )}

                  {vet.clinicAffiliations.length > 0 && (
                    <p className="text-gray-600 text-sm mb-3">
                      📍 {vet.clinicAffiliations[0].clinic.city}
                    </p>
                  )}

                  <p className="text-gray-700 text-sm mb-4 line-clamp-2">
                    {vet.bio || `${vet.yearsOfExperience} years of experience`}
                  </p>

                  <div className="flex items-center justify-between">
                    <span className="text-emerald-600 font-bold text-lg">
                      Rs. {Number(vet.consultationFeeClinic).toLocaleString()}
                    </span>
                    <Link
                      href={`/vets/${vet.id}`}
                      className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium text-sm transition"
                    >
                      View Profile
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="text-center">
            <Link
              href="/vets/search"
              className="inline-block px-8 py-4 bg-white text-emerald-600 rounded-xl hover:bg-gray-50 font-semibold text-lg transition border-2 border-emerald-600"
            >
              View All Veterinarians →
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div className="py-16 grid md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition">
            <div className="text-5xl mb-4">🏥</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">In-Clinic Visits</h3>
            <p className="text-gray-600">
              Book appointments with nearby veterinary clinics and get professional care for your pets.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition">
            <div className="text-5xl mb-4">💻</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Telemedicine</h3>
            <p className="text-gray-600">
              Connect with vets online through video consultations from the comfort of your home.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition">
            <div className="text-5xl mb-4">📱</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Health Records</h3>
            <p className="text-gray-600">
              Keep all your pet's medical records, vaccinations, and prescriptions in one place.
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="py-16 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-12 text-center shadow-2xl mb-16">
          <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Get Started?
          </h3>
          <p className="text-emerald-100 text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of pet owners who trust VetCare for their pets' healthcare needs.
          </p>
          <Link
            href="/register"
            className="inline-block px-8 py-4 bg-white text-emerald-600 rounded-xl hover:bg-gray-100 font-semibold text-lg transition shadow-lg"
          >
            Create Free Account
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-gray-600">
            © 2026 VetCare Sri Lanka. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
