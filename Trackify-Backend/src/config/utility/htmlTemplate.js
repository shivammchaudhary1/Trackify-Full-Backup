const { config } = require("../env/default.js");

// function baseTemplate({userName, title, bodyContent }) {
//   const logoUrl = config.logo;
//  return `
//   <div style="max-width: 720px; margin: auto; font-family: 'Segoe UI', sans-serif; border: 1px solid #d6d6d6; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
    
//     <!-- Header -->
//     <div style="background-color: #f8f9fa; text-align: center; padding: 30px 20px;">
      
//       <!-- Logo Container -->
      // <div style="width: 150px; height: 50px; margin: 0 auto; overflow: hidden;">
      //   <img 
      //     src="${logoUrl}" 
      //     alt="Trackify" 
      //     style="width: 100%; height: 100%; object-fit: cover; display: block;"
      //   />
      // </div>

//       <!-- Title -->
//       <h2 style="color: #373643; margin: 20px 0 0; font-size: 24px;">${title}</h2>
//     </div>

//     <!-- Body -->
//     <div style="background-color: #18CB96; padding: 35px 30px; font-size: 16px; color: #333333;">
//       ${bodyContent}
//     </div>

//     <!-- Footer -->
//     <div style="background-color: #373643; text-align: center; padding: 20px;">
//       <p style="color: white; margin: 0; font-size: 14px;">
//         Need help? Contact us at<br />
//         <a href="mailto:support@trackify.ai" style="color: white; text-decoration: underline;">support@trackify.ai</a>
//       </p>
//     </div>
//   </div>`;
// }

// function baseTemplate({ userName, title, bodyContent }) {
//   const logoUrl = config.logo;
//   return `
//   <div style="background-color:#f6f8fa; padding:32px 0; width:100%;">
//     <!-- Preheader (hidden in email body, shown in inbox preview) -->
//     <div style="display:none; max-height:0; overflow:hidden; color:transparent; visibility:hidden; mso-hide:all;">
//       ${title} - Trackify
//     </div>
//     <div style="max-width:720px; margin:0 auto; font-family:'Segoe UI',sans-serif; border:1px solid #e0e0e0; border-radius:10px; overflow:hidden; box-shadow:0px 4px 12px rgba(0,0,0,0.1); background:#fff;">
      
//       <!-- Header -->
//       <div style="background-color:#f4f4f4; text-align:center; padding:30px;">
//         <div style="width:150px; height:50px; margin:0 auto; overflow:hidden;">
//           <img 
//             src="${logoUrl}" 
//             alt="Trackify company logo" 
//             style="width:100%; height:100%; object-fit:cover; display:block;"
//           />
//         </div>
//         <h1 style="color:#18CB96; font-size:26px; margin:0;">${title}</h1>
//       </div>
      
//       <!-- Body -->
//       <div style="background-color:#ffffff; padding:30px; font-size:16px; color:#373643; line-height:1.5;">
//         ${userName ? `<p style="margin:0 0 20px; font-weight:500;">Hello ${userName},</p>` : ''}
//         ${bodyContent}
//       </div>
      
//       <!-- Footer -->
//       <div style="background-color:#373643; text-align:center; padding:20px;">
//         <p style="color:#ffffff; margin:0; font-size:14px;">
//           Need help? Contact us at<br/>
//           <a href="mailto:support@trackify.ai" style="color:#ffffff; text-decoration:underline;">support@trackify.ai</a>
//         </p>
//         <p style="color:#bbbbbb; margin:10px 0 0 0; font-size:12px;">
//           &copy; ${new Date().getFullYear()} Trackify. All rights reserved.
//         </p>
//       </div>
//     </div>
//   </div>`;
// }

function baseTemplate({ userName, title, bodyContent }) {
  const logoUrl = config.logo;
  return `
  <div style="background-color:#f6f8fa; padding:32px 0; width:100%;">
    <!-- Preheader (hidden in email body, shown in inbox preview) -->
    <div style="display:none; max-height:0; overflow:hidden; color:transparent; visibility:hidden; mso-hide:all;">
      ${title} - Trackify
    </div>
    <div style="max-width:720px; margin:0 auto; font-family:'Segoe UI',sans-serif; border:1px solid #e0e0e0; border-radius:10px; overflow:hidden; box-shadow:0px 4px 12px rgba(0,0,0,0.1); background:#fff;">
      
      <!-- Header -->
      <div style="background-color:#f4f4f4; text-align:center; padding:30px;">
        <div style="width:150px; height:50px; margin:0 auto; overflow:hidden;">
          <img 
            src="${logoUrl}" 
            alt="Trackify company logo" 
            style="width:100%; height:100%; object-fit:cover; display:block;"
          />
        </div>
        <h1 style="color:#18CB96; font-size:26px; margin:0;">${title}</h1>
      </div>
      
      <!-- Body -->
      <div style="background-color:#ffffff; padding:30px; font-size:16px; color:#373643; line-height:1.5;">
        ${userName ? `<p style="margin:0 0 20px; font-weight:500;">Hello ${userName},</p>` : ''}
        ${bodyContent}
      </div>
      
      <!-- Footer -->
      <div style="background-color:#373643; text-align:center; padding:20px;">
        <p style="color:#ffffff; margin:0; font-size:14px;">
          Need help? Contact us at<br/>
          <a href="mailto:support@trackify.ai" style="color:#ffffff; text-decoration:underline;">support@trackify.ai</a>
        </p>
        <p style="color:#bbbbbb; margin:10px 0 0 0; font-size:12px;">
          &copy; ${new Date().getFullYear()} Trackify. All rights reserved.
        </p>
      </div>
    </div>
  </div>`;
}



function generateInviteHtmlTemplate(domain, link) {
  return baseTemplate({
    domain,
    title: "Workspace Invitation",
    bodyContent: `
      <p>Hello there,<br /><br />Someone has invited you to join their workspace.<br /><br />
      Click the button below to accept the invitation:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${link}" style="display: inline-block; background-color: #373643; color: white; text-decoration: none; padding: 12px 30px; border-radius: 30px; font-size: 16px;">Join Workspace</a>
      </div>
    `,
  });
}

function invitationConfirmationHTMLTemplate(domain, link, email, randomPassword, shouldIncludeCredentials) {
  const credentialsText = shouldIncludeCredentials
    ? `Email: <span style="color: #236fa1">${email}</span><br />
       Password: <span style="color: #236fa1">${randomPassword}</span><br />`
    : `Email: <span style="color: #236fa1">${email}</span><br />
       Password: <span style="color: #236fa1">Use your existing Trackify AI password</span><br />`;

  return baseTemplate({
    domain,
    title: "Join Workspace",
    bodyContent: `
      <p>Your workspace is ready!<br />Use the credentials below to log in:</p>
      <p>${credentialsText}</p>
      <i style="color: #666; font-size: 14px;">You can change your password in the profile section.</i>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${link}" style="display: inline-block; background-color: #373643; color: white; text-decoration: none; padding: 12px 30px; border-radius: 30px; font-size: 16px;">Login</a>
      </div>
    `,
  });
}

function leaveNotificationEmailTemplate({ adminName, userName, leaveType, startDate, endDate, title, domain = "https://beta.trackify.ai" }) {
  return baseTemplate({
    domain,
    title: "Leave Application Notification",
    bodyContent: `
      <p>Hello ${adminName},<br /><br />The following employee has applied for leave:</p>
      <ul>
        <li><strong>Employee Name:</strong> ${userName}</li>
        <li><strong>Leave Type:</strong> ${leaveType}</li>
        <li><strong>Start Date:</strong> ${startDate}</li>
        <li><strong>End Date:</strong> ${endDate}</li>
        <li><strong>Reason:</strong> ${title}</li>
      </ul>
      <p>Please take the necessary action and respond accordingly.</p>
      <p style="color: #888; font-size: 12px;">This is an automated email. Please do not reply.</p>
    `,
  });
}

function leaveApplicationConfirmationEMailTemplate(leaveDetails, rejectionReason = null, formatDate) {
  const statusText = rejectionReason
    ? "Leave Request Rejected"
    : "Leave Request Approved";
  const actionText = rejectionReason
    ? `<p>We regret to inform you that your leave request has been rejected. Here are the details:</p>`
    : `<p>Your leave request has been approved. Here are the details:</p>`;

  return baseTemplate({
    domain: "https://trackify.ai",
    title: statusText,
    bodyContent: `
      ${actionText}
      <ul>
        <li><strong>Title:</strong> ${leaveDetails.title}</li>
        <li><strong>Leave Type:</strong> ${leaveDetails.type}</li>
        <li><strong>Number of Days:</strong> ${leaveDetails.numberOfDays}</li>
        <li><strong>Start Date:</strong> ${formatDate(leaveDetails.startDate)}</li>
        <li><strong>End Date:</strong> ${formatDate(leaveDetails.endDate)}</li>
      </ul>
      ${
        rejectionReason
          ? `<p>If you have any questions, please contact the HR department.</p>`
          : ""
      }
      <p style="color: #888; font-size: 12px;">This is an automated email. Please do not reply.</p>
    `,
  });
}

// function mayBeSendBirthdayEmailTemplate(userName) {
//   return baseTemplate({
//     userName,
//     title: "Trackify Wishes You!",
//     bodyContent: `
//       <div style="text-align: center;">
//         <h1 style="color: #18CB96; font-size: 28px;">🎂 Happy Birthday ${userName}!</h1>
//         <p style="font-size: 16px;">We hope your day is as amazing as you are.<br />
//         May your year be full of joy, success, and new adventures. 🥳</p>
//         <p style="font-size: 14px;">Enjoy your special day to the fullest! 💐</p>
//       </div>
//     `,
//   });
// }

function mayBeSendBirthdayEmailTemplate(userName) {
  return baseTemplate({
    userName,
    title: "Best Wishes on Your Birthday!",
    bodyContent: `
      <div style="text-align: center;">
        <p style="font-size: 15px; color: #373643;">Wishing you a very Happy Birthday!.</p>
        <p style="font-size: 15px; color: #373643;">May the year ahead bring you continued success, good health, and happiness.</p>
      </div>
    `,
  });
}


function userBirthdaySummaryToAdminEmailTemplate({ domain = "https://beta.trackify.ai", users, workspaceName }) {
  const rows = users.map((u, i) => `
    <tr style="background-color: ${i % 2 === 0 ? '#fff' : '#f9f9f9'};">
      <td style="padding: 10px; border: 1px solid #ccc;">${u.name}</td>
      <td style="padding: 10px; border: 1px solid #ccc;">${u.email}</td>
    </tr>
  `).join("");

  return baseTemplate({
    domain,
    title: "Birthday Summary",
    bodyContent: `
      <p>Dear Admin,<br /><br />Here's the list of team members celebrating their birthday today in workspace <b>${workspaceName}</b> :</p>
      <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
        <thead style="background-color: #373643; color: white;">
          <tr>
            <th style="padding: 10px; border: 1px solid #ccc;">Name</th>
            <th style="padding: 10px; border: 1px solid #ccc;">Email</th>
          </tr>
        </thead>
        <tbody>
          ${rows || `<tr><td colspan="2" style="text-align:center; padding: 20px;">No birthdays today.</td></tr>`}
        </tbody>
      </table>
    `,
  });
}
function forgotPasswordEmailTemplate(domain, link) {
  const trackifyDomain = domain.includes("localhost") ? "https://demo.trackify.ai" : domain;
  
  return baseTemplate({
    domain: trackifyDomain,
    title: "Reset Your Password",
    bodyContent: `
      <p>Hello,<br /><br />
      You recently requested to reset your password for your Trackify account. Click the button below to reset it.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${link}" style="display: inline-block; background-color: #373643; color: white; text-decoration: none; padding: 12px 30px; font-size: 16px; border-radius: 30px;">
          Reset Password
        </a>
      </div>
      <p style="margin-top: 20px; color: #555; font-size: 14px;">
        If you didn't request a password reset, you can safely ignore this email.
      </p>
    `
  });
}
module.exports = {
  forgotPasswordEmailTemplate,
  generateInviteHtmlTemplate,
  invitationConfirmationHTMLTemplate,
  leaveNotificationEmailTemplate,
  leaveApplicationConfirmationEMailTemplate,
  mayBeSendBirthdayEmailTemplate,
  userBirthdaySummaryToAdminEmailTemplate
};
