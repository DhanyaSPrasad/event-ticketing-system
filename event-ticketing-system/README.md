# Event Ticketing, Seat Allocation & Venue Management System

A small academic DBMS project using **Next.js + React**, **MySQL**, and **MongoDB**. The interface is intentionally simple so the database design and queries remain the focus.

## Features

- Customer and Admin roles
- Event listing and event details
- Venue and physical-seat model
- Event-specific seat allocation and ticket categories
- Booking with MySQL transaction and row locking
- Simulated payment success/failure (no real money or payment gateway)
- Customer booking history
- Admin event creation and basic sales report
- MongoDB event metadata search (optional; the site still works if MongoDB is not configured)
- SQL schema, sample data, report queries and stored procedure

## Requirements

- Node.js 20 or newer
- MySQL 8.0+
- MongoDB 6+ (optional)
- npm

## 1. Set up MySQL

Create the schema and seed data in MySQL Workbench, in this order:

1. `database/schema.sql`
2. `database/seed.sql`
3. `database/routines.sql` (optional stored procedure demo)
4. After `npm install` and configuring `.env.local`, run `npm run seed:users` to create demo accounts with real bcrypt hashes.

The seed creates:
- Admin: `admin@example.com` / `Demo123!`
- Customer: `customer@example.com` / `Demo123!`

These are **demo credentials only**. Change them before any non-demo deployment.

## 2. Configure environment

Copy `.env.example` to `.env.local` and update the MySQL credentials. Set `AUTH_SECRET` to a long random string.

```bash
npm install
npm run dev
```

Open http://localhost:3000.

MongoDB is optional. If available, start it and run `database/mongo-seed.js` using `mongosh` after selecting the project database, or use the script instructions in that file.

## 3. Demo workflow

1. Sign in as the customer.
2. Browse events and select an event.
3. Select one or more available seats.
4. Choose simulated payment success or failure and submit.
5. View booking history.
6. Sign in as admin to create an event and view sales totals.

## Important project notes

- A payment outcome is simulated by the application; there is no UPI, card, bank transfer, or external payment gateway.
- Booking code locks selected `Event_Seats` rows inside a transaction and checks availability again before writing. This prevents concurrent requests from booking the same event-seat twice.
- Venue overlap validation is done in the event-creation API. For a production system, scheduling operations should also be serialized/locked to protect against simultaneous conflicting event creation.
- Passwords are stored as bcrypt hashes, never as plaintext.
- This is an academic MVP, not a production ticketing system. Add rate limiting, robust account recovery, stronger audit logging, and production deployment controls before public use.
- Keep `.env.local` private. Never commit secrets or real credentials.
- SQL syntax targets MySQL 8.0. Some SQL constraints, including `CHECK`, require a modern MySQL version.

## Repository layout

```text
app/                    Next.js pages and API routes
components/             Small reusable UI components
lib/                    MySQL, MongoDB, authentication helpers
database/schema.sql     DDL and constraints
database/seed.sql       Demo records
database/queries.sql    Example syllabus-aligned queries
database/routines.sql   Stored procedure example
database/mongo-seed.js  Optional MongoDB metadata seed
docs/                   Design, testing, and viva notes
```

## Suggested team workflow

Agree on schema and API shapes before splitting tasks. Commit small changes with clear messages. Both team members should understand the ER diagram, transaction-based booking, SQL queries, and MongoDB integration for the demo/viva.
