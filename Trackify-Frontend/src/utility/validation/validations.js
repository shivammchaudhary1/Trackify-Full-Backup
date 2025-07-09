function validateEmailAndPassword(email, password) {
  const errors = [];

  if (!email) errors.push("Please enter your email address");
  if (!password) errors.push("Please enter your password");

  if (!errors.length) {
    const emailRegex = /^\w+([.-]\w+)*@\w+([.-]\w+)*(\.\w{2,})+$/;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{6,}$/;

    if (!emailRegex.test(email))
      errors.push("Please enter a valid email address");
    if (!passwordRegex.test(password)) {
      errors.push(
        "Password must be at least 6 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character."
      );
    }
  }

  return {
    isError: !!errors.length,
    error: errors.join("<br />"),
  };
}

const validateDateAndWorkspace = ({ date, workspace, entry }) => {
  const givenDate = new Date(date);
  const entryCreatedAt = new Date(entry.startTime);
  const isDateMatch =
    givenDate.toDateString() === entryCreatedAt.toDateString();
  const isWorkspaceMatch = workspace === entry.workspace;
  return isDateMatch && isWorkspaceMatch;
};

export { validateEmailAndPassword, validateDateAndWorkspace };
