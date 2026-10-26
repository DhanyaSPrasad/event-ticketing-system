# Scope

## Included

- Customer/Admin role-based access
- Event listing and details
- Venue, seat and event-seat allocation
- Event-specific ticket types and prices
- Transaction-safe seat booking
- Simulated payment success/failure
- Booking history
- Admin event creation and sales/occupancy summary
- MongoDB metadata search
- SQL constraints, joins, aggregates, subquery, index and stored procedure example

## Excluded from this academic MVP

- Real payment gateway, UPI or card processing
- Email/SMS delivery
- Seat hold timeout and background jobs
- Password reset and registration UI
- Complex venue layouts and interactive seat maps
- Refund processing through a real provider
- Vector embeddings/recommendation pipeline

## Known limitations

- Demo accounts are seeded for local assessment.
- Venue schedule conflict checks are implemented in the create-event route but a production application would need stronger concurrency control for simultaneous schedule changes.
- The app is a starting MVP and must be run/tested in the team's local environment before being presented as complete.
