const { config } = require("../env/default.js");
const { encryptData, decryptData } = require("../lib/crypto.js");

const MAX_SESSION_AGE = 86400000 * 2;

/**
 * Creates a new sessionId with the given user ID and current user agent (browser).
 * This id will be set as a cookie in the browser, and will be used to authenticate the user.
 * @param {string} userId The ID of the user.
 * @param {string} currentUserAgent The current user agent.
 * @returns {Object} The session object with the session ID and expiration date.
 *
 */
function createSession(userId, currentUserAgent) {
  if (!userId || !currentUserAgent) {
    throw new Error("User ID and current user agent are required");
  }

  // Encrypt the user ID and current user agent
  const sessionId = encryptData(userId).toString("hex");
  const userAgent = encryptData(currentUserAgent.toString()).toString("hex");

  return {
    // The session ID consists of the encrypted user ID and the encrypted user agent
    sessionId: `${sessionId}.${userAgent}`,
    // The session will expire in 2 days
    maxAge: MAX_SESSION_AGE,
  };
}

/**
 * Decodes a session ID and returns the user ID.
 * @param {string} sessionId The session ID to decode.
 * @param {string} currentUserAgent The current user agent.
 * @returns {Object} The user ID or an error message.
 *
 */
function decodeSession(sessionId, currentUserAgent) {
  // Split the session ID into the user data and the encrypted user agent
  const [userData, encryptedUserAgent] = sessionId.split(".");
  // Decrypt the user agent
  const userAgent = decryptData(
    Buffer.from(encryptedUserAgent, "hex")
  ).toString();
  // Decrypt the user ID
  const userId = decryptData(Buffer.from(userData, "hex")).toString();
  // Check if the user agent and user ID are valid
  if (currentUserAgent !== userAgent || !userId) {
    return { error: "invalid session" };
  }
  // Return the user ID
  return { userId };
}


function handleLeave({
  leaveBalance,
  appliedLeaveType,
  noOfDays,
  holidays,
  startDate,
  endDate,
}) {
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (appliedLeaveType === "leaveWithoutPay") {
    // Check for overtime balance first
    const overtime = leaveBalance.find(
      (leave) => leave.type === "overtime" && leave.isActive && leave.value > 0
    );
    if (overtime && overtime.value >= noOfDays) {
      return {
        canApply: true,
        type: "overtime",
        leaveToReduce: noOfDays,
        start,
        end,
      };
    } else if (overtime && overtime.value < noOfDays) {
      const remainingDays = noOfDays - overtime.value;
      const overtimeEndDate = new Date(startDate);
      overtimeEndDate.setDate(overtimeEndDate.getDate() + (overtime.value - 1));
      return {
        canApply: true,
        type: "mixed",
        leaveToReduce: [
          {
            type: "overtime",
            value: overtime.value,
            start: startDate,
            end: overtimeEndDate,
          },
          {
            type: "leaveWithoutPay",
            value: remainingDays,
            start: new Date(overtimeEndDate.getTime() + 24 * 60 * 60 * 1000),
            // Next day after overtime ends end,
          },
        ],
      };
    } else {
      // Grant leave without pay if no overtime balance is found
      return {
        canApply: true,
        type: appliedLeaveType,
        leaveToReduce: noOfDays,
        start,
        end,
      };
    }
  }

  // Check if leave type is restricted
  if (appliedLeaveType === "restricted") {
    const hasRestrictedHoliday = holidays.filter(
      (holiday) => holiday.type.toLowerCase() === "restricted"
    );

    if (!hasRestrictedHoliday || hasRestrictedHoliday.length !== noOfDays) {
      return {
        canApply: false,
        message: `Restricted leave can only be applied on a restricted holiday.`,
      };
    }
  }

  // Filter gazetted holidays in the range
  const gazettedDays = holidays.filter(
    (holiday) => holiday.type.toLowerCase() === "gazetted"
  ).length;

  // Adjust the number of leave days to account for gazetted holidays
  const effectiveDays = noOfDays - gazettedDays;

  if (effectiveDays <= 0) {
    return {
      canApply: false,
      message: "No leave application needed due to gazetted holidays.",
    };
  }

  // Find the applied leave type in the leave balance
  const leaveType = leaveBalance.find(
    (leave) => leave.type === appliedLeaveType && leave.isActive
  );

  // If the leave type doesn't exist or is inactive
  if (!leaveType) {
    return {
      canApply: false,
      message: `${appliedLeaveType} is not available.`,
    };
  }

  // Check if leave type has enough balance
  if (leaveType.value >= effectiveDays) {
    return {
      canApply: true,
      type: appliedLeaveType,
      leaveToReduce: noOfDays,
      start,
      end,
    };
  }

  // If not enough balance, check for overtime
  const overtime = leaveBalance.find(
    (leave) => leave.type === "overtime" && leave.isActive
  );

  // Partial leave from both leave type and overtime
  const totalAvailable = leaveType.value + (overtime?.value || 0);
  if (totalAvailable >= effectiveDays) {
    const overTimeStartDate = new Date(startDate);
    overTimeStartDate.setDate(overTimeStartDate.getDate() + leaveType.value);

    const appliedTypeEndDate = new Date(startDate);
    appliedTypeEndDate.setDate(
      appliedTypeEndDate.getDate() + (leaveType.value - 1)
    );

    return {
      canApply: true,
      type: "mixed",
      leaveToReduce: [
        {
          type: appliedLeaveType,
          value: leaveType.value,
          start: startDate,
          end: appliedTypeEndDate,
        },
        {
          type: "overtime",
          value: noOfDays - leaveType.value,
          start: overTimeStartDate,
          end: endDate,
        },
      ],
    };
  }

  // If neither leave type nor overtime has sufficient balance
  return {
    canApply: false,
    message: `Insufficient balance for ${appliedLeaveType}.`,
  };
}

function allowedOrigins() {
  return [
    config.frontend_domain,
    "https://www.trackify.ai",
  ];
}

const LEAVE_ADD_RECURRENCE = {
  ONCE: "once",
  REPEAT: "repeat",
};

const timeZoneAlias = {
  "Asia/Calcutta": "Asia/Kolkata",
};

module.exports = {
  LEAVE_ADD_RECURRENCE,
  timeZoneAlias,
  allowedOrigins,
  createSession,
  decodeSession,
  handleLeave,
};
