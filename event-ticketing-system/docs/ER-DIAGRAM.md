# ER diagram notes

The Mermaid ER diagram is in the project README and can be maintained in this file as the schema evolves.

## Main relationships

- Users 1-to-many Bookings.
- Venues 1-to-many Seats.
- Venues 1-to-many Events over time.
- Events 1-to-many Ticket_Types.
- Events and physical Seats are linked through Event_Seats.
- Ticket_Types categorizes each Event_Seats row.
- Bookings 1-to-many Booking_Seats.
- Event_Seats can be referenced by booking history rows.
- Bookings 1-to-many Payments, allowing failed and retried simulated attempts.

## Key integrity rule

`Event_Seats` has primary key `(event_id, seat_id)`. A physical seat can be used at multiple events, but only one allocation exists for a seat within a particular event. Booking is done in a MySQL transaction with row locks and an availability recheck.
