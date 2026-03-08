# VetCare Sri Lanka - Implementation & Fix Plan

This plan outlines the steps to resolve identified bugs, bridge feature gaps, and improve system stability.

## Phase 1: Critical Fixes (Immediate)
- [ ] **Fix `AppointmentsService` Syntax Error**: Resolve missing brace and nesting issues.
- [ ] **Fix `AppointmentsService` Schema Mismatches**: Update queries to use `scheduledAt` instead of non-existent fields.
- [ ] **Fix `AdminService` Schema Mismatches**: Update queries to use `userType` and `status` instead of `role` and `isSuspended`.
- [ ] **Standardize Types**: Move core DTOs/Interfaces to `packages/types`.

## Phase 2: Booking System & Availability
- [ ] **Robust Availability Logic**: Implement a checker that respects `AvailabilitySlot` and existing `Appointment` records.
- [ ] **Frontend Integration**: Update the booking page to call `check-availability` before submission.
- [ ] **Validation**: Add Zod validation for all appointment inputs.

## Phase 3: Telemedicine & Chat (Core Value)
- [ ] **Agora Integration**: Backend token service for video consultations.
- [ ] **Telemedicine UI**: Add a video consultation room to the frontend.
- [ ] **Chat System**: Implement Socket.io gateway for real-time messaging during consultations.

## Phase 4: Reliability & DX
- [ ] **Automated Testing**: Add unit tests for `AuthService` and `AppointmentsService`.
- [ ] **API Documentation**: Setup Swagger/OpenAPI.
- [ ] **Notifications**: Implement Cron jobs for automated reminders.

---

## Progress Tracking
- **Phase 1**: 0%
- **Phase 2**: 0%
- **Phase 3**: 0%
- **Phase 4**: 0%
