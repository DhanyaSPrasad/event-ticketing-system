USE event_ticketing;
DELIMITER //

-- Demonstration stored procedure: return ticket categories for one event.
DROP PROCEDURE IF EXISTS GetEventTicketTypes//
CREATE PROCEDURE GetEventTicketTypes(IN p_event_id INT)
BEGIN
    SELECT ticket_type_id, type_name, price
    FROM Ticket_Types
    WHERE event_id = p_event_id
    ORDER BY price;
END//

DELIMITER ;

-- Example:
-- CALL GetEventTicketTypes(101);


-- Stored function: Count available seats for an event.
DROP FUNCTION IF EXISTS fn_available_seats;

DELIMITER //

CREATE FUNCTION fn_available_seats(p_event_id INT)
RETURNS INT
READS SQL DATA
BEGIN
    DECLARE v_available_count INT;

    SELECT COUNT(*)
    INTO v_available_count
    FROM Event_Seats
    WHERE event_id = p_event_id
      AND status = 'AVAILABLE';

    RETURN v_available_count;
END//

DELIMITER ;

-- Example:
-- SELECT fn_available_seats(101);


-- Audit table for booking status changes.
CREATE TABLE IF NOT EXISTS Booking_Status_Audit (
    audit_id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL,
    old_status VARCHAR(20) NOT NULL,
    new_status VARCHAR(20) NOT NULL,
    changed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Trigger: Record every booking status change.
DROP TRIGGER IF EXISTS trg_booking_status_audit;

DELIMITER //

CREATE TRIGGER trg_booking_status_audit
AFTER UPDATE ON Bookings
FOR EACH ROW
BEGIN
    IF OLD.status <> NEW.status THEN
        INSERT INTO Booking_Status_Audit
            (booking_id, old_status, new_status)
        VALUES
            (OLD.booking_id, OLD.status, NEW.status);
    END IF;
END//

DELIMITER ;

