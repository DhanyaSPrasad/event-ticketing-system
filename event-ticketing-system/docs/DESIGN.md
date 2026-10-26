# Database design and normalization

## Why MySQL?

The core data is structured and relational. Primary/foreign keys, constraints, joins and transactions help maintain booking integrity.

## Why MongoDB?

Event descriptions, tags, amenities and search keywords are flexible metadata. MongoDB is used for metadata discovery only. MySQL remains authoritative for price, schedules, seats, bookings and payments.

## Normalization notes

- Users, Venues, Seats, Events, Ticket_Types, Bookings and Payments have separate relations to avoid repeating their details.
- Seat position is unique within a venue.
- Ticket type names are unique within an event.
- Event-seat allocation is modeled separately because a physical seat can be allocated for many events.
- Booking_Seats stores the ticket price at purchase time, preserving the historical amount if an admin later edits a ticket type price.
- Booking total is stored as a snapshot for receipt/reporting; application code calculates it from the selected ticket prices during booking.

Review functional dependencies and explain 1NF, 2NF and 3NF against the final schema in the project report. Do not claim that a schema is normalized without checking the relevant dependencies.
