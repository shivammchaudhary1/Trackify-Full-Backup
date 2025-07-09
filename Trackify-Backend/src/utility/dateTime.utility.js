function getTotalDaysInMonth(year, month) {
  return new Date(year, month, 0).getDate();
}

function getFirstDayOfMonth(year, month) {
  return new Date(year, month - 1, 1).getDay();
}

function formatDuration(seconds) {
  const hours = Math.floor(seconds / 3600); // 1 hour = 3600 seconds
  const remainingSeconds = seconds % 3600;
  const minutes = Math.floor(remainingSeconds / 60);
  const remainingSecondsInMinutes = remainingSeconds % 60;

  return { hours, minutes, seconds: remainingSecondsInMinutes };
}

function calculateHours(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return { hours, minutes };
}


const LEAVE_FREQUENCY = {
  MONTH: "month",
  YEAR: "year",
  QUARTER: "quarter",
  HALF_YEAR: "halfYear",
};

const calculateNextStartDate = (setting, previousStartDate = null) => {
  const currentDate = new Date();

  let nextStartDate;

  if (setting.recurrence === "once" && setting.nextExecutionDate > new Date()) {
    return setting.nextExecutionDate;
  }

  if (previousStartDate) {
    nextStartDate = new Date(previousStartDate);
  } else {
    nextStartDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      setting.date
    );
  }

  switch (setting.frequency) {
    case LEAVE_FREQUENCY.MONTH:
      nextStartDate.setMonth(nextStartDate.getMonth() + 1);
      break;
    case LEAVE_FREQUENCY.YEAR:
      if (previousStartDate) {
        nextStartDate.setFullYear(nextStartDate.getFullYear() + 1);
      } else {
        nextStartDate.setFullYear(currentDate.getFullYear() + 1);
        // January
        nextStartDate.setMonth(0);
      }
      break;
    case LEAVE_FREQUENCY.QUARTER:
      if (previousStartDate) {
        nextStartDate.setMonth(nextStartDate.getMonth() + 3);
      } else {
        const months = [0, 3, 6, 9];
        let nextQuarterMonth = months.find(
          (month) => month > currentDate.getMonth()
        );
        if (!nextQuarterMonth) {
          nextQuarterMonth = months[0];
          nextStartDate.setFullYear(nextStartDate.getFullYear() + 1);
        }
        nextStartDate.setMonth(nextQuarterMonth);
      }
      break;
    case LEAVE_FREQUENCY.HALF_YEAR:
      if (previousStartDate) {
        nextStartDate.setMonth(nextStartDate.getMonth() + 6);
      } else {
        nextStartDate.setMonth(currentDate.getMonth() < 6 ? 6 : 0);
      }
      break;
    default:
      return null;
  }

  return nextStartDate;
};

module.exports = {
  calculateHours,
  calculateNextStartDate,
  getTotalDaysInMonth,
  getFirstDayOfMonth,
  formatDuration,
};
