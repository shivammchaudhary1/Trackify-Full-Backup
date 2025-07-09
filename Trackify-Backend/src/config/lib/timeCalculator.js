const calculateDuration = (startTimeISO, endTimeISO) => {
  const startTime = new Date(startTimeISO);
  const endTime = new Date(endTimeISO);
  const timeDifferenceMillis = endTime - startTime;
  const timeDifferenceInSeconds = Math.floor(timeDifferenceMillis / 1000);
  return timeDifferenceInSeconds;
};

const convertDateToTimestamps = (dateString) => {
  // Parse the input date string
  const [day, month, year] = dateString.split(" ");

  // Convert month name to a numerical month (0-indexed)
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
  const monthIndex = monthNames.indexOf(month);

  // Create the start and end timestamps
  const startDate = new Date(Date.UTC(year, monthIndex, day, 0, 0, 0));
  const endDate = new Date(Date.UTC(year, monthIndex, day, 23, 59, 59, 999));

  return {
    startTimestamp: startDate.toISOString(),
    endTimestamp: endDate.toISOString(),
  };
};

module.exports = { calculateDuration, convertDateToTimestamps };
