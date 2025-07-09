const mongoose = require("mongoose");
const moment = require("moment-timezone");
const momentJs = require("moment");
const PDFDocument = require("pdfkit");

const reportsUtility = require("../utility/report.utility.js");
const {
  HOLIDAY_TYPES,
  LEAVE_DURATION_TYPES,
} = require("../utility/holiday.utility.js");
const { USER_STATUS } = require("../config/utility/user.utility.js");
const logger = require("../config/lib/logger.js");
const { config } = require("../config/env/default.js");
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");

dayjs.extend(utc);
dayjs.extend(timezone);

const Project = mongoose.model("Project");
const Client = mongoose.model("Client");
const User = mongoose.model("User");
const Workspace = mongoose.model("Workspace");
const Holiday = mongoose.model("Holiday");
const Entry = mongoose.model("Entry");
const Leave = mongoose.model("Leave");
const MonthlyReport = mongoose.model("MonthlyReport");
const LeaveBalance = mongoose.model("LeaveBalance");
const LeaveHistory = mongoose.model("LeaveHistory");
const LeaveEncashmentHistory = mongoose.model("LeaveEncashmentHistory");

const getProjectDetailsByName = async (req, res) => {
  try {
    const { projectName } = req.body;

    if (!projectName) {
      return res.status(400).json({ error: "Project name is required" });
    }

    const project = await Project.findOne({ name: projectName }).populate(
      "client"
    );

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    res.status(200).json({ project });
  } catch (error) {
    return res.status(500).json(`Failed to get data: ${error.message}`);
  }
};

const getProjectDetailsByClientName = async (req, res) => {
  try {
    const { clientName } = req.body;

    if (!clientName) {
      return res.status(400).json({ error: "Client name is required" });
    }

    const client = await Client.findOne({ name: clientName }).populate(
      "projects"
    );

    if (!client) {
      return res.status(404).json({ error: "Client not found" });
    }

    res.status(200).json({ projects: client.projects });
  } catch (error) {
    return res.status(500).json(`Failed to get data: ${error.message}`);
  }
};

const getProjectReport = async (req, res) => {
  const { id } = req.params;

  try {
    const project = await Project.findById(id)
      .populate("team")
      .populate("client")
      .populate("entryLogs");

    if (!project) {
      return res.status(404).json("Project not found");
    }

    let totalHours = 0;
    project.entryLogs.forEach((entryLog) => {
      if (entryLog.durationInSeconds) {
        totalHours += entryLog.durationInSeconds / 3600;
      }
    });

    const teamMembers = project.team.map((member) => member.name);
    const creationDate = project.createdAt;

    res.status(200).json({
      report: {
        totalHoursSpent: totalHours,
        totalMembers: project.team.length,
        teamMembers: teamMembers,
        clientName: project.client.name,
        creationDate: creationDate,
      },
    });
  } catch (error) {
    return res.status(500).json(`failed to get report: ${error.messages}`);
  }
};

const getUserReport = async (req, res) => {
  const { userId } = req.params;
  const { projects, start, end } = req.query;
  const projectIds = projects ? projects.split(",") : [];

  try {
    const pipeline = [];

    // Convert to moment objects
    const uStart = moment(
      preprocessDateString(start),
      "ddd MMM DD YYYY HH:mm:ss [GMT]ZZ (z)"
    );
    const uEnd = moment(
      preprocessDateString(end),
      "ddd MMM DD YYYY HH:mm:ss [GMT]ZZ (z)"
    );

    // Start time to 12:00 AM
    const startDate = uStart.startOf("day").toDate();
    // End time to 11:59:59 PM
    const endDate = uEnd.endOf("day").toDate();

    // Match with user, and date range
    pipeline.push({
      $match: {
        user: mongoose.Types.ObjectId.createFromHexString(userId),
        workspace: req.user.currentWorkspace,
        startTime: { $gte: startDate, $lte: endDate },
      },
    });

    // if projectIds is provided, match with project
    if (projectIds.length) {
      pipeline.push({
        $match: {
          project: {
            $in: projectIds.map((projectId) =>
              mongoose.Types.ObjectId.createFromHexString(projectId)
            ),
          },
        },
      });
    }

    // Populate the project and select project name
    pipeline.push({
      $lookup: {
        from: "projects",
        localField: "project",
        foreignField: "_id",
        as: "projectDetails",
        pipeline: [{ $project: { _id: 0, name: 1 } }, { $limit: 1 }],
      },
    });

    // Group by date
    const groupBy = {
      date: { $dateToString: { format: "%Y-%m-%d", date: "$startTime" } },
    };

    pipeline.push({
      $group: {
        _id: groupBy,
        // Keep all document details for each entry
        entries: { $push: "$$ROOT" },
        // Calculate total duration per group
        totalDuration: { $sum: "$durationInSeconds" },
      },
    });

    const results = await Entry.aggregate(pipeline).sort({ _id: 1 }).lookup({
      from: "projects",
      localField: "project",
      foreignField: "_id",
      as: "projectDetails",
    });
    return res.json(results);
  } catch (error) {
    return res.status(500).json(`Failed to get report: ${error.message}`);
  }
};

const report = async (req, res) => {
  const currentWorkspace = req.user.currentWorkspace;
  const { startDate, endDate, projects, users } = req.query;

  console.log(users, "users");

  try {
    if (!startDate || !endDate) {
      return res
        .status(500)
        .send({ message: "Start and End Date is required" });
    }

    const match = {
      workspace: currentWorkspace,
      createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) },
    };

    if (projects && projects !== "undefined") {
      match.project = {
        $in: projects
          .split(",")
          .map((projectId) =>
            mongoose.Types.ObjectId.createFromHexString(projectId)
          ),
      };
    }

    if (users && users !== "undefined") {
      match.user = {
        $in: users
          .split(",")
          .map((userId) => mongoose.Types.ObjectId.createFromHexString(userId)),
      };
    }

    const pipeline = [
      {
        $match: match,
      },
      {
        $lookup: {
          from: "projects",
          localField: "project",
          foreignField: "_id",
          as: "projectDetails",
        },
      },
      {
        $unwind: "$projectDetails",
      },
      {
        $lookup: {
          from: "clients",
          localField: "projectDetails.client",
          foreignField: "_id",
          as: "clientDetails",
        },
      },
      {
        $unwind: "$clientDetails",
      },
      {
        $group: {
          _id: "$project",
          projectDetails: { $first: "$projectDetails" },
          clientDetails: { $first: "$clientDetails" },
          timeSpent: { $sum: "$durationInSeconds" },
        },
      },
      {
        $project: {
          _id: 1,
          name: "$projectDetails.name",
          description: "$projectDetails.description",
          estimatedHours: "$projectDetails.estimatedHours",
          isCompleted: "$projectDetails.isCompleted",
          createdDate: "$projectDetails.createdAt",
          client: {
            _id: "$clientDetails._id",
            name: "$clientDetails.name",
          },
          timeSpent: 1,
        },
      },
    ];
    const entries = await Entry.aggregate(pipeline);
    res
      .status(200)
      .json({ message: "Report received successfully", projects: entries });
  } catch (error) {
    return res.status(500).json(`Failed to get report: ${error.message}`);
  }
};

const generateMonthlyReport = async (req, res) => {
  const workspaceId = req.user.currentWorkspace;
  const { year, month } = req.body;
  const date = momentJs(`${year}-${month}`, "YYYY-MM");
  const daysInMonth = date.daysInMonth();

  const base = dayjs(`${year}-${String(month).padStart(2, "0")}-01`);

  const startOfMonth = base.startOf("month").toISOString();
  const endOfMonth = base.endOf("month").toISOString();

  const monthName = reportsUtility.MONTHS_NAMES_BY_NUMBER[month];

  try {
    const existingReport = await MonthlyReport.findOne({
      workspace: workspaceId,
      year: year,
      month: { $regex: new RegExp(`^${monthName}$`, "i") },
    });

    const [workspace, yearlyHolidays, users] = await Promise.all([
      Workspace.findOne({ _id: workspaceId })
        .populate("rules")
        .populate("holidays")
        .populate({
          path: "users.user",
          match: { [`statuses.${workspaceId}`]: USER_STATUS.ACTIVE },
          select: "_id, name",
        })
        .lean(),
      Holiday.find({
        $expr: {
          $and: [
            { $eq: [{ $year: "$date" }, year] },
            { $eq: [{ $month: "$date" }, month] },
          ],
        },
        type: HOLIDAY_TYPES.Gazetted,
        workspace: workspaceId,
      }).lean(),
      User.find({
        [`statuses.${workspaceId}`]: USER_STATUS.ACTIVE,
      })
        .select("_id, name")
        .lean(),
    ]);

    const idealMonthlyHours = reportsUtility.calculateIdealMonthlyHours(
      workspace.rules,
      yearlyHolidays,
      year,
      month,
      workspace.timeZone
    );

    const userMonthlyHours = await Promise.all(
      users
        .filter((user) => !!user)
        .map(async (user) => {
          const [approvedLeaves, userEntryLogs] = await Promise.all([
            Leave.find({
              dailyDetails: {
                $elemMatch: {
                  day: {
                    $gte: startOfMonth,
                    $lte: endOfMonth,
                  },
                },
              },
              status: "approved",
              user: user._id,
              workspace: workspaceId,
            }).lean(),
            Entry.find({
              startTime: {
                $gte: startOfMonth,
                $lte: endOfMonth,
              },
              user: user._id,
              workspace: workspaceId,
            }).lean(),
          ]);
          if (user) {
            return reportsUtility.calculateUserMonthlyHours(
              user,
              workspace.leaveTypes,
              idealMonthlyHours.totalRequiredWorkingHours,
              workspace.rules,
              approvedLeaves,
              userEntryLogs,
              idealMonthlyHours.holidays,
              month
            );
          }
          return null;
        })
    );

    const monthlyReport = {
      idealMonthlyHours,
      userMonthlyHours: userMonthlyHours.filter(Boolean),
    };

    return res.status(200).json({
      monthlyReport,
      disableSaving: !!existingReport,
    });
  } catch (error) {
    return res.status(500).json(`Failed to get report: ${error.message}`);
  }
};

// Usage in your monthlyReport function
const savingMonthlyReport = async (req, res) => {
  try {
    const { _id: adminId } = req.user;
    const { userId, workspaceId } = req.params;
    const { month, year, monthlyReportData } = req.body;

    // Check if the report for the given month and year already exists
    const existingReport = await MonthlyReport.findOne({ month, year })
      .select("_id")
      .lean();

    if (existingReport) {
      // TODO:: Allow updating monthly report
      // Update the existing report if it already exists
      // existingReport.report = monthlyReportData.userMonthlyHours;
      // await existingReport.save();
      res
        .status(400)
        .json({ message: "Monthly report is already saved for the month!" });
    } else {
      // Create a new report if it doesn't exist
      addOvertimeBalances(
        workspaceId,
        monthlyReportData.userMonthlyHours,
        adminId
      );
      const newMonthlyReport = new MonthlyReport({
        user: userId,
        workspace: workspaceId,
        month,
        year,
        idealMonthlyHours: monthlyReportData.idealMonthlyHours,
        report: monthlyReportData.userMonthlyHours,
        isOvertimeBalanceAdded: true,
      });

      await newMonthlyReport.save();
      // Deduct undertime balances after saving the report
      await deductUndertimeBalances(
        workspaceId,
        monthlyReportData.userMonthlyHours,
        adminId
      );
      res.status(201).json({
        message:
          "Monthly report saved successfully, overtime and undertime balances updated!",
      });
    }
  } catch (error) {
    return res.status(500).json(`Failed to save report: ${error.message}`);
  }
};

const addOvertimeBalances = async (workspaceId, userData, adminId) => {
  const workspace = await Workspace.findById(workspaceId).populate("rules");
  const { workingHours } = workspace.rules.find((rule) => rule.isActive);
  const singleDayWorkingHoursInSeconds = workingHours * 3600;

  try {
    for (const user of userData) {
      const overtimeInSeconds =
        user.overtime.hours * 3600 +
        user.overtime.minutes * 60 +
        user.overtime.seconds;

      let roundOffOvertimeBalance =
        overtimeInSeconds / singleDayWorkingHoursInSeconds;
      roundOffOvertimeBalance = Math.round(roundOffOvertimeBalance * 4) / 4;

      if (roundOffOvertimeBalance) {
        const userLeaveBalances = await LeaveBalance.findOne({
          user: user.userId,
          workspace: workspaceId,
        });

        if (!userLeaveBalances)
          throw new Error("User leave balances not found");
        const leaveBalanceData = userLeaveBalances.leaveBalance.find(
          (balance) => balance.type === "overtime"
        );

        if (!leaveBalanceData) throw new Error("Leave balance data not found");

        await Promise.all([
          LeaveHistory.create({
            action: "addedByAdmin",
            additionalInfo:
              "Leave balance updated through overtime calculation",
            author: adminId,
            leaveType: "overtime",
            leaveChangesCount: parseFloat(
              parseFloat(roundOffOvertimeBalance).toFixed(2)
            ),
            previousLeaveCount: leaveBalanceData.value,
            newLeaveCount:
              parseFloat(leaveBalanceData.value) +
              parseFloat(parseFloat(roundOffOvertimeBalance).toFixed(2)),
            user: user.userId,
            workspace: workspaceId,
          }),
          LeaveBalance.updateOne(
            {
              user: user.userId,
              workspace: workspaceId,
              "leaveBalance.type": "overtime",
            },
            {
              $inc: {
                "leaveBalance.$.value": parseFloat(
                  parseFloat(roundOffOvertimeBalance).toFixed(2)
                ),
              },
            }
          ),
        ]);
      }
    }
  } catch (error) {
    console.error("Error adding overtime balances:", error);
  }
};

// Deduct undertime from leave balances in the order: overtime -> casual -> leaveWithoutPay

const deductUndertimeBalances = async (workspaceId, userData, adminId) => {
  try {
    for (const user of userData) {
      const undertimeInSeconds =
        (user.undertime.hours || 0) * 3600 +
        (user.undertime.minutes || 0) * 60 +
        (user.undertime.seconds || 0);
      if (!undertimeInSeconds) continue;

      // Convert undertime to days (based on working hours per day)
      const workspace = await Workspace.findById(workspaceId).populate("rules");
      const { workingHours } = workspace.rules.find((rule) => rule.isActive);
      const secondsPerDay = workingHours * 3600;

      // Calculate total undertime in hours first
      const undertimeHours = undertimeInSeconds / 3600;

      // Apply the rounding logic directly
      let totalUndertimeDays;
      if (undertimeHours >= 8) totalUndertimeDays = 1;
      else if (undertimeHours >= 6) totalUndertimeDays = 0.75;
      else if (undertimeHours >= 4) totalUndertimeDays = 0.5;
      else if (undertimeHours >= 2) totalUndertimeDays = 0.25;
      else totalUndertimeDays = 0;

      let remainingUndertimeDays = totalUndertimeDays;
      const deductionDetails = [];

      const userLeaveBalances = await LeaveBalance.findOne({
        user: user.userId,
        workspace: workspaceId,
      });
      if (!userLeaveBalances) continue;

      // 1. First try to deduct from overtime
      const overtimeBalance = userLeaveBalances.leaveBalance.find(
        (b) => b.type === "overtime"
      );
      if (overtimeBalance && overtimeBalance.value > 0) {
        const overtimeToDeduct = Math.min(
          remainingUndertimeDays,
          overtimeBalance.value
        );

        if (overtimeToDeduct > 0) {
          await LeaveBalance.updateOne(
            {
              user: user.userId,
              workspace: workspaceId,
              "leaveBalance.type": "overtime",
            },
            {
              $inc: {
                "leaveBalance.$.value": -overtimeToDeduct,
              },
            }
          );

          deductionDetails.push({
            leaveType: "overtime",
            deductedDays: overtimeToDeduct,
          });
          remainingUndertimeDays -= overtimeToDeduct;
        }
      }

      // 2. Then try to deduct from casual leaves (if still remaining)
      if (remainingUndertimeDays > 0) {
        const casualBalance = userLeaveBalances.leaveBalance.find(
          (b) => b.type === "casual / Sick"
        );
        if (casualBalance && casualBalance.value > 0) {
          const casualToDeduct = Math.min(
            remainingUndertimeDays,
            casualBalance.value
          );

          if (casualToDeduct > 0) {
            await LeaveBalance.updateOne(
              {
                user: user.userId,
                workspace: workspaceId,
                "leaveBalance.type": "casual / Sick",
              },
              {
                $inc: {
                  "leaveBalance.$.value": -casualToDeduct,
                },
              }
            );

            deductionDetails.push({
              leaveType: "casual / Sick",
              deductedDays: casualToDeduct,
            });
            remainingUndertimeDays -= casualToDeduct;
          }
        }
      }

      // 3. Add any remaining undertime to leaveWithoutPay
      if (remainingUndertimeDays > 0) {
        const lwpBalance = userLeaveBalances.leaveBalance.find(
          (b) => b.type === "leaveWithoutPay"
        ) || { value: 0 };

        const newLwpValue = lwpBalance.value + remainingUndertimeDays;

        await Promise.all([
          LeaveHistory.create({
            action: "addedByAdmin",
            additionalInfo:
              "Leave balance updated through undertime calculation",
            author: adminId,
            leaveType: "leaveWithoutPay",
            leaveChangesCount: parseFloat(remainingUndertimeDays.toFixed(2)),
            previousLeaveCount: lwpBalance.value,
            newLeaveCount: parseFloat(newLwpValue.toFixed(2)),
            user: user.userId,
            workspace: workspaceId,
          }),
          LeaveBalance.updateOne(
            {
              user: user.userId,
              workspace: workspaceId,
              "leaveBalance.type": "leaveWithoutPay",
            },
            {
              $set: {
                "leaveBalance.$.value": parseFloat(newLwpValue.toFixed(2)),
              },
            }
          ),
        ]);

        deductionDetails.push({
          leaveType: "leaveWithoutPay",
          addedDays: remainingUndertimeDays,
        });
      }

      // Update the monthly report with deduction details
      await MonthlyReport.updateOne(
        {
          workspace: workspaceId,
          "report.userId": user.userId,
        },
        {
          $set: {
            "report.$.undertimeDeductionDetails": deductionDetails,
          },
        }
      );
    }
  } catch (error) {
    console.error("Error deducting undertime balances:", error);
    throw error;
  }
};

function preprocessDateString(dateStr) {
  if (dateStr.includes("GMT+")) {
    return dateStr.replace("GMT+", "GMT ");
  } else {
    return dateStr;
  }
}

// admin report
async function adminReport(req, res) {
  const {
    projectIds,
    userIds,
    startDate,
    endDate,
    shouldDownload,
    selectIsBillable,
  } = req.query;
  const workspaceId = req.user.currentWorkspace;
  const filter = {
    workspace: workspaceId,
  };

  if (projectIds) {
    filter.project = { $in: projectIds.split(",") };
  }

  if (userIds) {
    filter.user = { $in: userIds.split(",") };
  }

  if (selectIsBillable && selectIsBillable !== "All") {
    filter.isBillable = selectIsBillable;
  }
  // Convert to moment objects
  const uStart = moment(
    preprocessDateString(startDate),
    "ddd MMM DD YYYY HH:mm:ss [GMT]ZZ (z)"
  );
  const uEnd = moment(
    preprocessDateString(endDate),
    "ddd MMM DD YYYY HH:mm:ss [GMT]ZZ (z)"
  );

  // Start time to 12:00 AM
  const formattedStart = uStart.startOf("day").toISOString();

  // End time to 11:59:59 PM
  const formattedEnd = uEnd.endOf("day").toISOString();

  filter.startTime = {
    $gte: formattedStart,
    $lte: formattedEnd,
  };

  try {
    const workspace = await Workspace.findById(workspaceId)
      .select("timeZone")
      .lean();

    const entries = await Entry.find(filter)
      .populate({ path: "user", select: "name email" })
      .populate({ path: "project", select: "name description" });

    const userReports = {};

    entries.forEach((entry) => {
      const userId = entry.user?._id;
      const projectId = entry.project?._id;

      // Convert entry times to IST before extracting date parts
      // TODO:: Make this Dynamic to also handle different timezones to handle the report
      const startTime = moment.tz(entry.startTime, workspace.timeZone);
      const entryDate = startTime.format("YYYY-MM-DD");

      if (!userReports[userId]) {
        userReports[userId] = {
          totalHoursWorked: 0,
          numberOfProjects: new Set(),
          entries: {},
          userName: entry.user?.name,
          email: entry.user?.email,
          userId,
        };
      }

      if (Number(entry.durationInSeconds)) {
        userReports[userId].totalHoursWorked += entry.durationInSeconds;
      }

      userReports[userId].numberOfProjects.add(projectId);

      if (!userReports[userId].entries[entryDate]) {
        userReports[userId].entries[entryDate] = {
          startTime: entry.startTime,
          endTime: entry.endTime,
          hoursWorked: 0,
          totalEntries: [],
        };
      }

      if (Number.isFinite(entry.durationInSeconds)) {
        userReports[userId].entries[entryDate].hoursWorked +=
          entry.durationInSeconds;
      }
      userReports[userId].entries[entryDate].totalEntries.push(entry);
    });

    if (shouldDownload) {
      generateTimeSheet(
        userReports,
        uStart.format("YYYY-MM-DD"),
        uEnd.format("YYYY-MM-DD"),
        workspace.timeZone,
        res
      );
      return;
    }
    return res.json(userReports);
  } catch (error) {
    return res.status(400).send(error);
  }
}

// Helper function to convert seconds to HH:mm:ss
function formatDuration(seconds) {
  if (!Number.isFinite(seconds)) {
    return "N/A";
  }
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}


function generateTimeSheet(data, startDate, endDate, timeZone, res) {
  // Create a new instance of PDFDocument from the PDFKit library with a margin of 30 units.
  // This sets up a new PDF document that you can add content to.
  const doc = new PDFDocument({ margin: 30 });

  // Set the HTTP response header to indicate that the content type is a PDF file.
  // This tells the client's browser how to handle the response content.
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", 'attachment; filename="Time sheet.pdf"');
  doc.pipe(res);

  const tableStartX = 30;
  const cellWidths = [65, 65, 120, 230, 70];
  const headerRowHeight = 20;
  const minRowHeight = 20;

  // Modified drawCell function with border control and text wrapping
  // function drawCell(x, y, text, width, height, options = {}) {
  //   // Default true
  //   const drawBorder = options.drawBorder !== false;
  //   if (drawBorder) {
  //     doc.rect(x, y, width, height).strokeColor("#778899").stroke();
  //   }

  //   // Calculate required height for text
  //   const textHeight = doc.heightOfString(text, {
  //     width: width - 10,
  //     ...options,
  //   });

  //   // Draw text with vertical centering
  //   doc
  //     .fontSize(10)
  //     .fillColor("#444444")
  //     .text(text, x + 5, y + (height - textHeight) / 2 + 2, {
  //       width: width - 10,
  //       height: height - 4,
  //       align: options.align,
  //       lineBreak: true,
  //     });
  // }

  function drawCell(x, y, text, width, height, options = {}) {
    // Default drawBorder to true
    const drawBorder = options.drawBorder !== false;
    if (drawBorder) {
      doc.rect(x, y, width, height).strokeColor("#778899").stroke();
    }

    // Calculate the height required for the text given the available width.
    const textHeight = doc.heightOfString(text, {
      width: width - 10,
      ...options,
    });

    // If the text is too tall, start near the top; otherwise, vertically center it.
    const textY = textHeight > height ? y + 5 : y + (height - textHeight) / 2;

    // Draw the text
    doc
      .fontSize(10)
      .fillColor("#444444")
      .text(text, x + 5, textY, {
        width: width - 10,
        height: height - 4,
        align: options.align,
        lineBreak: true,
      });
  }

  // Iterate over each user
  Object.values(data).forEach((user, index) => {
    if (index !== 0) doc.addPage();

    const { userName, email, entries, totalHoursWorked } = user;

    doc
      .fontSize(8)
      .text(`${config.frontend_domain}: ${new Date().toDateString()}`, {
        align: "right",
      });
    doc.moveDown(1);

    doc
      .fontSize(14)
      .fillColor("#333333")
      .text(`Timesheet for ${userName}`, { align: "center" });
    doc.fontSize(12).text(`e-mail: ${email}`, { align: "center" });
    doc.moveDown(1);

    // Add bold "Report Period" text
    doc
      .font("Helvetica")
      .fontSize(12)
      .fillColor("#333333")
      .text("Report Period: ", { continued: true });

    doc
      .font("Helvetica-Bold")
      .fontSize(12)
      .fillColor("#333333")
      .text(`${startDate} to ${endDate}`);

    // Add bold "Total Hours" text
    doc
      .font("Helvetica")
      .fontSize(12)
      .fillColor("#333333")
      .text("Total Hours: ", { continued: true });

    // Add regular total hours range text
    doc
      .font("Helvetica-Bold")
      .fontSize(12)
      .fillColor("#333333")
      .text(`${formatDuration(totalHoursWorked)}`);

    doc.moveDown(0.2);
    doc.moveDown(1);

    const sortedDates = Object.keys(entries).sort(
      (a, b) => new Date(a) - new Date(b)
    );

    let totalDuration = 0;

    sortedDates.forEach((date) => {
      const day = entries[date];
      const dayTotalSeconds = day.hoursWorked;
      totalDuration += dayTotalSeconds;

      // **Calculate required space**
      const pageBottom = doc.page.height - 30;
      const currentY = doc.y;
      const requiredSpaceForHeadersAndRow = headerRowHeight + minRowHeight + 10; // Extra padding

      // **Check if there's enough space**
      if (
        currentY + requiredSpaceForHeadersAndRow + headerRowHeight >
        pageBottom
      ) {
        doc.addPage();
        doc.x = tableStartX;
        // Reset Y position to top margin
        doc.y = 30;
      }

      // Date section
      doc.x = tableStartX;
      doc
        .fontSize(12)
        .strokeColor("black")
        .fillColor("black")
        .text(`Date: ${date}`, { underline: true, align: "left" });
      let yPosition = doc.y;
      doc.moveDown(0.3);

      // Draw table headers with borders
      doc.font("Helvetica-Bold").fillColor("black");

      drawCell(
        tableStartX,
        yPosition,
        "Start Time",
        cellWidths[0],
        headerRowHeight
      );
      drawCell(
        tableStartX + cellWidths[0],
        yPosition,
        "End Time",
        cellWidths[1],
        headerRowHeight
      );
      drawCell(
        tableStartX + cellWidths[0] + cellWidths[1],
        yPosition,
        "Project",
        cellWidths[2],
        headerRowHeight
      );
      drawCell(
        tableStartX + cellWidths[0] + cellWidths[1] + cellWidths[2],
        yPosition,
        "Title",
        cellWidths[3],
        headerRowHeight
      );
      drawCell(
        tableStartX +
          cellWidths[0] +
          cellWidths[1] +
          cellWidths[2] +
          cellWidths[3],
        yPosition,
        "Duration",
        cellWidths[4],
        headerRowHeight,
        { align: "right" }
      );

      doc.y += headerRowHeight - 20;
      doc.moveDown(0.5);

      // Table rows for each entry
      day.totalEntries.forEach((entry, index) => {
        // For startTime
        // TODO:: Handle this dynamically for other time zones as well.
        const startTime = moment(entry.startTime)
          .tz(timeZone)
          .format("hh:mm A");

        // For endTime
        const endTime = entry.endTime
          ? moment(entry.endTime).tz(timeZone).format("hh:mm A")
          : "N/A";
        const duration = formatDuration(entry.durationInSeconds);

        // Modify your row height calculation to:
        const titleHeight =
          doc.heightOfString(entry.title, {
            width: cellWidths[3] - 10,
          }) + 4;

        // Modify your row height calculation to:
        const projectHeight =
          doc.heightOfString(entry.project.name, {
            width: cellWidths[2] - 10,
          }) + 4;

        const minHeight = Math.max(titleHeight, projectHeight);
        // Ensure the row height is at least minRowHeight
        // and rounded to the nearest 10
        // This ensures that the row height is always a multiple of 10
        const rowHeight = Math.max(
          minRowHeight,
          Math.ceil(minHeight / 10) * 10
        );

        // Check page space
        if (
          doc.y + rowHeight > pageBottom ||
          (day.totalEntries.length - 2 === index &&
            doc.y + rowHeight * 2 + 10 > pageBottom)
        ) {
          doc.addPage();
          yPosition = doc.y;
          // Re-draw headers on new page
          doc.font("Helvetica-Bold").fillColor("black");
          drawCell(
            tableStartX,
            yPosition,
            "Start Time",
            cellWidths[0],
            headerRowHeight
          );
          drawCell(
            tableStartX + cellWidths[0],
            yPosition,
            "End Time",
            cellWidths[1],
            headerRowHeight
          );
          drawCell(
            tableStartX + cellWidths[0] + cellWidths[1],
            yPosition,
            "Project",
            cellWidths[2],
            headerRowHeight
          );
          drawCell(
            tableStartX + cellWidths[0] + cellWidths[1] + cellWidths[2],
            yPosition,
            "Title",
            cellWidths[3],
            headerRowHeight
          );
          drawCell(
            tableStartX +
              cellWidths[0] +
              cellWidths[1] +
              cellWidths[2] +
              cellWidths[3],
            yPosition,
            "Duration",
            cellWidths[4],
            headerRowHeight,
            { align: "right" }
          );
          doc.y += 5;
        }

        yPosition = doc.y;

        // Draw cells without borders (except bottom line)
        doc
          .rect(
            tableStartX,
            yPosition,
            cellWidths.reduce((a, b) => a + b, 0),
            rowHeight
          )
          .strokeColor("#e0e0e0")
          .lineWidth(0.5)
          .stroke();

        // Draw content
        doc.font("Helvetica").fillColor("black");
        drawCell(tableStartX, yPosition, startTime, cellWidths[0], rowHeight, {
          drawBorder: false,
        });
        drawCell(
          tableStartX + cellWidths[0],
          yPosition,
          endTime,
          cellWidths[1],
          rowHeight,
          {
            drawBorder: false,
          }
        );
        drawCell(
          tableStartX + cellWidths[0] + cellWidths[1],
          yPosition,
          entry.project.name,
          cellWidths[2],
          rowHeight,
          {
            drawBorder: false,
          }
        );
        drawCell(
          tableStartX + cellWidths[0] + cellWidths[1] + cellWidths[2],
          yPosition,
          entry.title,
          cellWidths[3],
          rowHeight,
          {
            drawBorder: false,
          }
        );
        drawCell(
          tableStartX +
            cellWidths[0] +
            cellWidths[1] +
            cellWidths[2] +
            cellWidths[3],
          yPosition,
          duration,
          cellWidths[4],
          rowHeight,
          {
            align: "right",
            drawBorder: false,
          }
        );
        doc.y += rowHeight - 15;
      });

      // Daily total
      doc.font("Helvetica-Bold").fillColor("#555555");
      doc.text(
        `Total: ${formatDuration(dayTotalSeconds)}`,
        tableStartX + cellWidths[0] + cellWidths[1] + cellWidths[2],
        doc.y + 10,
        { align: "right" }
      );
      doc.moveDown(2);
    });
  });

  doc.end();
}

async function generateEncashMentReport(req, res) {
  const { encashmentLeaves, selectedLeaveType } = req.body.data;

  try {
    if (
      encashmentLeaves === undefined ||
      Number(encashmentLeaves) <= 0 ||
      selectedLeaveType.length === 0
    ) {
      return res.status(400).json({ message: "Invalid request" });
    }

    const encashLeaveLimit = Number(encashmentLeaves);
    const workspaceId = req.user.currentWorkspace;

    // Prepare leave type priority: overtime first
    const sortedLeaveTypes = [
      ...selectedLeaveType.filter((type) => type === "overtime"),
      ...selectedLeaveType.filter((type) => type !== "overtime"),
    ];

    const users = await User.find({ workspaces: { $in: [workspaceId] } })
      .select("name email leaveBalance")
      .populate({
        path: "leaveBalance",
        match: { workspace: workspaceId },
        select: "leaveBalance workspace",
      });

    const encashmentResults = [];

    for (const user of users) {
      const leaveBalanceDoc = user.leaveBalance[0];
      if (!leaveBalanceDoc) continue;

      // Calculate total leave available for selected leave types
      const totalLeaveAvailable = leaveBalanceDoc.leaveBalance
        .filter((leave) => selectedLeaveType.includes(leave.type))
        .reduce((sum, leave) => sum + leave.value, 0);

      // Skip user if total available ≤ encashLeaveLimit
      if (totalLeaveAvailable <= encashLeaveLimit) continue;

      // Now proceed with deduction
      const userEncashment = {
        user: user.name,
        email: user.email,
        leaves: [],
        deductionDetail: [],
      };

      let totalAvailable = 0;
      let totalEncashable = 0;
      let totalRemaining = 0;
      let encashableLeaves = totalLeaveAvailable - encashLeaveLimit;

      // Prioritize deductions based on sortedLeaveTypes order
      for (const type of sortedLeaveTypes) {
        const leave = leaveBalanceDoc.leaveBalance.find((l) => l.type === type);
        if (!leave) continue;

        const available = leave.value;
        let deduction = 0;

        if (encashableLeaves > 0) {
          deduction = Math.min(available, encashableLeaves);
          encashableLeaves -= deduction;
        }

        totalAvailable += available;
        totalEncashable += deduction;
        totalRemaining += available - deduction;

        userEncashment.leaves.push({
          leaveType: leave.type,
          available,
          encashed: deduction,
          remaining: available - deduction,
        });

        if (deduction > 0) {
          userEncashment.deductionDetail.push({
            leaveType: leave.type,
            deducted: deduction,
          });
        }
      }

      userEncashment.totalAvailable = totalAvailable;
      userEncashment.totalEncashable = totalEncashable;
      userEncashment.totalRemaining = totalRemaining;

      encashmentResults.push(userEncashment);
    }

    res.status(200).json({
      message: "Leave encashment report generated successfully",
      encashmentResults,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to generate encashment report",
    });
  }
}

async function saveEncashmentReport(req, res) {
  const { encashmentResults } = req.body;

  try {
    if (!Array.isArray(encashmentResults) || encashmentResults.length === 0) {
      return res.status(400).json({ message: "No encashment data provided" });
    }

    const workspaceId = req.user.currentWorkspace;
    const encashedBy = req.user._id;

    const saveOperations = [];

    for (const result of encashmentResults) {
      // Find user by email
      const user = await User.findOne({ email: result.email })
        .select("_id")
        .lean();
      if (!user) continue;

      // Map leaves to encashment history schema
      const leavesToSave = result.leaves.map((leave) => ({
        leaveType: leave.leaveType,
        available: leave.available,
        encashed: leave.encashed,
        remaining: leave.remaining,
      }));

      // Map deduction details
      const deductionDetailToSave = result.deductionDetail.map((desc) => ({
        leaveType: desc.leaveType,
        deducted: desc.deducted,
      }));

      // Save encashment history record
      const encashmentRecord = new LeaveEncashmentHistory({
        user: user._id,
        workspace: workspaceId,
        leaves: leavesToSave,
        deductionDetail: deductionDetailToSave,
        totalAvailable: result.totalAvailable,
        totalEncashable: result.totalEncashable,
        totalRemaining: result.totalRemaining,
        encashedBy,
      });

      saveOperations.push(encashmentRecord.save());

      // Update leave balance
      const userLeaveBalance = await LeaveBalance.findOne({
        user: user._id,
        workspace: workspaceId,
      });

      if (!userLeaveBalance) continue;

      for (const deduction of result.deductionDetail) {
        const leaveBalanceItem = userLeaveBalance.leaveBalance.find(
          (l) => l.type === deduction.leaveType
        );

        if (leaveBalanceItem) {
          const previousValue = leaveBalanceItem.value;
          const deducted = deduction.deducted;
          const newValue = Math.max(0, previousValue - deducted);

          // Update leave balance value
          leaveBalanceItem.value = newValue;

          // Save corresponding leave history entry
          const leaveHistoryRecord = new LeaveHistory({
            action: "reduced",
            additionalInfo: `Leave encashed by admin.`,
            leaveType: deduction.leaveType,
            leaveChangesCount: deducted,
            previousLeaveCount: previousValue,
            newLeaveCount: newValue,
            user: user._id,
            author: encashedBy,
            workspace: workspaceId,
          });

          saveOperations.push(leaveHistoryRecord.save());
        }
      }

      await userLeaveBalance.save();
    }

    await Promise.all(saveOperations);

    res.status(201).json({
      message: "Encashment records, balances, and history saved successfully",
      savedCount: saveOperations.length,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to save encashment records" });
  }
}
async function getEncashmentReport(req, res) {
  try {
    const workspaceId = req.user.currentWorkspace;

    const [workspace, encashmentRecords] = await Promise.all([
      Workspace.findById(workspaceId).select("timeZone").lean(),
      LeaveEncashmentHistory.find({ workspace: workspaceId })
        .populate("user", "name email")
        .select(
          "user leaves deductionDetail totalAvailable totalEncashable totalRemaining encashedAt"
        )
        .sort({ encashedAt: -1 })
        .lean(),
    ]);

    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    const { timeZone } = workspace;

    const reportMap = encashmentRecords.reduce((acc, record) => {
      const encashedAtKey = dayjs(record.encashedAt)
        .tz(timeZone)
        .format("DD/MM/YYYY");

      if (!acc.has(encashedAtKey)) {
        acc.set(encashedAtKey, {
          encashedAt: encashedAtKey,
          employees: [],
        });
      }

      const selectedLeaveTypes = record.leaves
        .map((l) => l.leaveType)
        .join(", ");
      const deductedFrom = record.deductionDetail
        .map((d) => `${d.leaveType}: ${d.deducted}`)
        .join(", ");

      acc.get(encashedAtKey).employees.push({
        employee: record.user.name,
        email: record.user.email,
        selectedLeaveTypes,
        deductedFrom,
        previousLeave: record.totalAvailable,
        encashedLeave: record.totalEncashable,
        leaveAfterEncashment: record.totalRemaining,
      });

      return acc;
    }, new Map());

    const formattedReport = Array.from(reportMap.values()).map((group) => ({
      userAffected: group.employees.length,
      encashedAt: group.encashedAt,
      employees: group.employees,
    }));

    res.status(200).json({
      message: "Encashment report fetched successfully",
      report: formattedReport,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to fetch encashment report",
    });
  }
}

module.exports = {
  getProjectDetailsByName,
  getProjectDetailsByClientName,
  getProjectReport,
  getUserReport,
  report,
  generateMonthlyReport,
  savingMonthlyReport,
  adminReport,
  generateEncashMentReport,
  saveEncashmentReport,
  getEncashmentReport,
};
