# Venue Soft-Delete Implementation

This change converts venue deletion from a hard delete (which triggers foreign key constraint violations) to a soft delete by marking venues and their associated event packages as inactive. The fix resolves the `CONSTRAINT FKk6vdvgnf5dt3lj0kj8vtb5drd` error that prevented hotel managers from deleting venues that have linked event packages.

The implementation marks both the venue and all its event packages as inactive rather than removing rows from the database. Queries now filter to return only active venues, maintaining backward compatibility for the API surface. The frontend confirms the action with a proper modal warning of package deactivation.

Watch for: Build verification evidence is missing (the `.agents/tasks/venue-soft-delete-verify.md` file referenced in the task does not exist). Code analysis shows the implementation follows correct patterns, but automated test results cannot be verified.

**Verdict**: NEEDS_CHANGES

<details>
<summary>Issues (2)</summary>

1. **Build evidence missing** — The task required build verification at `.agents/tasks/venue-soft-delete-verify.md`, but this file does not exist. Build and test results must be recorded before approval.

2. **Potential data exposure through findById** — `getVenueById(id)` does not filter on `isActive`, allowing inactive venues to be retrieved if called directly. This may enable lookups of deactivated venues, though the impact depends on whether this endpoint is customer-facing.

</details>

<details>
<summary>Details</summary>

## Soft-delete implementation and cascade behavior

The `deleteVenue()` method correctly implements soft deletion by fetching all `EventPackage` records for the venue, marking each as inactive, then marking the venue itself inactive. This prevents the foreign key constraint violation that occurred when trying to hard-delete a parent row with dependent records. The log message documents both the venue ID and the count of packages deactivated, aiding debugging.

The cascade is manual rather than database-level, which is appropriate given that JPA `CascadeType.SOFT_DELETE` does not exist and would require database triggers or a domain-driven cascade pattern. The implementation is straightforward and auditable in logs.

## Query filtering and backward compatibility

`getAllVenues()` and `getVenuesByHotel()` both filter using `findAllByIsActive(true)` and `findByHotelAndIsActive(hotel, true)`, ensuring inactive venues are invisible to the public API. This maintains the intended user experience: deleted venues disappear from listings and venue selection flows.

`getVenueById(id)` does not filter on `isActive`. This creates an asymmetry: a manager or customer could theoretically call the single-venue endpoint and retrieve a deactivated venue if they know its ID. The impact is low if this endpoint is admin-only (confirmed in controller: `@PreAuthorize("hasRole('HOTEL_MANAGER') or hasRole('ADMIN')")`), but the inconsistency should be noted. If customer-facing APIs call this method without their own `isActive` checks, they could leak data about deleted venues.

## Repository queries

The `VenueRepository` has the required `findAllByIsActive(Boolean isActive)` and `findByHotelAndIsActive(Hotel hotel, Boolean isActive)` methods. Both are present and correctly used in the service layer.

## Frontend confirmation and UX

The delete modal clearly warns the manager: "This will also deactivate all event packages linked to this venue. This action cannot be undone." This is accurate for soft-delete semantics. The modal is a proper component, not `window.confirm()`, providing a professional UX and clear communication of the cascade effect.

The delete flow is straightforward: click the trash icon → modal opens → click "Delete venue" → `confirmDelete()` calls `venueService.deleteVenue()` → reload data. Error handling is present; failures display in the error banner.

## Test coverage gap

No test file was provided for review. The soft-delete logic should have unit test coverage for the cascade (verify that N packages are deactivated when a venue is deleted), integration tests ensuring the FK constraint no longer fires, and API tests confirming inactive venues are not returned by list endpoints. Without test evidence, correctness assumptions remain unvalidated.

## Missing database migration or schema verification

The `isActive` column exists in the `Venue` and `EventPackage` entities (both define `@Column(name = "is_active", nullable = false)` with `@Builder.Default private Boolean isActive = true`), but whether the database schema has been updated is not visible in this diff. If the column does not exist or has the wrong type, the soft delete will fail at runtime with a column-not-found exception. This reinforces the need for build/test evidence.

</details>

<details>
<summary>File map</summary>

- **VenueServiceImpl.java** — `deleteVenue()` now fetches all event packages for the venue, sets `isActive = false` on each, then marks the venue inactive. `getAllVenues()` and `getVenuesByHotel()` filter to return only active venues.
- **VenueRepository.java** — Added `findAllByIsActive(Boolean isActive)` and `findByHotelAndIsActive(Hotel hotel, Boolean isActive)` query methods.
- **Venues.tsx** — Added `showDeleteModal` state and `handleDelete()` / `confirmDelete()` flow with a modal component that warns about package deactivation. Delete button now opens the modal instead of hard-deleting.

Full diff: Compare VenueServiceImpl, VenueRepository, and Venues.tsx against main branch.

</details>
