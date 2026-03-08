'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import apiClient from '@/lib/api-client';
import { useAuth } from '@/contexts/AuthContext';

interface Qualification {
  degree: string;
  institution: string;
  year: string;
  certificateUrl?: string;
}

interface Specialization {
  name: string;
  certificateUrl?: string;
}

export default function VetProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    bio: '',
    licenseNumber: '',
    licenseIssuedBy: '',
    licenseExpiryDate: '',
    consultationFee: '',
    emergencyAvailable: 'false',
    languages: [] as string[],
  });
  const [qualifications, setQualifications] = useState<Qualification[]>([
    { degree: '', institution: '', year: '' },
  ]);
  const [specializations, setSpecializations] = useState<Specialization[]>([
    { name: '' },
  ]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    } else if (isAuthenticated && user?.userType !== 'VETERINARIAN') {
      router.push('/dashboard');
    } else if (isAuthenticated) {
      fetchProfile();
    }
  }, [authLoading, isAuthenticated, user, router]);

  const fetchProfile = async () => {
    try {
      const response = await apiClient.get('/veterinarians/profile');
      const profile = response.data;

      if (profile) {
        setFormData({
          firstName: profile.firstName || '',
          lastName: profile.lastName || '',
          bio: profile.bio || '',
          licenseNumber: profile.licenseNumber || '',
          licenseIssuedBy: profile.licenseIssuedBy || '',
          licenseExpiryDate: profile.licenseExpiryDate || '',
          consultationFee: profile.consultationFee || '',
          emergencyAvailable: profile.emergencyAvailable || 'false',
          languages: profile.languages || [],
        });

        if (profile.qualifications?.length > 0) {
          setQualifications(profile.qualifications.map((q: any) => ({
            degree: q.degree,
            institution: q.institution,
            year: q.yearObtained,
            certificateUrl: q.certificateUrl,
          })));
        }

        if (profile.specializations?.length > 0) {
          setSpecializations(profile.specializations.map((s: any) => ({
            name: s.specialization,
            certificateUrl: s.certificateUrl,
          })));
        }
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const addQualification = () => {
    setQualifications([...qualifications, { degree: '', institution: '', year: '' }]);
  };

  const removeQualification = (index: number) => {
    setQualifications(qualifications.filter((_, i) => i !== index));
  };

  const updateQualification = (index: number, field: string, value: string) => {
    const updated = [...qualifications];
    updated[index] = { ...updated[index], [field]: value };
    setQualifications(updated);
  };

  const addSpecialization = () => {
    setSpecializations([...specializations, { name: '' }]);
  };

  const removeSpecialization = (index: number) => {
    setSpecializations(specializations.filter((_, i) => i !== index));
  };

  const updateSpecialization = (index: number, value: string) => {
    const updated = [...specializations];
    updated[index] = { ...updated[index], name: value };
    setSpecializations(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await apiClient.patch('/veterinarians/profile', {
        ...formData,
        qualifications: qualifications.filter(q => q.degree && q.institution && q.year),
        specializations: specializations.filter(s => s.name),
      });

      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile');
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
                ← Back
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Veterinarian Profile</h1>
            </div>
            <div className="flex space-x-2">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`h-2 w-12 rounded ${
                    s <= step ? 'bg-indigo-600' : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-8">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Step 1: Basic Information */}
            {step === 1 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">Basic Information</h2>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name *
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      required
                      value={formData.firstName}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      required
                      value={formData.lastName}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Professional Bio *
                  </label>
                  <textarea
                    name="bio"
                    required
                    rows={4}
                    value={formData.bio}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="Tell potential clients about yourself..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      License Number *
                    </label>
                    <input
                      type="text"
                      name="licenseNumber"
                      required
                      value={formData.licenseNumber}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      License Issued By
                    </label>
                    <input
                      type="text"
                      name="licenseIssuedBy"
                      value={formData.licenseIssuedBy}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      placeholder="e.g., SLVC"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    Next: Qualifications →
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Qualifications */}
            {step === 2 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">Qualifications & Education</h2>

                {qualifications.map((qual, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-medium text-gray-900">Qualification #{index + 1}</h3>
                      {qualifications.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeQualification(index)}
                          className="text-red-600 hover:text-red-700 text-sm"
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Degree
                        </label>
                        <input
                          type="text"
                          value={qual.degree}
                          onChange={(e) => updateQualification(index, 'degree', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                          placeholder="e.g., DVM"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Institution
                        </label>
                        <input
                          type="text"
                          value={qual.institution}
                          onChange={(e) => updateQualification(index, 'institution', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                          placeholder="University name"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Year
                        </label>
                        <input
                          type="text"
                          value={qual.year}
                          onChange={(e) => updateQualification(index, 'year', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                          placeholder="2020"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addQualification}
                  className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                >
                  + Add Another Qualification
                </button>

                <div className="flex justify-between pt-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                  >
                    ← Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    Next: Specializations →
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Specializations */}
            {step === 3 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">Specializations</h2>

                {specializations.map((spec, index) => (
                  <div key={index} className="flex gap-4 items-end">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Specialization #{index + 1}
                      </label>
                      <input
                        type="text"
                        value={spec.name}
                        onChange={(e) => updateSpecialization(index, e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        placeholder="e.g., Small Animals, Surgery, Internal Medicine"
                      />
                    </div>
                    {specializations.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSpecialization(index)}
                        className="px-4 py-2 text-red-600 hover:text-red-700"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addSpecialization}
                  className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                >
                  + Add Another Specialization
                </button>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Consultation Fee (LKR)
                  </label>
                  <input
                    type="text"
                    name="consultationFee"
                    value={formData.consultationFee}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g., 2500"
                  />
                </div>

                <div className="flex justify-between pt-4">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                  >
                    ← Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : 'Save Profile'}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </main>
    </div>
  );
}
