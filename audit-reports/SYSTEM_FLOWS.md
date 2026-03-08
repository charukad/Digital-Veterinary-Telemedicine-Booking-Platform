# VetCare Sri Lanka - System Flows Audit

This document describes the current state of major user journeys and identifies friction points.

## 1. Authentication & Onboarding
1. **Registration:** User signs up -> User record created in `PENDING_VERIFICATION` status -> Profile (PetOwner/Vet) created -> OTP sent to email.
2. **Verification:** User enters 6-digit OTP -> Status changes to `ACTIVE`.
3. **Login:** Standard JWT-based login with Refresh Token rotation.
   - **Audit Note:** The flow is solid, but the frontend lacks a "Resend OTP" UI in some places.

## 2. Pet Management Flow
1. **Creation:** Pet Owner adds pet details (Species, Breed, Health info).
2. **Management:** CRUD operations are fully functional.
   - **Audit Note:** Missing "Transfer Pet" functionality (e.g., if a pet is sold or adopted).

## 3. Appointment Booking Flow
1. **Search:** User filters vets by city/specialization.
2. **Booking:** User selects Pet, Date, and Time.
3. **Conflict Check:** Backend checks if the vet has an overlapping appointment.
   - **Friction Point:** The frontend does *not* call the `check-availability` endpoint before submission. This leads to a poor UX where the user only finds out a slot is taken *after* clicking "Book".
   - **Friction Point:** The `check-availability` endpoint is currently broken (syntax error).

## 4. Payment Flow
1. **Initiation:** After booking, user is prompted to pay.
2. **Gateway:** Redirects to PayHere.
3. **Webhook:** PayHere notifies the backend -> Appointment status changes to `CONFIRMED` -> Receipt email sent.
   - **Audit Note:** Wallet system is defined in schema but logic is 0% implemented in `payments.service.ts`.

## 5. Veterinarian Workflow
1. **Profile Setup:** Vet fills qualifications and fees.
2. **Verification:** Admin must manually verify the vet in the dashboard.
3. **Management:** Vet can see appointments and update status (Confirm -> Start -> Complete).
   - **Friction Point:** No "Emergency Toggle" for vets to show they are currently available for immediate consultations.
