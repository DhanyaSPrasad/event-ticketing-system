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
