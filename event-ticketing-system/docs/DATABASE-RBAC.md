# Database Role-Based Access Control (RBAC)

Two MySQL accounts enforce database privileges:

- `ets_admin` / `ets_admin_role`: event setup and admin reports.
- `ets_customer` / `ets_customer_role`: event browsing and customer booking.

## Setup

1. Run `database/rbac.sql` in MySQL Workbench as a database administrator.
2. Replace both `CHANGE_ME_..._PASSWORD` values before execution.
3. Add the matching credentials to `.env.local`, following `.env.example`.
4. Restart Next.js so both pools use the configured credentials.
5. Visit `/api/health`; both connections should report connected.

The customer role has column-level SELECT access to `user_id`, `name`,
`email`, `password_hash` and `role` in `Users`. The login API uses this
limited lookup to verify credentials, so a separate authentication account
is not required. After login, role-protected operations use the corresponding
Admin or Customer database connection.

The customer account has the DML permissions required by the booking
transaction. The admin account can manage event setup and read booking/payment
records. The booking API derives `user_id` from the signed session, never
from request JSON.

MySQL table/column grants do not provide row-level ownership isolation.
Booking history must continue to be filtered by the authenticated user's ID.
Never expose database credentials to the browser.

## Verification

Run as a MySQL administrator:

```sql
SHOW GRANTS FOR 'ets_admin'@'localhost';
SHOW GRANTS FOR 'ets_customer'@'localhost';
```

Test the accounts separately: customer cannot insert/delete Events; customer
can read only the granted login columns from Users; admin can read event
reports and create events.
