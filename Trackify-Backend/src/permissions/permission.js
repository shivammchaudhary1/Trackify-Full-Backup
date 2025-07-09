const { USER_ROLES } = require("./role.js");

/**
 * Permissions Map (ACL-style config for runtime Casbin policy setup)
 *
 * roles: array of roles this permission block applies to
 * allows: array of resource-action permissions for those roles
 */
const permissions = [
  {
    roles: [USER_ROLES.guest],
    allows: [
      //auth route
      { resource: "/api/auth/login", actions: ["post"] },
      //user route
      { resource: "/api/user/create", actions: ["post"] },
      { resource: "/api/user/accept-invitation/:token", actions: ["post"] },
      // profile route
      { resource: "/api/profile/forget-password", actions: ["post"] },
      {
        resource: "/api/profile/forget-password/:id/:token",
        actions: ["post"],
      },
    ],
  },
  {
    roles: [USER_ROLES.admin, USER_ROLES.user],
    allows: [
      { resource: "/api/profile/demo-state", actions: ["get", "patch"] },
      { resource: "/api/auth/logout", actions: ["post"] },
      { resource: "/api/auth/isAuthenticated", actions: ["post"] },
      //profile route
      { resource: "/api/profile/changeTheme", actions: ["patch"] },
      { resource: "/api/profile/update-profile", actions: ["patch"] },
      { resource: "/api/profile/change-password/:id", actions: ["patch"] },
      //user route
      {
        resource: "/api/user/entries",
        actions: ["get"],
      },
      {
        resource: "/api/user/entry/delete",
        actions: ["delete"],
      },
      {
        resource: "/api/user/entry/edit/:entryId",
        actions: ["patch"],
      },
      {
        resource: "/api/user/entry/title",
        actions: ["patch"],
      },
      { resource: "/api/user/assets", actions: ["get", "post"] },
      {
        resource: "/api/user/assets/update",
        actions: ["patch"],
      },
      {
        resource: "/api/user/assets/delete",
        actions: ["delete"],
      },
      //timer route
      {
        resource: "/api/timer/timer-actions/start",
        actions: ["post"],
      },
      {
        resource: "/api/timer/timer-actions/stop",
        actions: ["post"],
      },
      {
        resource: "/api/timer/timer-actions/pause",
        actions: ["patch"],
      },
      {
        resource: "/api/timer/timer-actions/resume",
        actions: ["patch"],
      },
      {
        resource: "/api/timer/timer-actions/manualEntry/:userId",
        actions: ["post"],
      },
      {
        resource: "/api/timer/entries/get-entries/:lastFetchedDate",
        actions: ["get"],
      },
      {
        resource: "/api/timer/entries/billable/nonBillable/:entryId",
        actions: ["patch"],
      },
      {
        resource: "/api/timer/entries/billable/bulk-update",
        actions: ["patch"],
      },
      //workspace route
      {
        resource:
          "/api/workspace/workspace-actions/switch/:userId/:workspaceId",
        actions: ["patch"],
      },
      // File Routes
      {
        resource: "/api/file/files",
        actions: ["get", "put", "delete"],
      },
      {
        resource: "/api/profile/picture",
        actions: ["put", "delete"],
      },
      {
        resource: "/api/timer/entries/billable/nonBillable/:entryId",
        actions: ["patch"],
      },
    ],
  },
  {
    roles: [USER_ROLES.admin],
    allows: [
      //client route
      { resource: "/api/client/create", actions: ["post"] },
      { resource: "/api/client/get-all", actions: ["get"] },
      { resource: "/api/client/update/:clientId", actions: ["patch"] },
      { resource: "/api/client/delete/:clientId", actions: ["delete"] },
      //leave route
      { resource: "/api/leave/getallleaves/:userId", actions: ["get"] },
      { resource: "/api/leave/updatestatus", actions: ["patch"] },
      {
        resource: "/api/leave/getuserleavebalance/:userId/:workspaceId",
        actions: ["get"],
      },
      //project route
      { resource: "/api/projects/create", actions: ["post"] },
      { resource: "/api/projects/all", actions: ["get"] },
      {
        resource: "/api/projects/projectlistforworkspace/:id",
        actions: ["get"],
      },
      { resource: "/api/projects/project/:id", actions: ["get"] },
      { resource: "/api/projects/update/:id", actions: ["patch"] },
      { resource: "/api/projects/delete/:id", actions: ["delete"] },
      { resource: "/api/projects/team/:id", actions: ["get"] },
      { resource: "/api/projects/addmember/:id", actions: ["patch"] },
      { resource: "/api/projects/removemember/:id", actions: ["delete"] },
      //leave route
      { resource: "/api/leave-autoadd/create", actions: ["post"] },
      { resource: "/api/leave-autoadd/get-all", actions: ["get"] },
      {
        resource: "/api/leave-autoadd/update/:leaveSettingId",
        actions: ["patch"],
      },
      {
        resource: "/api/leave-autoadd/enable/:leaveSettingId",
        actions: ["patch"],
      },
      {
        resource: "/api/leave-autoadd/disable/:leaveSettingId",
        actions: ["patch"],
      },
      {
        resource: "/api/leave-autoadd/delete/:leaveSettingId",
        actions: ["delete"],
      },
      { resource: "/api/leave-autoadd/get/:leaveSettingId", actions: ["get"] },
      { resource: "/api/leave/createleave", actions: ["post"] },
      { resource: "/api/leave/getleaves/:userId", actions: ["get"] },
      { resource: "/api/leave/updateleave", actions: ["patch"] },
      { resource: "/api/leave/deleteleave", actions: ["delete"] },
      {
        resource: "/api/holiday/getleavebalances/:workspaceId",
        actions: ["get"],
      },
      //leave history route
      { resource: "/api/leave-history/get-all/:workspaceId", actions: ["get"] },
      //holiday route
      { resource: "/api/holiday/updateleavebalance", actions: ["patch"] },
      {
        resource: "/api/holiday/updateleavebalancetoallusers",
        actions: ["patch"],
      },
      { resource: "/api/holiday/addleavetype", actions: ["post"] },
      { resource: "/api/holiday/deleteleavetype", actions: ["delete"] },
      { resource: "/api/holiday/updateleavetype", actions: ["patch"] },
      { resource: "/api/holiday/get-user-holidays", actions: ["get"] },
      { resource: "/api/holiday/getleavetypes/:userId", actions: ["get"] },
      //rule route
      { resource: "/api/rule/create", actions: ["post"] },
      { resource: "/api/rule/update", actions: ["patch"] },
      { resource: "/api/rule/get/:workspaceId", actions: ["get"] },
      { resource: "/api/rule/delete", actions: ["delete"] },
      { resource: "/api/rule/toggleOvertime", actions: ["patch"] },
      //report route
      {
        resource: "/api/reports/admin-report",
        actions: ["get"],
      },
      {
        resource: "/api/reports/monthlyreport/:workspaceId",
        actions: ["post"],
      },
      {
        resource: "/api/reports/userreport",
        actions: ["get"],
      },
      {
        resource: "/api/reports/admin-encashment-report",
        actions: ["post"],
      },
      {
        resource: "/api/reports/admin-encashed-leave-report",
        actions: ["post"],
      },
      {
        resource: "/api/reports/admin-get-saved-encashed-leave-report",
        actions: ["get"],
      },
      //user route
      {
        resource: "/api/user/user-actions/read/:userId",
        actions: ["get"],
      },
      {
        resource: "/api/user/user-actions/change-role",
        actions: ["patch"],
      },
      {
        resource: "/api/user/user-actions/change-status",
        actions: ["patch"],
      },
      {
        resource: "/api/user/invite",
        actions: ["post"],
      },
      {
        resource: "/api/user/users/all",
        actions: ["get"],
      },
      {
        resource: "/api/user/deleteuserfromworkspace/:workspaceId",
        actions: ["delete"],
      },
      //workspace route
      {
        resource: "/api/workspace/create",
        actions: ["post"],
      },
      {
        resource: "/api/workspace/workspace-actions/delete/:workspaceId",
        actions: ["delete"],
      },
      {
        resource: "/api/workspace/workspace-actions/update/:workspaceId",
        actions: ["patch"],
      },
      {
        resource: "/api/workspace/edittimer",
        actions: ["patch"],
      },
      {
        resource: "/api/reports/savingmonthlyreport/:userId/:workspaceId",
        actions: ["post"],
      },
    ],
  },
  {
    roles: [USER_ROLES.user],
    allows: [
      //home route
      { resource: "/get-all/:workspaceId", actions: ["get"] },
      //holiday route
      { resource: "/api/holiday/requestholiday", actions: ["post"] },
      { resource: "/api/holiday/get-user-holidays", actions: ["get"] },
      { resource: "/api/holiday/updateholiday", actions: ["patch"] },
      { resource: "/api/holiday/deleteholiday/:id", actions: ["delete"] },

      { resource: "/api/holiday/getleavetypes/:userId", actions: ["get"] },
      {
        resource: "/api/holiday/getleavebalances/:workspaceId",
        actions: ["get"],
      },
      //leave history route
      { resource: "/api/leave-history/get-all/:workspaceId", actions: ["get"] },
      { resource: "/api/leave/createleave", actions: ["post"] },

      {
        resource: "/api/leave/getuserleavebalance/:userId/:workspaceId",
        actions: ["get"],
      },
      { resource: "/api/leave/getleaves/:userId", actions: ["get"] },
      //rule route
      { resource: "/api/rule/get/:workspaceId", actions: ["get"] },
      //report route
      {
        resource: "/api/reports/projectbyname",
        actions: ["get"],
      },
      {
        resource: "/api/reports/projectbyclientname",
        actions: ["get"],
      },
      {
        resource: "/api/reports/projectreport/:id",
        actions: ["get"],
      },
      {
        resource: "/api/reports/projectreport/:id",
        actions: ["get"],
      },
      {
        resource: "/api/reports/user/:userId",
        actions: ["get"],
      },
      {
        resource: "/api/reports/userreport",
        actions: ["get"],
      },
      {
        resource: "/api/reports/monthlyreport/:workspaceId",
        actions: ["post"],
      },
      {
        resource: "/api/reports/savingmonthlyreport/:userId/:workspaceId",
        actions: ["post"],
      },
      //project route
      { resource: "/api/projects/all", actions: ["get"] },
    ],
  },
];

module.exports = {
  permissions,
};
