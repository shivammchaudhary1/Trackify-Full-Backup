const PDFDocument = require("pdfkit");
const fs = require("fs");

// Helper function to format ISO date to readable string
function formatDate(isoString) {
  return new Date(isoString).toTimeString();
}

// Helper function to convert seconds to HH:mm:ss
function formatDuration(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

function generateAdminReportPDF(data, startDate, endDate, res) {
  const doc = new PDFDocument({ margin: 50 });

  // Set response headers for PDF download
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", 'attachment; filename="Time sheet.pdf"');
  doc.pipe(res);

  const tableStartX = 50;
  const cellWidths = [80, 80, 80, 200, 60];
  const headerRowHeight = 20;
  const minRowHeight = 20;

  // Modified drawCell function with border control and text wrapping
  function drawCell(x, y, text, width, height, options = {}) {
    // Default true
    const drawBorder = options.drawBorder !== false;
    if (drawBorder) {
      doc.rect(x, y, width, height).stroke();
    }

    // Calculate required height for text
    const textHeight = doc.heightOfString(text, {
      width: width - 10,
      ...options,
    });

    // Draw text with vertical centering
    doc.fontSize(10).text(text, x + 5, y + (height - textHeight) / 2 + 2, {
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

    doc.fontSize(14).text(`Timesheet for ${userName}`, { align: "center" });
    doc.fontSize(12).text(`e-mail: ${email}`, { align: "center" });
    doc.moveDown(1);

    doc
      .fontSize(12)
      .fillColor("#222222")
      .text(
        `Report Period: ${new Date(startDate).toDateString()} - ${new Date(
          endDate
        ).toDateString()}`
      );
    doc.moveDown(0.2);
    doc
      .fontSize(12)
      .fillColor("#222222")
      .text(`Total Hours: ${formatDuration(totalHoursWorked)}`);

    doc.moveDown(1);

    const sortedDates = Object.keys(entries).sort(
      (a, b) => new Date(a) - new Date(b)
    );

    let totalDuration = 0;

    sortedDates.forEach((date) => {
      const day = entries[date];
      const dayTotalSeconds = day.hoursWorked;
      totalDuration += dayTotalSeconds;

      // Date section
      doc.x = tableStartX;
      doc
        .fontSize(12)
        .strokeColor("black")
        .fillColor("black")
        .text(`Date: ${date}`, { underline: true, align: "left" });
      doc.moveDown();

      // Calculate available height for content
      let yPosition = doc.y;
      const pageBottom = doc.page.height - 70;

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
      day.totalEntries.forEach((entry) => {
        const startTime = new Date(entry.startTime).toLocaleTimeString();
        const endTime = entry.endTime
          ? new Date(entry.endTime).toLocaleTimeString()
          : "N/A";
        const duration = formatDuration(entry.durationInSeconds);

        // Calculate required row height
        // const titleHeight =
        //   doc.heightOfString(entry.title, {
        //     width: cellWidths[2] - 10,
        //   }) + 4;

        // Modify your row height calculation to:
        const titleHeight =
          doc.heightOfString(entry.title, {
            width: cellWidths[3] - 10, // Make sure this matches your title column width
          }) + 4; // Add small padding

        // const rowHeight = Math.max(minRowHeight, titleHeight);
        const rowHeight = Math.max(
          minRowHeight,
          Math.ceil(titleHeight / 10) * 10
        ); // Round to nearest 10px

        // Check page space
        if (doc.y + rowHeight > pageBottom) {
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
          doc.y += headerRowHeight;
          doc.moveDown(0.5);
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
      doc.font("Helvetica-Bold").fillColor("blue");
      doc.text(
        `Daily Total: ${formatDuration(dayTotalSeconds)}`,
        tableStartX + cellWidths[0] + cellWidths[1] + cellWidths[2],
        doc.y + 10,
        { align: "right" }
      );
      doc.moveDown(2);
    });
  });

  doc.end();
}
module.exports = {
  generateAdminReportPDF,
};
