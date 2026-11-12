
USE event_ticketing;

-- Demo users are created separately using npm run seed:users

INSERT INTO Venues (venue_id, name, location, capacity) VALUES
(1, 'PESU Auditorium', 'Bengaluru', 20),
(2, 'City Open Arena', 'Bengaluru', 12)
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- Create seats for venue 1
INSERT INTO Seats (venue_id, row_label, seat_number)
SELECT v.venue_id, r.row_label, n.seat_number
FROM Venues AS v
CROSS JOIN (
    SELECT 'A' AS row_label
    UNION ALL SELECT 'B'
    UNION ALL SELECT 'C'
    UNION ALL SELECT 'D'
) AS r
CROSS JOIN (
    SELECT 1 AS seat_number
    UNION ALL SELECT 2
    UNION ALL SELECT 3
    UNION ALL SELECT 4
    UNION ALL SELECT 5
) AS n
WHERE v.venue_id = 1
ON DUPLICATE KEY UPDATE seat_number = VALUES(seat_number);

-- Create seats for venue 2
INSERT INTO Seats (venue_id, row_label, seat_number)
SELECT 2, r.row_label, n.seat_number
FROM (
    SELECT 'A' AS row_label
    UNION ALL SELECT 'B'
    UNION ALL SELECT 'C'
) AS r
CROSS JOIN (
    SELECT 1 AS seat_number
    UNION ALL SELECT 2
    UNION ALL SELECT 3
    UNION ALL SELECT 4
) AS n
WHERE TRUE
ON DUPLICATE KEY UPDATE seat_number = VALUES(seat_number);

-- Create events
INSERT INTO Events
(event_id, venue_id, title, description, start_time, end_time, status)
VALUES
(101, 1, 'Live Music Night',
 'A live music event for the demo project.',
 DATE_ADD(NOW(), INTERVAL 7 DAY),
 DATE_ADD(NOW(), INTERVAL 7 DAY) + INTERVAL 3 HOUR,
 'Scheduled'),
(102, 2, 'Technology Meetup',
 'A student technology meetup and networking event.',
 DATE_ADD(NOW(), INTERVAL 10 DAY),
 DATE_ADD(NOW(), INTERVAL 10 DAY) + INTERVAL 2 HOUR,
 'Scheduled')
ON DUPLICATE KEY UPDATE
    title = VALUES(title),
    description = VALUES(description);

-- Create ticket types
INSERT INTO Ticket_Types (event_id, type_name, price) VALUES
(101, 'Regular', 500.00),
(101, 'Premium', 1000.00),
(102, 'General', 150.00),
(102, 'VIP', 300.00)
ON DUPLICATE KEY UPDATE price = VALUES(price);

-- Allocate seats to event 101
INSERT INTO Event_Seats
(event_id, venue_id, seat_id, ticket_type_id, status)
SELECT
    101,
    s.venue_id,
    s.seat_id,
    CASE
        WHEN s.row_label IN ('A', 'B') THEN (
            SELECT ticket_type_id
            FROM Ticket_Types
            WHERE event_id = 101 AND type_name = 'Premium'
        )
        ELSE (
            SELECT ticket_type_id
            FROM Ticket_Types
            WHERE event_id = 101 AND type_name = 'Regular'
        )
    END,
    'AVAILABLE'
FROM Seats AS s
WHERE s.venue_id = 1
ON DUPLICATE KEY UPDATE
    ticket_type_id = VALUES(ticket_type_id);

-- Allocate seats to event 102
INSERT INTO Event_Seats
(event_id, venue_id, seat_id, ticket_type_id, status)
SELECT
    102,
    s.venue_id,
    s.seat_id,
    (
        SELECT ticket_type_id
        FROM Ticket_Types
        WHERE event_id = 102 AND type_name = 'General'
    ),
    'AVAILABLE'
FROM Seats AS s
WHERE s.venue_id = 2
ON DUPLICATE KEY UPDATE
    ticket_type_id = VALUES(ticket_type_id);
