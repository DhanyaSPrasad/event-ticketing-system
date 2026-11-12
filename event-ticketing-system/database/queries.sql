USE event_ticketing;

-- 1. Browse scheduled events with venue details.
SELECT e.event_id, e.title, v.name AS venue_name, v.location,
       e.start_time, e.end_time
FROM Events e
JOIN Venues v ON e.venue_id = v.venue_id
WHERE e.status = 'Scheduled'
ORDER BY e.start_time;

-- 2. Show available seats and their ticket category/price.
SELECT es.event_id, s.row_label, s.seat_number,
       tt.type_name, tt.price
FROM Event_Seats es
JOIN Seats s ON es.seat_id = s.seat_id
JOIN Ticket_Types tt
  ON es.event_id = tt.event_id
 AND es.ticket_type_id = tt.ticket_type_id
WHERE es.event_id = 101 AND es.status = 'AVAILABLE'
ORDER BY s.row_label, s.seat_number;

-- 3. Customer booking history.
SELECT b.booking_id, e.title, b.booking_time,
       b.status, b.total_amount
FROM Bookings b
JOIN Events e ON b.event_id = e.event_id
WHERE b.user_id = 2
ORDER BY b.booking_time DESC;

-- 4. Sales summary per event.
SELECT e.event_id, e.title,
       COUNT(DISTINCT CASE WHEN b.status = 'CONFIRMED' THEN b.booking_id END) AS confirmed_bookings,
       COALESCE(SUM(CASE WHEN b.status = 'CONFIRMED' THEN b.total_amount ELSE 0 END), 0) AS total_sales
FROM Events e
LEFT JOIN Bookings b ON e.event_id = b.event_id
GROUP BY e.event_id, e.title
ORDER BY total_sales DESC;

-- 5. Occupancy report per event.
SELECT e.event_id, e.title,
       COUNT(es.seat_id) AS total_seats,
       SUM(es.status = 'BOOKED') AS booked_seats,
       ROUND(100 * SUM(es.status = 'BOOKED') / NULLIF(COUNT(es.seat_id), 0), 2) AS occupancy_percent
FROM Events e
LEFT JOIN Event_Seats es ON e.event_id = es.event_id
GROUP BY e.event_id, e.title;

-- 6. Ticket types priced above the event's average ticket price (subquery).
SELECT tt.event_id, tt.type_name, tt.price
FROM Ticket_Types tt
WHERE tt.price > (
    SELECT AVG(tt2.price)
    FROM Ticket_Types tt2
    WHERE tt2.event_id = tt.event_id
);

-- 7. Events with no confirmed bookings (LEFT JOIN / NULL).
SELECT e.event_id, e.title
FROM Events e
LEFT JOIN Bookings b
  ON e.event_id = b.event_id AND b.status = 'CONFIRMED'
WHERE b.booking_id IS NULL;

-- 8. Payment outcome summary.
SELECT status, COUNT(*) AS payment_count, SUM(amount) AS total_amount
FROM Payments
GROUP BY status;

-- 9. Admin: list each event and its ticket types.
SELECT e.title, tt.type_name, tt.price
FROM Events e
JOIN Ticket_Types tt ON e.event_id = tt.event_id
ORDER BY e.title, tt.price;



-- 10. CTE: Event-wise confirmed booking and revenue summary.
WITH EventSales AS (
    SELECT
        e.event_id,
        e.title,
        COUNT(b.booking_id) AS confirmed_bookings,
        COALESCE(SUM(b.total_amount), 0) AS total_revenue
    FROM Events e
    LEFT JOIN Bookings b
        ON e.event_id = b.event_id
        AND b.status = 'CONFIRMED'
    GROUP BY e.event_id, e.title
)
SELECT *
FROM EventSales
ORDER BY total_revenue DESC;



-- 11. Window function: Rank events by confirmed revenue.
WITH EventSales AS (
    SELECT
        e.event_id,
        e.title,
        COALESCE(
            SUM(
                CASE
                    WHEN b.status = 'CONFIRMED'
                    THEN b.total_amount
                    ELSE 0
                END
            ), 0
        ) AS total_revenue
    FROM Events e
    LEFT JOIN Bookings b
        ON e.event_id = b.event_id
    GROUP BY e.event_id, e.title
)
SELECT
    event_id,
    title,
    total_revenue,
    RANK() OVER (ORDER BY total_revenue DESC) AS revenue_rank
FROM EventSales;

