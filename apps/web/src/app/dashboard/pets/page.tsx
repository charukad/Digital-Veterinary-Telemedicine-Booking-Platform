'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import apiClient from '@/lib/api-client';
import { useAuth } from '@/contexts/AuthContext';

interface Pet {
  id: string;
  name: string;
  species: string;
  breed: string;
  dateOfBirth: string;
  weight?: number;
  profileImage?: string;
}

export default function PetsPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    } else if (isAuthenticated) {
      fetchPets();
    }
  }, [authLoading, isAuthenticated, router]);

  const fetchPets = async () => {
    try {
      const response = await apiClient.get('/pets');
      setPets(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load pets');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this pet?')) return;

    try {
      await apiClient.delete(`/pets/${id}`);
      setPets(pets.filter((pet) => pet.id !== id));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete pet');
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
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
                ← Back
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">My Pets</h1>
            </div>
            <Link
              href="/dashboard/pets/new"
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              + Add Pet
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {pets.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-6xl mb-4">🐾</div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">No pets yet</h2>
            <p className="text-gray-600 mb-6">Add your first pet to get started with VetCare</p>
            <Link
              href="/dashboard/pets/new"
              className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              Add Your First Pet
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pets.map((pet) => (
              <div
                key={pet.id}
                className="bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden"
              >
                <div className="aspect-w-16 aspect-h-9 bg-gradient-to-br from-indigo-100 to-purple-100">
                  {pet.profileImage ? (
                    <img
                      src={pet.profileImage}
                      alt={pet.name}
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <div className="w-full h-48 flex items-center justify-center text-6xl">
                      {pet.species === 'DOG' ? '🐕' : pet.species === 'CAT' ? '🐈' : '🐾'}
                    </div>
                  )}
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{pet.name}</h3>

                  <div className="space-y-2 mb-4">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Species:</span> {pet.species}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Breed:</span> {pet.breed}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Age:</span> {calculateAge(pet.dateOfBirth)}
                    </p>
                    {pet.weight && (
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Weight:</span> {pet.weight} kg
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Link
                      href={`/dashboard/pets/${pet.id}`}
                      className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-center text-sm"
                    >
                      View Details
                    </Link>
                    <button
                      onClick={() => handleDelete(pet.id)}
                      className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
