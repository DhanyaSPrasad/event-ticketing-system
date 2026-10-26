# Viva preparation notes

1. Why use MySQL? The booking and payment records need relational integrity and transactions.
2. Why use MongoDB? Event tags and descriptive metadata are flexible and useful for keyword discovery.
3. Why separate Seats and Event_Seats? A physical seat can be reused for events on different dates.
4. Why use a composite key on Event_Seats? To allow at most one allocation record per event-seat pair.
5. How is double booking prevented? The API starts a transaction, locks the selected Event_Seats rows with `FOR UPDATE`, checks that they are available, then changes status before committing.
6. What is a ticket type? An event-specific category and price, such as Regular or Premium.
7. Why preserve `ticket_price` in Booking_Seats? It records the amount at booking time.
8. What is simulated payment? The user chooses a success/failure outcome; no real financial transaction occurs.
9. What is a foreign key? A constraint requiring a referenced record to exist.
10. What is an index? A data structure that can speed up searches, joins or ordering at the cost of storage and write overhead.
11. What is a transaction? A set of operations committed together or rolled back together.
12. What are the roles? Customer books tickets and views their own history; Admin creates events and views reports.
13. Why not store password plaintext? A password hash is stored and compared using bcrypt.
14. What does MongoDB search return? Metadata matches; the event details and availability are then read from MySQL.
