// Migration script `migrateLeaveTypeToAddIsActiveKey` Remove this once the migration is complete on production
const migrateLeaveTypeToAddIsActiveKey = require(path.resolve(
  "src/scripts/migrations/migrateLeaveTypeToAddIsActiveKey.js"
));

await migrateLeaveTypeToAddIsActiveKey();

// Migration script `migrateLeaveTypeToAddPendingDataKey` Remove this once the migration is complete on production
const migrateLeaveTypeToAddPendingDataKey = require(path.resolve(
  "src/scripts/migrations/migrateLeaveTypeToAddPendingDataKey.js"
));

await migrateLeaveTypeToAddPendingDataKey();

// Migration script `migrateAddRolesToUsers` Remove this once the migration is complete on production
const migrateAddRolesToUsers = require(path.resolve(
  "src/scripts/migrations/migrateAddRolesToUsers.js"
));

await migrateAddRolesToUsers();

// Migration script `migrateWorkspaceThemesToMap` Remove this once the migration is complete on production
const migrateWorkspaceThemesToMap = require(path.resolve(
  "src/scripts/migrations/migrateWorkspaceThemesToMap.js"
));

await migrateWorkspaceThemesToMap();

// Migration script `removeAccessTokenAndRefreshToken` Remove this once the migration is complete on production
const removeAccessTokenAndRefreshToken = require(path.resolve(
  "src/scripts/migrations/removeAccessTokenAndRefreshToken.js"
));

await removeAccessTokenAndRefreshToken();

// Migration script `migrateConvertStartTimeToSingleStartTime` Remove this once the migration is complete on production
const migrateConvertStartTimeToSingleStartTime = require(path.resolve(
  "src/scripts/migrations/migrateConvertStartTimeToSingleStartTime.js"
));

await migrateConvertStartTimeToSingleStartTime();

// Migration script `migrateAddSettingsToWorkspace` Remove this once the migration is complete on production
const migrateAddSettingsToWorkspace = require(path.resolve(
  "src/scripts/migrations/migrateAddSettingsToWorkspace.js"
));

await migrateAddSettingsToWorkspace();



// Migration script `migrateSetIsDemoDoneForExistingUsers`
const migrateSetIsDemoDoneForExistingUsers = require(path.resolve(
  "src/scripts/migrations/migrateSetIsDemoDoneForExistingUsers.js"
));

await migrateSetIsDemoDoneForExistingUsers();

// // Migration script `migrateStartTimeToDateType` Remove this once the migration is complete on production
// const migrateStartTimeToDateType = require(path.resolve(
//   "src/scripts/migrations/migrateStartTimeToDateType.js"
// ));

// await migrateStartTimeToDateType();

 // Migration script `migrateAddTitleToLeaveTypesAndLeaveBalance` Remove this once the migration is complete on production
  // const migrateAddTitleToLeaveTypesAndLeaveBalance = require(path.resolve(
  //   "src/scripts/migrations/migrateAddTitleToLeaveTypesAndLeaveBalance.js"
  // ));

  // await migrateAddTitleToLeaveTypesAndLeaveBalance();


  // // Migration script `migrateAddWorkspaceTimeZone` Remove this once the migration is complete on production
  // const migrateAddWorkspaceTimeZone = require(path.resolve(
  //   "src/scripts/migrations/migrateAddWorkspaceTimeZone.js"
  // ));

// await migrateAddWorkspaceTimeZone();
  
  // Migration script `migrateUserStatus` Remove this once the migration is complete on production
  // const migrateUserStatus = require(path.resolve(
  //   "src/scripts/migrations/migrateUserStatus.js"
  // ));
  // await migrateUserStatus();

  // // Migration script `migrateRemoveEntryLogs` Remove this once the migration is complete on production
  // const migrateRemoveEntryLogs = require(path.resolve(
  //   "src/scripts/migrations/migrateRemoveEntryLogs.js"
  // ));
  // await migrateRemoveEntryLogs();