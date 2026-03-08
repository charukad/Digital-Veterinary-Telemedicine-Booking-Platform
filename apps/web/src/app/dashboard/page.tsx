'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading, logout, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">VetCare Dashboard</h1>
            <button
              onClick={logout}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Welcome Back!</h2>

          <div className="space-y-3">
            <p className="text-gray-600">
              <span className="font-medium">Email:</span> {user.email}
            </p>
            <p className="text-gray-600">
              <span className="font-medium">Account Type:</span>{' '}
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                {user.userType}
              </span>
            </p>
            <p className="text-gray-600">
              <span className="font-medium">Status:</span>{' '}
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                user.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {user.status}
              </span>
            </p>
          </div>

          {user.profile && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Profile Information</h3>
              <div className="space-y-2">
                {user.profile.firstName && (
                  <p className="text-gray-600">
                    <span className="font-medium">Name:</span> {user.profile.firstName} {user.profile.lastName}
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="mt-8">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800">
                🎉 Authentication system is working! You&apos;re successfully logged in.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {/* Veterinarian-specific links */}
              {user.userType === 'VETERINARIAN' && (
                <>
                  <Link
                    href="/dashboard/vet-profile"
                    className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border-2 border-purple-200 hover:border-purple-300 transition"
                  >
                    <div className="text-4xl mb-3">👨‍⚕️</div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">My Vet Profile</h3>
                    <p className="text-sm text-gray-600">
                      Manage your professional profile, qualifications, and specializations
                    </p>
                  </Link>

                  <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border-2 border-green-200 opacity-50">
                    <div className="text-4xl mb-3">📅</div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">My Appointments</h3>
                    <p className="text-sm text-gray-600">
                      Coming soon - View and manage your appointments
                    </p>
                  </div>
                </>
              )}

              {/* Pet Owner-specific links */}
              {user.userType === 'PET_OWNER' && (
                <>
                  <Link
                    href="/dashboard/pets"
                    className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg border-2 border-indigo-200 hover:border-indigo-300 transition"
                  >
                    <div className="text-4xl mb-3">🐾</div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">My Pets</h3>
                    <p className="text-sm text-gray-600">
                      Manage your pets, add health records, and track vaccinations
                    </p>
                  </Link>

                  <Link
                    href="/vets"
                    className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg border-2 border-blue-200 hover:border-blue-300 transition"
                  >
                    <div className="text-4xl mb-3">🔍</div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Find Vets</h3>
                    <p className="text-sm text-gray-600">
                      Search and discover veterinarians near you
                    </p>
                  </Link>

                  <Link
                    href="/appointments"
                    className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border-2 border-green-200 hover:border-green-300 transition"
                  >
                    <div className="text-4xl mb-3">📅</div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Appointments</h3>
                    <p className="text-sm text-gray-600">
                      View and manage your upcoming appointments
                    </p>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
