// Prisma Schema Indexes for Performance Optimization
// Add these to your schema.prisma file for better query performance

// User indexes
model User {
// ... existing fields

@@index([email]) // Fast email lookups for login
@@index([userType]) // Filter by user type
@@index([status]) // Filter by status
@@index([createdAt]) // Sort by registration date
}

// Pet indexes
model Pet {
// ... existing fields

@@index([ownerId]) // Fast owner pet lookups
@@index([species]) // Filter by species
@@index([createdAt]) // Sort by registration
@@index([ownerId, species]) // Composite for filtered owner pets
}

// Appointment indexes
model Appointment {
// ... existing fields

@@index([petId]) // Fast pet appointment lookups
@@index([veterinarianId]) // Fast vet appointment lookups
@@index([ownerId]) // Fast owner appointment lookups
@@index([status]) // Filter by status
@@index([scheduledAt]) // Sort by date
@@index([veterinarianId, scheduledAt]) // Vet schedule queries
@@index([status, scheduledAt]) // Upcoming appointments
@@index([createdAt]) // Recent appointments
}

// Payment indexes
model Payment {
// ... existing fields

@@index([appointmentId]) // Fast appointment payment lookup
@@index([status]) // Filter by payment status
@@index([transactionId]) // Unique transaction lookup
@@index([createdAt]) // Recent payments
@@index([status, createdAt]) // Pending/completed with date
}

// Review indexes
model Review {
// ... existing fields

@@index([veterinarianId]) // Vet reviews
@@index([petOwnerId]) // Owner reviews
@@index([rating]) // Filter by rating
@@index([createdAt]) // Recent reviews
@@index([veterinarianId, rating]) // Vet reviews by rating
}

// MedicalRecord indexes
model MedicalRecord {
// ... existing fields

@@index([petId]) // Pet medical history
@@index([appointmentId]) // Appointment records
@@index([createdAt]) // Recent records
@@index([petId, createdAt]) // Pet history sorted
}

// Vaccination indexes
model Vaccination {
// ... existing fields

@@index([petId]) // Pet vaccinations
@@index([vetId]) // Vet administered vaccines
@@index([nextDueDate]) // Upcoming due dates
@@index([petId, nextDueDate]) // Pet upcoming vaccines
}

// Prescription indexes
model Prescription {
// ... existing fields

@@index([petId]) // Pet prescriptions
@@index([veterinarianId]) // Vet prescribed
@@index([createdAt]) // Recent prescriptions
}

// Veterinarian indexes
model Veterinarian {
// ... existing fields

@@index([userId]) // Fast user lookup
@@index([licenseNumber]) // Unique license lookup
@@index([verificationStatus]) // Filter verified vets
@@index([averageRating]) // Sort by rating
}

// Clinic indexes
model Clinic {
// ... existing fields

@@index([city]) // Location-based search
@@index([isActive]) // Active clinics
@@index([createdAt]) // Recent clinics
}
