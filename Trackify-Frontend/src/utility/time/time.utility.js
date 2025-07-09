function convertSecondsToHoursAndMinutes(seconds) {
  const hour = Math.floor(seconds / 3600);
  const minute = Math.floor((seconds % 3600) / 60);

  // Pad single digit minutes with a leading zero
  const paddedMinute = String(minute).padStart(2, "0");

  return `${hour}H ${paddedMinute}M`;
}

const LEAVE_FREQUENCY = {
  MONTH: "month",
  YEAR: "year",
  QUARTER: "quarter",
  HALF_YEAR: "halfYear",
};

function isFutureDate(date, recurrence) {
  const currentDate = new Date().toISOString().split("T")[0];
  const inputDate = new Date(date).toISOString().split("T")[0];
  if (recurrence === "once") {
    // Check if the date is today and in the future
    // Check if the date is in the future
    return inputDate >= currentDate;
  } else {
    // If recurrence is not 'once', always return true
    return true;
  }
}

/**
 * Calculates the next execution date based on recurrence, frequency, and date value.
 *
 * @param {string} recurrence - "once" | "repeat"
 * @param {string} frequency - "monthly" | "quarterly" | "half-yearly" | "yearly"
 * @param {number} date - day of month (1-31)
 * @param {string} [oneTimeDate] - for 'once' recurrence, the selected date (YYYY-MM-DD)
 * @returns {string | null} - next execution date in "YYYY-MM-DD" format or null if invalid
 */
function getNextExecutionDate(recurrence, frequency, date, oneTimeDate) {
  const today = new Date();
  const executionDate = new Date(today);

  if (recurrence === "repeat") {
    executionDate.setDate(date);

    if (frequency === "month") {
      if (executionDate <= today) {
        executionDate.setMonth(executionDate.getMonth() + 1);
        executionDate.setDate(date);
      }
    } else if (frequency === "quarter") {
      if (executionDate <= today) {
        executionDate.setMonth(executionDate.getMonth() + 3);
        executionDate.setDate(date);
      }
    } else if (frequency === "halfYear") {
      if (executionDate <= today) {
        executionDate.setMonth(executionDate.getMonth() + 6);
        executionDate.setDate(date);
      }
    } else if (frequency === "year") {
      if (executionDate <= today) {
        executionDate.setFullYear(executionDate.getFullYear() + 1);
        executionDate.setDate(date);
      }
    } else {
      return null; // unsupported frequency
    }

    return executionDate.toISOString().split("T")[0];
  } else if (recurrence === "once") {
    return oneTimeDate || null;
  }

  return null;
}

export {
  LEAVE_FREQUENCY,
  convertSecondsToHoursAndMinutes,
  isFutureDate,
  getNextExecutionDate,
};
