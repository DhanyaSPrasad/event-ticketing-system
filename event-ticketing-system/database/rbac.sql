USE event_ticketing;

-- Run as a MySQL administrator. Replace the sample passwords before execution.
CREATE ROLE IF NOT EXISTS 'ets_admin_role';
CREATE ROLE IF NOT EXISTS 'ets_customer_role';
CREATE ROLE IF NOT EXISTS 'ets_auth_role';

-- Admin: event setup and operational reports.
GRANT SELECT ON event_ticketing.Venues TO 'ets_admin_role';
GRANT SELECT ON event_ticketing.Seats TO 'ets_admin_role';
GRANT SELECT, INSERT, UPDATE, DELETE ON event_ticketing.Events TO 'ets_admin_role';
GRANT SELECT, INSERT, UPDATE, DELETE ON event_ticketing.Ticket_Types TO 'ets_admin_role';
GRANT SELECT, INSERT, UPDATE, DELETE ON event_ticketing.Event_Seats TO 'ets_admin_role';
GRANT SELECT ON event_ticketing.Bookings TO 'ets_admin_role';
GRANT SELECT ON event_ticketing.Booking_Seats TO 'ets_admin_role';
GRANT SELECT ON event_ticketing.Payments TO 'ets_admin_role';

-- Customer: browse events and perform booking transaction operations.
GRANT SELECT ON event_ticketing.Events TO 'ets_customer_role';
GRANT SELECT ON event_ticketing.Venues TO 'ets_customer_role';
GRANT SELECT ON event_ticketing.Seats TO 'ets_customer_role';
GRANT SELECT ON event_ticketing.Ticket_Types TO 'ets_customer_role';
GRANT SELECT ON event_ticketing.Event_Seats TO 'ets_customer_role';
GRANT SELECT ON event_ticketing.Bookings TO 'ets_customer_role';
GRANT SELECT ON event_ticketing.Booking_Seats TO 'ets_customer_role';
GRANT SELECT ON event_ticketing.Payments TO 'ets_customer_role';
GRANT INSERT ON event_ticketing.Bookings TO 'ets_customer_role';
GRANT INSERT ON event_ticketing.Booking_Seats TO 'ets_customer_role';
GRANT INSERT ON event_ticketing.Payments TO 'ets_customer_role';
GRANT UPDATE (status) ON event_ticketing.Bookings TO 'ets_customer_role';
GRANT UPDATE (status) ON event_ticketing.Booking_Seats TO 'ets_customer_role';
GRANT UPDATE (status) ON event_ticketing.Event_Seats TO 'ets_customer_role';

-- Authentication can read only the fields needed to validate a login.
GRANT SELECT (user_id, name, email, password_hash, role)
ON event_ticketing.Users TO 'ets_auth_role';

-- Dedicated application accounts. Replace these sample passwords.
CREATE USER IF NOT EXISTS 'ets_admin'@'localhost' IDENTIFIED BY 'CHANGE_ME_ADMIN_PASSWORD';
CREATE USER IF NOT EXISTS 'ets_customer'@'localhost' IDENTIFIED BY 'CHANGE_ME_CUSTOMER_PASSWORD';
CREATE USER IF NOT EXISTS 'ets_auth'@'localhost' IDENTIFIED BY 'CHANGE_ME_AUTH_PASSWORD';

GRANT 'ets_admin_role' TO 'ets_admin'@'localhost';
GRANT 'ets_customer_role' TO 'ets_customer'@'localhost';
GRANT 'ets_auth_role' TO 'ets_auth'@'localhost';

SET DEFAULT ROLE 'ets_admin_role' TO 'ets_admin'@'localhost';
SET DEFAULT ROLE 'ets_customer_role' TO 'ets_customer'@'localhost';
SET DEFAULT ROLE 'ets_auth_role' TO 'ets_auth'@'localhost';

SHOW GRANTS FOR 'ets_admin'@'localhost';
SHOW GRANTS FOR 'ets_customer'@'localhost';
SHOW GRANTS FOR 'ets_auth'@'localhost';

-- MySQL grants are table/column-level, not row-level. Application ownership
-- checks remain necessary for customer booking history and booking actions.
