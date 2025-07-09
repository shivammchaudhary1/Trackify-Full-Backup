const UNRESTRICTED_PATHS = ["/signin", "/signup", "/resetpassword"];
const OPEN_PATHS = ["/forgetpassword", "/invite-new"];
const ADMIN_ONLY_PATHS = ["/users", "/clients"];

const PATHS_WITHOUT_FOOTER = ["/logout"];
const FONTS = {
  heading: "'Roboto', sans-serif",
  body: "'Open Sans', sans-serif",
  subheading: "'Roboto', sans-serif",
};

const removeHtmlTagsAndSpaces = (htmlString) => {
  let plainText = htmlString.replace(/<[^>]*>/g, " ");
  plainText = plainText.replace(/&nbsp;/g, " ");
  const trimmedText = plainText.replace(/\s+/g, " ").trim();
  return trimmedText;
};

function checkUserIsAdmin(workspace, user) {
  return !!workspace.selectedWorkspace?.users.find(
    (userObject) => userObject.user === user._id
  )?.isAdmin;
}

const USER_ROLE = {
  ADMIN: "admin",
  USER: "user",
};

const USER_STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  DELETED: "deleted",
};

export {
  checkUserIsAdmin,
  removeHtmlTagsAndSpaces,
  ADMIN_ONLY_PATHS,
  UNRESTRICTED_PATHS,
  OPEN_PATHS,
  PATHS_WITHOUT_FOOTER,
  FONTS,
  USER_ROLE,
  USER_STATUS,
};
