# VetCare Sri Lanka - Areas for Improvement

Strategic recommendations to improve the platform's quality, performance, and user experience.

## 1. Code Quality & DX
- **Type Sharing:** Move all DTOs and Response interfaces to `packages/types` to avoid duplication and ensure the frontend stays in sync with backend changes.
- **Validation:** Move Zod schemas to `packages/validations` so they can be reused for both backend DTO validation (via `nestjs-zod`) and frontend form validation.
- **API Documentation:** Integrate `@nestjs/swagger` to automatically generate OpenAPI documentation.

## 2. User Experience (UX)
- **Real-time Availability:** Integrate the (fixed) `check-availability` endpoint into the frontend booking calendar. Disable time slots that are already booked or outside vet working hours.
- **Loading States:** Use "Skeleton Screens" instead of simple spinners for a smoother loading experience.
- **Toasts:** Replace browser `alert()` calls with a proper toast notification library (like `sonner` or `react-hot-toast`).

## 3. Feature Enhancements
- **Automated Reminders:** Implement a Cron job (using `@nestjs/schedule`) to send Email/SMS reminders 24 hours and 1 hour before appointments.
- **Vaccination Reminders:** Automatically calculate the "Next Due Date" for vaccinations based on the vaccine type and send reminders.
- **Telemedicine Integration:** Implement Agora.io for video calls. Add a "Join Room" button that only appears 5 minutes before the scheduled time.

## 4. Architecture & Scalability
- **Image Optimization:** Implement a dedicated image processing service (using `sharp`) or use a service like Cloudinary to handle different sizes and formats (WebP).
- **Caching:** Use Redis to cache frequent but slowly changing data, such as the Veterinarian list and search results.
- **Database Indexing:** Ensure indices are added for common query fields like `scheduledAt`, `veterinarianId`, and `ownerId`. (Some indices are already present, but a full review is needed).
