'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api-client';
import { useAuth } from '@/contexts/AuthContext';

interface Vet {
  id: string;
  licenseNumber: string;
  yearsOfExperience: number;
  bio: string;
  verified: boolean;
  firstName?: string;
  lastName?: string;
  user: {
    email: string;
    phone?: string;
    createdAt: string;
  };
  qualifications: Array<{
    degree: string;
    institution: string;
    year: number;
  }>;
  specializations: Array<{
    name: string;
  }>;
}

export default function VerificationQueue() {
  const router = useRouter();
  const { user } = useAuth();
  const [vets, setVets] = useState<Vet[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingVetId, setProcessingVetId] = useState<string | null>(null);

  useEffect(() => {
    if (user?.userType !== 'ADMIN') {
      router.push('/dashboard');
      return;
    }

    fetchQueue();
  }, [user, router]);

  const fetchQueue = async () => {
    try {
      const response = await apiClient.get('/admin/verification-queue');
      setVets(response.data);
    } catch (error) {
      console.error('Failed to fetch queue:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (vetId: string) => {
    if (!confirm('Approve this veterinarian?')) return;

    setProcessingVetId(vetId);
    try {
      await apiClient.post(`/admin/verify/${vetId}/approve`, {
        adminId: user?.id,
      });
      alert('Veterinarian approved successfully!');
      fetchQueue();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to approve');
    } finally {
      setProcessingVetId(null);
    }
  };

  const handleReject = async (vetId: string) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (!reason) return;

    setProcessingVetId(vetId);
    try {
      await apiClient.post(`/admin/verify/${vetId}/reject`, {
        adminId: user?.id,
        reason,
      });
      alert('Rejection email sent');
      fetchQueue();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to reject');
    } finally {
      setProcessingVetId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/admin')}
            className="text-indigo-600 hover:text-indigo-800 mb-4 flex items-center"
          >
            <svg className="h-5 w-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Verification Queue</h1>
          <p className="mt-2 text-gray-600">{vets.length} veterinarians pending verification</p>
        </div>

        {/* Queue List */}
        {vets.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900">All caught up!</h3>
            <p className="mt-1 text-gray-500">No pending verifications at the moment.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {vets.map((vet) => (
              <div key={vet.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Dr. {vet.firstName} {vet.lastName}
                    </h3>
                    <p className="text-sm text-gray-500">{vet.user.email}</p>

                    <div className="mt-4 grid md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-700">License Number</p>
                        <p className="text-sm text-gray-900">{vet.licenseNumber}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Experience</p>
                        <p className="text-sm text-gray-900">{vet.yearsOfExperience || 0} years</p>
                      </div>
                    </div>

                    {vet.qualifications.length > 0 && (
                      <div className="mt-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">Qualifications</p>
                        <div className="space-y-1">
                          {vet.qualifications.map((q, idx) => (
                            <p key={idx} className="text-sm text-gray-600">
                              • {q.degree} - {q.institution} ({q.year})
                            </p>
                          ))}
                        </div>
                      </div>
                    )}

                    {vet.specializations.length > 0 && (
                      <div className="mt-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">Specializations</p>
                        <div className="flex flex-wrap gap-2">
                          {vet.specializations.map((s, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-full"
                            >
                              {s.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="ml-6 flex flex-col space-y-2">
                    <button
                      onClick={() => handleApprove(vet.id)}
                      disabled={processingVetId === vet.id}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition whitespace-nowrap"
                    >
                      {processingVetId === vet.id ? 'Processing...' : '✓ Approve'}
                    </button>
                    <button
                      onClick={() => handleReject(vet.id)}
                      disabled={processingVetId === vet.id}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition whitespace-nowrap"
                    >
                      {processingVetId === vet.id ? 'Processing...' : '✗ Reject'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
