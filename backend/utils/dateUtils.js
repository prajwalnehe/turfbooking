// Utility function to normalize date to start of day for consistent comparison
// Uses UTC to avoid timezone issues
export const normalizeDate = (dateString) => {
  // Parse date string (YYYY-MM-DD format) and set to UTC midnight
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
  return date;
};

// Utility function to get date range for MongoDB query
// This ensures we capture all slots for a given date regardless of timezone
export const getDateRange = (dateString) => {
  const start = normalizeDate(dateString);
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);
  return { start, end };
};

