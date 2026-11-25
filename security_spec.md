# Security Specification — Bloom & Botanica Firestore Rules

## 1. Data Invariants
1. Every document in `/users/{userId}` and `/users/{userId}/private/{docId}` belongs strictly to `request.auth.uid == userId`, with verified email (`request.auth.token.email_verified == true`) required for writes.
2. Users cannot self-assign elevated roles (`role == 'florist'` only; no client-writable `admin` flags). Admin overrides resolve exclusively via `/admins/$(request.auth.uid)` or verified runtime email `tryzic00@gmail.com`.
3. Every `/studios/{studioId}/leads/{leadId}` and `/studios/{studioId}/orders/{orderId}` validates parent studio ownership via `get(/databases/$(database)/documents/studios/$(studioId)).data.ownerId == request.auth.uid` (Master Gate), enforces `ownerId == request.auth.uid`, and forbids list scraping unless `resource.data.ownerId == request.auth.uid`.
4. All document IDs (`userId`, `studioId`, `leadId`, `orderId`, `configId`, `proposalId`) must pass `isValidId()` (`^[a-zA-Z0-9_\-]+$`, `<= 128` chars) on single-doc operations (`get`, `create`, `update`, `delete`).
5. All `createdAt` and `updatedAt` timestamps must equal `request.time`; `createdAt` and `ownerId` are immutable on updates.
6. PII (`email`, `phone`, `deliveryAddress`) is strictly confined to `/users/{userId}/private/*`, `/studios/{studioId}/leads/*`, `/studios/{studioId}/orders/*`, and write-only intake queues `/publicLeads/*`, `/publicOrders/*`, none of which allow blanket signed-in or unauthenticated reads.
7. `/publicConfig/{configId}` stores zero PII and permits public `get` only on `published_calculator` while restricting writes to verified studio owners / admins.
8. `/publicLeads/{leadId}` and `/publicOrders/{orderId}` allow schema-validated public `create` (status `estimate`/`lead` with zero deposit and `request.time` timestamp) while forbidding `update` and restricting `get`, `list`, and `delete` strictly to the verified admin (`tryzic00@gmail.com`).
9. `/publicProposals/{proposalId}` excludes all PII (`email`, `phone`, `deliveryAddress`), forbids `list`, allows `get` only by exact ID, and restricts public `update` strictly to single-use e-signature transition (`contract-signed`) before terminal `booked`/`contract-signed` lock.

## 2. The "Dirty Dozen+" Adversarial Payloads
1. **Unauthenticated Lead Read**: Anonymous `get` on `/studios/studio1/leads/lead1` -> `PERMISSION_DENIED`.
2. **Cross-Tenant Lead Read**: User B attempts `get` on `/studios/userA/leads/lead1` -> `PERMISSION_DENIED`.
3. **Shadow Field Injection on Lead Create**: User A sends `isVerified: true` extra field on `/studios/userA/leads/leadShadow` -> `PERMISSION_DENIED` (`hasOnly` rejects ghost key).
4. **Role Escalation on User Profile**: User A creates `/users/userA` with `role: 'admin'` -> `PERMISSION_DENIED`.
5. **Identity Spoofing on Studio Create**: User B creates `/studios/studioB` with `ownerId: 'userA'` -> `PERMISSION_DENIED`.
6. **ID Poisoning**: Creating `/studios/../../etc/passwd` or 500-char ID -> `PERMISSION_DENIED` (`isValidId` rejects).
7. **Unverified Email Write**: Authenticated user with `email_verified: false` creates `/studios/userA` -> `PERMISSION_DENIED`.
8. **Timestamp Forgery**: User A creates lead with backdated `createdAt` (`!= request.time`) -> `PERMISSION_DENIED`.
9. **Immutable Owner Mutation**: User A updates lead attempting to change `ownerId` or `createdAt` -> `PERMISSION_DENIED`.
10. **PII Leak via Blanket List**: User B runs collection list on `/studios/userA/orders` or `/publicLeads` -> `PERMISSION_DENIED`.
11. **Terminal State Bypass on Booked Lead / Signed Proposal**: Non-admin user attempts to downgrade a `booked` lead or overwrite a signed `/publicProposals/{id}` -> `PERMISSION_DENIED`.
12. **Public Config Hijack**: User B overwrites `publicConfig/published_calculator` owned by User A without admin privilege -> `PERMISSION_DENIED`.
