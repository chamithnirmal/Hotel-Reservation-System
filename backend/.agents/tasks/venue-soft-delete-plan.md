# Implementation Plan: Venue Soft Delete

## Problem Statement
When a hotel manager attempts to delete a venue that has associated event packages, the operation fails with a foreign key constraint violation:
```
Cannot delete or update a parent row: a foreign key constraint fails `hotel_reservation_db`.`event_packages`, 
CONSTRAINT `FKk6vdvgnf5dt3lj0kj8vtb5drd` FOREIGN KEY (`venue_id`) REFERENCES `venues` (`id`)
```

This occurs because `event_packages` table has a foreign key reference to `venues.id`, and hard deletes violate referential integrity. The solution is to implement soft delete (logical deletion via `isActive` flag) for both venues and associated event packages.

## Design Decisions

1. **Soft Delete Strategy**: Instead of hard deletion, set `isActive = false` on venues and cascade to event packages. Both `Venue` and `EventPackage` entities already have `isActive` fields (verified in code).

2. **Cascade Behavior**: When deleting a venue, all associated event packages are also marked inactive. This preserves data integrity and maintains audit trail.

3. **Query Filtering**: Update all query methods to filter active records only (where `isActive = true`), except for methods that explicitly retrieve inactive records.

4. **Frontend Warning**: Add a confirmation modal warning users that deleting a venue will also deactivate all its event packages.

5. **Repository Layer**: Use existing repository methods `findByHotelAndIsActive()` and `findByVenueAndIsActive()` which are already defined but not used by service methods.

## Implementation Plan

- [ ] 1. Add `EventPackageRepository` injection to `VenueServiceImpl`
      Update the `@RequiredArgsConstructor` constructor to include `EventPackageRepository` as a dependency.
      Files: src/main/java/edu/sliit/service/impl/VenueServiceImpl.java
      Verify: Compilation succeeds with `mvn clean compile`

- [ ] 2. Add `findAllByIsActive(Boolean isActive)` query method to `VenueRepository`
      Add the missing repository method to support filtering all venues by active status.
      Files: src/main/java/edu/sliit/repository/VenueRepository.java
      Verify: Compilation succeeds with `mvn clean compile`

- [ ] 3. Update `VenueServiceImpl.deleteVenue()` to implement soft delete with cascade
      Replace `venueRepository.delete(venue)` with: set `venue.setIsActive(false)`, save venue, 
      find all event packages for the venue using `eventPackageRepository.findByVenue(venue)`, 
      iterate through results and set each to `isActive = false`, then save them all. 
      This ensures data consistency and referential integrity.
      Files: src/main/java/edu/sliit/service/impl/VenueServiceImpl.java
      Verify: Application builds with `mvn clean package -DskipTests` (skip tests during verification of soft delete logic only)

- [ ] 4. Update `VenueServiceImpl.getAllVenues()` to return only active venues
      Replace `venueRepository.findAll()` with `venueRepository.findAllByIsActive(true)`.
      Files: src/main/java/edu/sliit/service/impl/VenueServiceImpl.java
      Verify: Application builds with `mvn clean package -DskipTests`

- [ ] 5. Update `VenueServiceImpl.getVenuesByHotel()` to return only active venues for that hotel
      Replace `venueRepository.findByHotel(hotel)` with `venueRepository.findByHotelAndIsActive(hotel, true)`.
      Files: src/main/java/edu/sliit/service/impl/VenueServiceImpl.java
      Verify: Application builds with `mvn clean package -DskipTests`

- [ ] 6. Update frontend `handleDelete()` to show a confirmation modal instead of `window.confirm()`
      Replace the simple `window.confirm()` with an inline modal (using existing modal pattern from the file) 
      that warns users: "Deleting this venue will also deactivate all of its event packages. This action cannot be undone." 
      The modal should have "Cancel" and "Delete Venue" buttons. The delete button triggers the API call.
      Files: frontend/src/pages/manager/Venues.tsx
      Verify: Frontend compiles with `npm run build` from the frontend directory

- [ ] 7. Manual verification: Create a test scenario
      Start the application, create a hotel and a venue, create an event package for that venue, 
      attempt to delete the venue, verify the soft delete occurs, check database that both 
      venue and event package have `isActive = false`, verify the venue no longer appears in the manager UI.
      Files: N/A (manual testing)
      Verify: Venue and associated event packages are marked inactive (not deleted), UI reflects inactive state
