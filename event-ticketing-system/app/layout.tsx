import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Event Ticketing System",
  description: "DBMS project for event ticketing and seat allocation"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <header className="topbar">
          <a className="brand" href="/">Event Ticketing System</a>
          <nav>
            <a href="/">Events</a>
            <a href="/bookings">My bookings</a>
            <a href="/admin">Admin</a>
            <a href="/login">Sign in</a>
          </nav>
        </header>
        <main className="container">{children}</main>
        <footer className="footer">Academic demo · No real payments are processed</footer>
      </body>
    </html>
  );
}
