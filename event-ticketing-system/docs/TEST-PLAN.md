# Test plan

| ID | Test | Expected result |
|---|---|---|
| T01 | Load homepage with database configured | Scheduled events appear |
| T02 | Sign in with correct demo customer credentials | Customer session created |
| T03 | Sign in with invalid password | Login rejected |
| T04 | Open bookings while signed out | Sign-in prompt appears |
| T05 | Customer selects available seats and payment succeeds | Booking becomes CONFIRMED, payment SUCCESS, seats BOOKED |
| T06 | Customer selects available seats and payment fails | Booking FAILED, payment FAILED, seats returned to AVAILABLE |
| T07 | Two sessions attempt the same event-seat | One succeeds; the other receives an unavailable-seat error |
| T08 | Customer calls admin event API | Request rejected with 403 |
| T09 | Admin creates event in an occupied time slot at same venue | Request rejected |
| T10 | Admin creates event with valid time and prices | Event, ticket types and event-seat rows created |
| T11 | Admin views report | Confirmed booking and sales totals displayed |
| T12 | MongoDB unavailable | Event browsing still works; Mongo search reports optional service unavailable |
| T13 | Duplicate seat position within one venue | Unique constraint rejects duplicate |
| T14 | End time earlier than or equal to start time | Validation/constraint rejects event |

## Manual test evidence to capture

- Homepage with seed events
- Seat selection screen
- Successful simulated payment
- Failed simulated payment and released seat
- Customer booking history
- Admin dashboard and sales report
- MongoDB metadata search
- MySQL Workbench showing tables and representative query results
