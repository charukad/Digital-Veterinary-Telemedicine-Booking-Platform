# VetCare Sri Lanka - Bugs & Inconsistencies Report

This document lists critical bugs and technical inconsistencies found in the codebase.

## 🔴 Critical Bugs

### 1. Syntax Error in `AppointmentsService`
- **File:** `apps/api/src/modules/appointments/appointments.service.ts`
- **Description:** The `checkAvailability` method is missing a closing brace `}`, causing the `reschedule` method to be nested inside it. This breaks both methods and prevents the application from compiling/running correctly if these methods are called.
- **Reference:** Lines 380-400.

### 2. Invalid Database Field References
- **File:** `apps/api/src/modules/appointments/appointments.service.ts`
- **Description:** The `checkAvailability` method queries Prisma using `appointmentDate` and `appointmentTime`.
- **Finding:** These fields **do not exist** in the `Appointment` model in `schema.prisma`. The schema uses `scheduledAt` (DateTime).
- **Impact:** Any call to `check-availability` will crash the API with a Prisma validation error.

### 3. Schema Mismatch in `AdminService`
- **File:** `apps/api/src/modules/admin/admin.service.ts`
- **Description:** The service tries to access `user.role` and `user.isSuspended`.
- **Finding:** The `User` model in `schema.prisma` uses `userType` and `status` (Enum) instead.
- **Impact:** Admin dashboard user management features are completely broken.

---

## 🟡 Technical Inconsistencies

### 1. Inconsistent Date/Time Handling
- The `create` appointment method uses a single `scheduledAt` ISO string.
- The `checkAvailability` and `reschedule` methods try to use split `date` and `startTime` logic.
- **Recommendation:** Standardize on `scheduledAt` (DateTime) across all layers.

### 2. Missing Error Handling in Webhooks
- **File:** `payments.service.ts`
- **Description:** While signature verification exists, there is no idempotency check for webhooks. If PayHere sends the same notification twice, it might trigger multiple receipt emails or state transitions.

### 3. Duplicate Logic
- Conflict detection logic is duplicated (and slightly different) between `AppointmentsService.create` and `AppointmentsService.checkAvailability`.
