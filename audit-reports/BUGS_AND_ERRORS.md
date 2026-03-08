# VetCare Sri Lanka - Bugs & Inconsistencies Report

This document lists technical inconsistencies found in the codebase.

## 🟡 Technical Inconsistencies (Remaining)

### 1. Missing Error Handling in Webhooks
- **File:** `apps/api/src/modules/payments/payments.service.ts`
- **Description:** While signature verification exists, there is no idempotency check for webhooks. If PayHere sends the same notification twice, it might trigger multiple receipt emails or state transitions.

### 2. Duplicate Logic
- Conflict detection logic is duplicated (and slightly different) between `AppointmentsService.create` and `AppointmentsService.checkAvailability`.
- **Recommendation:** Consolidate conflict detection into a single private method or a dedicated utility.
