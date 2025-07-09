const calculateTotalTime = (startTime, durationInSeconds) => {
  // const currentLog = payload.currentLog;
  // const startTime = startTimeArray[startTimeArray.length - 1];
  const tempTime = new Date(startTime);
  const newTime = new Date(
    tempTime.getTime() - (durationInSeconds || 0) * 1000
  );
  const startDate = new Date(newTime.toISOString());
  const currentDate = new Date();
  const timeDifference = currentDate - startDate;
  const hours = Math.max(0, (Math.floor(timeDifference / (1000 * 60 * 60))));
  const minutes =Math.max(0,( Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60))));
  const seconds = Math.max(0,(Math.floor((timeDifference % (1000 * 60)) / 1000)));
  return {
    hours,
    minutes,
    seconds,
  };
};

// <-- hh:mm Hr -->
const formatDuration = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  const formattedHours = hours.toString().padStart(2, "0");
  const formattedMinutes = remainingMinutes.toString().padStart(2, "0");
  const formattedSeconds = (seconds % 60).toString().padStart(2, "0");
  return `${formattedHours}:${formattedMinutes}:${formattedSeconds} Hr`;
};

const formatDate = (offset) => {
  const today = new Date();
  today.setDate(today.getDate() + offset);

  const day = today.getDate().toString().padStart(2, "0");
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
  const month = monthNames[today.getMonth()];
  const year = today.getFullYear();

  return `${day} ${month} ${year}`;
};

const formatTime = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  return {
    hours,
    minutes,
    seconds: remainingSeconds,
  };
};

const formatISOdate = (inputDate) => {
  const date = new Date(inputDate);

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Note: Months are zero-based, so we add 1.
  const year = date.getFullYear();

  return `${day}-${month}-${year}`;
};

const areTimeIntervalsNonOverlapping = async (
  startTime,
  endTime,
  entries,
  date,
  currentEntry
) => {
  if (!startTime || !endTime || !entries || !date) {
    return false;
  }

  // Filter entries by the specific date
  const filteredEntries = entries.filter((entry) => {
    const entryDate = new Date(entry.startTime).toISOString().split("T")[0];
    return entryDate === date && entry._id !== currentEntry._id;
  });

  // Check for overlapping intervals
  for (let entry of filteredEntries) {
    const entryStart = entry.startTime;
    const entryEnd = entry.endTime;

    // Check given startTime and endTime with existing entries
    if (
      (startTime >= entryStart && startTime < entryEnd) ||
      (endTime > entryStart && endTime <= entryEnd) ||
      (startTime <= entryStart && endTime >= entryEnd)
    ) {
      return false;
    }
  }
  return true;
};

const calculateTotalDurationInSeconds = (startTime, endTime) => {
  if (!startTime || !endTime) {
    return null;
  }

  const start = new Date(startTime);
  const end = new Date(endTime);
  const durationInSeconds = (end - start) / 1000;
  return Math.floor(durationInSeconds);
};

function convertISOToTime(isoString) {
  const date = new Date(isoString);

  const hours = date.getUTCHours();
  const minutes = date.getUTCMinutes();
  // const seconds = date.getUTCSeconds();
  // Format hours, minutes, and seconds to ensure two digits
  const formattedHours = String(hours).padStart(2, "0");
  const formattedMinutes = String(minutes).padStart(2, "0");
  // const formattedSeconds = String(seconds).padStart(2, "0");

  // Return the formatted time string with seonds
  // return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
  return `${formattedHours}:${formattedMinutes}`;
}

export {
  calculateTotalTime,
  formatDuration,
  formatDate,
  formatTime,
  formatISOdate,
  areTimeIntervalsNonOverlapping,
  calculateTotalDurationInSeconds,
  convertISOToTime,
};
