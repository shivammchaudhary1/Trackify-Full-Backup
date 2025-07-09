const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");
dayjs.extend(utc);
dayjs.extend(timezone);

const { formatDuration, calculateHours } = require("./dateTime.utility.js");
const { LEAVE_DURATION_TYPES } = require("./holiday.utility.js");

const daysInWeek = {
  0: "sunday",
  1: "monday",
  2: "tuesday",
  3: "wednesday",
  4: "thursday",
  5: "friday",
  6: "saturday",
};

const MONTHS_NAMES_BY_NUMBER = {
  1: "january",
  2: "february",
  3: "march",
  4: "april",
  5: "may",
  6: "june",
  7: "july",
  8: "august",
  9: "september",
  10: "october",
  11: "november",
  12: "december",
};

function getWeekEndDaysCountForMonth(workingDays, year, month, totalDays) {
  const weekEnds = Object.keys(daysInWeek)
    .map((dayCount) => {
      if (!workingDays.includes(daysInWeek[dayCount])) {
        return Number(dayCount);
      } else {
        return null;
      }
    })
    .filter((dayCount) => dayCount !== null);

  let weekEndDaysCount = 0;
  let holidays = [];

  for (let i = 1; i <= totalDays; i++) {
    const date = new Date(year, month - 1, i);
    if (weekEnds.includes(date.getDay())) {
      weekEndDaysCount = weekEndDaysCount + 1;
      holidays.push(date.getDate());
    }
  }

  return { weekEndDaysCount, holidays };
}

const calculateIdealMonthlyHours = (rules, yearlyHolidays, year, month, timeZone) => {
  // Get the Working days in a week from the rules
  const workingDays = rules[0].weekDays;
  // get the total number of days in the month
  const totalDaysInMonth = new Date(year, month, 0).getDate();
  // get the number of weekend days, excluding holidays
  const { weekEndDaysCount, holidays } = getWeekEndDaysCountForMonth(
    workingDays,
    year,
    month,
    totalDaysInMonth
  );

  const gazettedHolidays = [];
  // get the number of holidays
  const holidayCount = yearlyHolidays.reduce((dayCount, curr) => {
    //holidayValue is a number between 0-6 represents day of the week
    const holidayDate = dayjs.utc(curr.date).tz(timeZone || "Asia/Kolkata");

    if (
      holidayDate.month() + 1 === month &&
      workingDays.includes(daysInWeek[holidayDate.day()])
    ) {
      gazettedHolidays.push(holidayDate.date());
      return dayCount + 1;
    } else {
      return dayCount;
    }
  }, 0);

  // get the number of working days excluding holidays
  const totalRequiredWorkingDays =
    totalDaysInMonth - (weekEndDaysCount + holidayCount);

  const totalRequiredWorkingHours =
    totalRequiredWorkingDays * rules[0].workingHours;

  return {
    totalRequiredWorkingHours,
    totalRequiredWorkingDays,
    holidays,
    totalDaysInMonth,
    gazettedHolidays,
  };
};

const calculateUserMonthlyHours = (
  user,
  leaveTypes,
  idealMonthlyHours,
  rules,
  leaveRecords,
  entryLogs,
  holidays,
  month
) => {
  // Calculate number of days worked
  let userWorkedDayCount = 0;

  const { paidLeaves, unpaidLeaves, totalLeaves } = getUserLeaves(
    leaveRecords,
    leaveTypes,
    month
  );

  const numOfDaysWorkedDates = entryLogs.reduce((numberOfDaysWorked, entry) => {
    const dateCount = new Date(entry.startTime).getDate();
    if (!entry || entry.durationInSeconds === undefined)
      return numberOfDaysWorked;

    if (!numberOfDaysWorked[dateCount]) {
      numberOfDaysWorked[dateCount] = entry.durationInSeconds;
      return numberOfDaysWorked;
    } else {
      numberOfDaysWorked[dateCount] += entry.durationInSeconds;
      return numberOfDaysWorked;
    }
  }, {});

  let numberOfDaysWorkedByUserInSelectedMonth = 0;
  let totalEntryLogDurationInSeconds = 0;

  let overtimeBalance = 0;
  for (const day in numOfDaysWorkedDates) {
    if (numOfDaysWorkedDates[day]) {
      const { hours, minutes } = calculateHours(numOfDaysWorkedDates[day]);

      totalEntryLogDurationInSeconds =
        totalEntryLogDurationInSeconds + (numOfDaysWorkedDates[day] ?? 0);

      if (hours >= 8) {
        numberOfDaysWorkedByUserInSelectedMonth += 1;
        overtimeBalance = overtimeBalance + (hours - 8) * 60 + minutes;
      } else if (hours >= 4) {
        const newTime = (overtimeBalance + hours * 60 + minutes) / 60;
        if (newTime >= 8) {
          numberOfDaysWorkedByUserInSelectedMonth += 1;
          overtimeBalance = (newTime - 8) * 60;
        } else {
          numberOfDaysWorkedByUserInSelectedMonth += 0.5;
          overtimeBalance = (hours - 4) * 60 + minutes;
        }
      } else {
        const newTime2 = (hours * 60 + minutes + overtimeBalance) / 60;
        if (newTime2 >= 8) {
          numberOfDaysWorkedByUserInSelectedMonth += 1;
          overtimeBalance = (newTime2 - 8) * 60;
        } else if (newTime2 >= 4) {
          numberOfDaysWorkedByUserInSelectedMonth += 0.5;
          overtimeBalance = (newTime2 - 4) * 60;
        } else {
          numberOfDaysWorkedByUserInSelectedMonth +=
            Math.round(((((hours * 60 + minutes) / 60 / 8) * 100) / 100) * 4) /
            4;
        }
      }
    }
  }

  numberOfDaysWorkedByUserInSelectedMonth = Number(
    numberOfDaysWorkedByUserInSelectedMonth.toFixed(2)
  );

  const { workingHours } = rules.find((rule) => rule.isActive);

  let userIdealWorkingSeconds =
    idealMonthlyHours * 3600 - totalLeaves * workingHours * 3600;

  const undertimeInSeconds =
    totalEntryLogDurationInSeconds < userIdealWorkingSeconds
      ? userIdealWorkingSeconds - totalEntryLogDurationInSeconds
      : 0;

  return {
    user: user.name || "",
    userId: user._id,
    userIdealWorkingHours: formatDuration(userIdealWorkingSeconds),
    userWorkingHour: formatDuration(totalEntryLogDurationInSeconds),
    overtime:
      totalEntryLogDurationInSeconds > userIdealWorkingSeconds
        ? formatDuration(
            totalEntryLogDurationInSeconds - userIdealWorkingSeconds
          )
        : { hours: 0, minutes: 0, seconds: 0 },
    undertime:
      undertimeInSeconds > 0
        ? formatDuration(undertimeInSeconds)
        : { hours: 0, minutes: 0, seconds: 0 },
    datesUserWorked: Array.from(numOfDaysWorkedDates),
    totalLeaves,
    paidLeaves,
    unpaidLeaves,
    userWorkedDayCount,
    numberOfDaysWorkedByUserInSelectedMonth,
  };
};

function getUserLeaves(leaveRecords, leaveTypes, month) {
  let paidLeaves = 0;
  let unpaidLeaves = 0;
  let totalLeaves = 0;

  // Helper function to increment leave counts
  const incrementLeaves = (duration, isPaid) => {
    const incrementValue = duration === LEAVE_DURATION_TYPES.FULL_DAY ? 1 : 0.5;
    totalLeaves += incrementValue;
    isPaid ? (paidLeaves += incrementValue) : (unpaidLeaves += incrementValue);
  };
  leaveRecords.forEach((leave) => {
    const data = leaveTypes.find(
      (leaveType) => leaveType.leaveType === leave.type
    );

    leave.dailyDetails.forEach((dailyDetail) => {
      const currentMonth = dailyDetail.day.getMonth() + 1;
      // Months are 0-based
      if (currentMonth === month) {
        incrementLeaves(dailyDetail.duration, data?.paid);
      }
    });
  });
  return { paidLeaves, unpaidLeaves, totalLeaves };
}

module.exports = {
  MONTHS_NAMES_BY_NUMBER,
  calculateIdealMonthlyHours,
  calculateUserMonthlyHours,
};
