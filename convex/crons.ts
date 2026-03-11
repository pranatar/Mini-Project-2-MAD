import { cronJobs } from "convex/server";
import { api } from "./_generated/api";

const crons = cronJobs();

// Check for expired reservations every hour
crons.interval(
  "check-expired-reservations",
  { hours: 1 },
  api.borrowings.checkExpiredReservations,
);

// Check for upcoming deadlines every day at 8:00 AM
crons.daily(
  "check-upcoming-deadlines",
  { hourUTC: 1, minuteUTC: 0 }, // 08:00 WIB (UTC+7)
  api.borrowings.checkUpcomingDeadlines,
);

// Process overdue books every day at 9:00 AM
crons.daily(
  "process-overdue-books",
  { hourUTC: 2, minuteUTC: 0 }, // 09:00 WIB (UTC+7)
  api.borrowings.processOverdueBooks,
);

export default crons;
