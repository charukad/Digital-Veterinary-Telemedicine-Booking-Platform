'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import apiClient from '@/lib/api-client';

interface Vet {
  id: string;
  firstName?: string;
  lastName?: string;
  bio?: string;
  licenseNumber: string;
  licenseIssuedBy?: string;
  yearsOfExperience?: number;
  rating: number;
  reviewCount: number;
  consultationFeeClinic: number;
  consultationFeeHome: number;
  consultationFeeOnline: number;
  user: {
    email: string;
    phone?: string;
  };
  qualifications: Array<{
    degree: string;
    institution: string;
    yearObtained: number;
  }>;
  specializations: Array<{
    specialization: string;
  }>;
  clinicAffiliations: Array<{
    clinic: {
      name: string;
      address: string;
      city: string;
      phone: string;
      email?: string;
    };
  }>;
  reviews: Array<{
    rating: number;
    comment?: string;
    createdAt: string;
    petOwner: {
      firstName: string;
      lastName: string;
    };
  }>;
}

export default function VetProfilePage() {
  const router = useRouter();
  const params = useParams();
  const [vet, setVet] = useState<Vet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (params.id) {
      fetchVet();
    }
  }, [params.id]);

  const fetchVet = async () => {
    try {
      const response = await apiClient.get(`/veterinarians/${params.id}`);
      setVet(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load veterinarian profile');
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

  if (error || !vet) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Veterinarian not found'}</p>
          <Link href="/vets" className="text-indigo-600 hover:text-indigo-700">
            ← Back to Vet Directory
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
            <Link href="/vets" className="text-gray-600 hover:text-gray-900">
              ← Back to Directory
            </Link>
            <Link
              href={`/appointments/book?vetId=${vet.id}`}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              Book Appointment
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Sidebar - Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-6">
              {/* Profile Image Placeholder */}
              <div className="w-32 h-32 mx-auto mb-4 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center text-5xl">
                👨‍⚕️
              </div>

              <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">
                {vet.firstName && vet.lastName
                  ? `Dr. ${vet.firstName} ${vet.lastName}`
                  : 'Dr. ' + vet.user.email.split('@')[0]}
              </h1>

              {/* Rating */}
              {vet.rating > 0 && (
                <div className="flex items-center justify-center mb-4">
                  <span className="text-yellow-500 text-xl">★</span>
                  <span className="ml-2 font-semibold text-lg">{vet.rating.toFixed(1)}</span>
                  <span className="ml-1 text-gray-500 text-sm">({vet.reviewCount} reviews)</span>
                </div>
              )}

              {/* Specializations */}
              {vet.specializations.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Specializations</h3>
                  <div className="flex flex-wrap gap-2">
                    {vet.specializations.map((spec, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm"
                      >
                        {spec.specialization}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* License */}
              <div className="border-t pt-4 space-y-2">
                <div>
                  <p className="text-xs text-gray-500">License Number</p>
                  <p className="font-medium text-gray-900">{vet.licenseNumber}</p>
                </div>
                {vet.licenseIssuedBy && (
                  <div>
                    <p className="text-xs text-gray-500">Issued By</p>
                    <p className="font-medium text-gray-900">{vet.licenseIssuedBy}</p>
                  </div>
                )}
                {vet.yearsOfExperience && (
                  <div>
                    <p className="text-xs text-gray-500">Experience</p>
                    <p className="font-medium text-gray-900">{vet.yearsOfExperience} years</p>
                  </div>
                )}
              </div>

              {/* Contact */}
              <div className="border-t mt-4 pt-4 space-y-2">
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="text-sm text-gray-900">{vet.user.email}</p>
                </div>
                {vet.user.phone && (
                  <div>
                    <p className="text-xs text-gray-500">Phone</p>
                    <p className="text-sm text-gray-900">{vet.user.phone}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* About */}
            {vet.bio && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">About</h2>
                <p className="text-gray-600 whitespace-pre-wrap">{vet.bio}</p>
              </div>
            )}

            {/* Qualifications */}
            {vet.qualifications.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Education & Qualifications</h2>
                <div className="space-y-4">
                  {vet.qualifications.map((qual, index) => (
                    <div key={index} className="flex">
                      <div className="flex-shrink-0 w-2 h-2 mt-2 bg-indigo-600 rounded-full"></div>
                      <div className="ml-4">
                        <h3 className="font-semibold text-gray-900">{qual.degree}</h3>
                        <p className="text-gray-600">{qual.institution}</p>
                        <p className="text-sm text-gray-500">{qual.yearObtained}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Consultation Fees */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Consultation Fees</h2>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">In-Clinic</p>
                  <p className="text-2xl font-bold text-gray-900">
                    LKR {parseFloat(vet.consultationFeeClinic.toString()).toLocaleString()}
                  </p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Home Visit</p>
                  <p className="text-2xl font-bold text-gray-900">
                    LKR {parseFloat(vet.consultationFeeHome.toString()).toLocaleString()}
                  </p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Online</p>
                  <p className="text-2xl font-bold text-gray-900">
                    LKR {parseFloat(vet.consultationFeeOnline.toString()).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Clinic Affiliations */}
            {vet.clinicAffiliations.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Clinic Affiliations</h2>
                <div className="space-y-4">
                  {vet.clinicAffiliations.map((affiliation, index) => (
                    <div key={index} className="border-l-4 border-indigo-600 pl-4">
                      <h3 className="font-semibold text-gray-900">{affiliation.clinic.name}</h3>
                      <p className="text-gray-600 text-sm">{affiliation.clinic.address}</p>
                      <p className="text-gray-600 text-sm">{affiliation.clinic.city}</p>
                      <p className="text-gray-600 text-sm mt-1">📞 {affiliation.clinic.phone}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            {vet.reviews && vet.reviews.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Reviews</h2>
                <div className="space-y-4">
                  {vet.reviews.map((review, index) => (
                    <div key={index} className="border-b pb-4 last:border-b-0">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-semibold text-gray-900">
                          {review.petOwner.firstName} {review.petOwner.lastName}
                        </p>
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <span
                              key={i}
                              className={i < review.rating ? 'text-yellow-500' : 'text-gray-300'}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                      </div>
                      {review.comment && <p className="text-gray-600 text-sm">{review.comment}</p>}
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
