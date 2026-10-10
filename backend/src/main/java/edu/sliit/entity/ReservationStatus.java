package edu.sliit.entity;

public enum ReservationStatus {
    PENDING,      // Initial state - waiting for hotel manager approval
    APPROVED,     // Hotel manager approved the reservation
    REJECTED,     // Hotel manager rejected the reservation
    COMPLETED,    // Event completed successfully
    CANCELLED     // Customer cancelled or system cancelled
}
