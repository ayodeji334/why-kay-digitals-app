export type DateFormat =
  | "dd-mm-yyyy"
  | "mm-dd-yyyy"
  | "yyyy-mm-dd"
  | "month-day-year"
  | "day-month-year"
  | "full"
  | "relative";

export type TimeFormat = "12h" | "24h" | "none";

export interface FormatDateOptions {
  dateFormat?: DateFormat;
  timeFormat?: TimeFormat;
  locale?: string;
  timeZone?: string;
  includeSeconds?: boolean;
  capitalize?: boolean;
}

export const formatDate = (
  dateInput: string | Date,
  options: FormatDateOptions | boolean = true,
): string => {
  // Handle backward compatibility with boolean parameter
  const shouldIncludeTime = typeof options === "boolean" ? options : true;
  const config: FormatDateOptions =
    typeof options === "boolean"
      ? { timeFormat: shouldIncludeTime ? "12h" : "none" }
      : options;

  const {
    dateFormat = "month-day-year",
    timeFormat = "12h",
    locale = "en-US",
    timeZone,
    includeSeconds = false,
    capitalize = false,
  } = config;

  const date = new Date(dateInput);

  // Validate date
  if (isNaN(date.getTime())) {
    throw new Error("Invalid date provided");
  }

  // Handle relative time format (e.g., "2 hours ago")
  if (dateFormat === "relative") {
    return getRelativeTime(date);
  }

  let formattedDate = "";

  // Format date based on specified format
  switch (dateFormat) {
    case "dd-mm-yyyy":
      formattedDate = formatCustomDate(date, "dd-mm-yyyy");
      break;
    case "mm-dd-yyyy":
      formattedDate = formatCustomDate(date, "mm-dd-yyyy");
      break;
    case "yyyy-mm-dd":
      formattedDate = formatCustomDate(date, "yyyy-mm-dd");
      break;
    case "day-month-year":
      formattedDate = formatCustomDate(date, "day-month-year");
      break;
    case "full":
      formattedDate = date.toLocaleDateString(locale, {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        timeZone,
      });
      break;
    default: // 'month-day-year'
      formattedDate = date.toLocaleDateString(locale, {
        month: "short",
        day: "numeric",
        year: "numeric",
        timeZone,
      });
  }

  // Format time if requested
  if (timeFormat !== "none") {
    const formattedTime = formatTime(
      date,
      timeFormat,
      locale,
      timeZone,
      includeSeconds,
    );
    formattedDate = `${formattedDate} ${formattedTime}`;
  }

  return capitalize ? formattedDate.toUpperCase() : formattedDate;
};

const formatCustomDate = (
  date: Date,
  format: "dd-mm-yyyy" | "mm-dd-yyyy" | "yyyy-mm-dd" | "day-month-year",
): string => {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const fullMonthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const year = date.getFullYear();

  switch (format) {
    case "dd-mm-yyyy":
      return `${day}-${month}-${year}`;
    case "mm-dd-yyyy":
      return `${month}-${day}-${year}`;
    case "yyyy-mm-dd":
      return `${year}-${month}-${day}`;
    case "day-month-year":
      return `${day} ${fullMonthNames[date.getMonth()]} ${year}`;
    default:
      return `${monthNames[date.getMonth()]} ${day}, ${year}`;
  }
};

const formatTime = (
  date: Date,
  timeFormat: TimeFormat,
  locale: string,
  timeZone?: string,
  includeSeconds?: boolean,
): string => {
  const options: Intl.DateTimeFormatOptions = {
    hour: "2-digit",
    minute: "2-digit",
    hour12: timeFormat === "12h",
    timeZone,
  };

  if (includeSeconds) {
    options.second = "2-digit";
  }

  return date.toLocaleTimeString(locale, options);
};

const getRelativeTime = (date: Date): string => {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInSeconds = Math.floor(diffInMs / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInSeconds < 60) {
    return "just now";
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""} ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;
  } else if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
  } else {
    // For older dates, fall back to regular format
    return formatDate(date, {
      dateFormat: "month-day-year",
      timeFormat: "none",
    });
  }
};

// Additional utility functions
export const dateUtils = {
  // Check if date is today
  isToday: (date: Date): boolean => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  },

  // Check if date is in the past
  isPast: (date: Date): boolean => {
    return new Date() > date;
  },

  // Check if date is in the future
  isFuture: (date: Date): boolean => {
    return new Date() < date;
  },

  // Add days to a date
  addDays: (date: Date, days: number): Date => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  },

  // Get difference between two dates in days
  diffInDays: (date1: Date, date2: Date): number => {
    const diffTime = Math.abs(date2.getTime() - date1.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  },

  // Format date for input type="date"
  toDateInputValue: (date: Date): string => {
    return date.toISOString().split("T")[0];
  },
};

// Keep the original function for backward compatibility
export const customizedFormatDate = (input: string | Date): string => {
  return formatDate(input, { dateFormat: "yyyy-mm-dd", timeFormat: "none" });
};
