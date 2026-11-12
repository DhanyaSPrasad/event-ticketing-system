# Database Role-Based Access Control (RBAC)

Three MySQL accounts enforce database privileges:
- `ets_admin` / `ets_admin_role`: event setup and admin reports.
- `ets_customer` / `ets_customer_role`: event browsing and customer booking.
- `ets_auth` / `ets_auth_role`: read-only login credential lookup.

## Setup
1. Run `database/rbac.sql` in MySQL Workbench as a database administrator.
2. Replace all three `CHANGE_ME_...` password values before execution.
3. Add matching credentials to `.env.local`, following `.env.example`.
4. Restart Next.js so all three pools reconnect.
5. Visit `/api/health`; all three connections should report connected.

The authentication account can read only user_id, name, email, password_hash
and role. The customer account has the DML required by the booking transaction.
The admin account can manage event setup and read sales/occupancy data.

The app checks the signed-in role before selecting a database pool. The booking
API derives user_id from the signed session, never from request JSON.

MySQL table/column grants do not provide row-level ownership isolation.
Booking history must continue to be filtered by the authenticated user's ID.
Never expose database credentials to the browser.

## Verification
Run as a MySQL administrator:
```sql
SHOW GRANTS FOR 'ets_admin'@'localhost';
SHOW GRANTS FOR 'ets_customer'@'localhost';
SHOW GRANTS FOR 'ets_auth'@'localhost';
```
Test the accounts separately: customer cannot insert/delete Events; auth
cannot update Users; admin can read event reports and create events.
