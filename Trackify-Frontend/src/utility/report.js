import FetchApi from "##/src/client.js";
import { config } from "##/src/utility/config/config.js";

const calculateTime = (reports) => {
  reports.forEach((report) => {
    report.totalTimeSpent = report.developers.reduce(
      (accumulator, currentValue) => (accumulator += currentValue.timeSpent),
      0,
    );
  });
};

// extracting unique clients
const extractUniqueClients = (projects) => {

  if (!projects?.length) {
    return [];
  }
  const uniqueClients = new Map();

  projects.forEach((project) => {
    const client = project.projectDetails.client;
    uniqueClients.set(client._id, client.name);
  });

  return Array.from(uniqueClients.entries()).map(([id, name]) => ({
    _id: id,
    name,
  }));
};

const extractUniqueDevelopers = (projects) => {
  const uniqueDevelopers = new Map();

  projects.forEach((project) => {
    project.developers?.forEach((developer) => {
      uniqueDevelopers.set(developer.userId, developer.name);
    });
  });

  return Array.from(uniqueDevelopers.entries()).map(([id, name]) => ({
    userId: id,
    name,
  }));
};

// restructuring the array of reports
const extractDevelopersWithProjects = (projects) => {
  return projects.reduce((result, project) => {
    project.developers.forEach((developer) => {
      const { userId, name, timeSpent } = developer;
      const existingDeveloper = result.find((dev) => dev.userId === userId);

      if (existingDeveloper) {
        const existingProject = existingDeveloper.projects.find(
          (proj) => proj.projectId === project._id,
        );
        if (existingProject) {
          existingProject.timeSpent += timeSpent;
        } else {
          existingDeveloper.projects.push({
            projectId: project._id,
            projectName: project.projectDetails.name,
            projectDescription: project.projectDetails.description,
            projectEstimatedHours: project.projectDetails.estimatedHours,
            projectIsCompleted: project.projectDetails.isCompleted,
            projectCreatedDate: project.projectDetails.createdDate,
            timeSpent,
          });
        }
        // Update the totalTimeSpentByDeveloper
        existingDeveloper.totalTimeSpentByDeveloper += timeSpent;
      } else {
        result.push({
          userId,
          name,
          projects: [
            {
              projectId: project._id,
              projectName: project.projectDetails.name,
              projectDescription: project.projectDetails.description,
              projectEstimatedHours: project.projectDetails.estimatedHours,
              projectIsCompleted: project.projectDetails.isCompleted,
              projectCreatedDate: project.projectDetails.createdDate,
              timeSpent,
            },
          ],
          // Initialize totalTimeSpentByDeveloper
          totalTimeSpentByDeveloper: timeSpent,
        });
      }
    });
    return result;
  }, []);
};

// filter by users for summary by dev
const filterUsers = (usersArray, userIdsArray) => {
  if (userIdsArray.length === 0) {
    return usersArray;
  }
  const filteredUsers = usersArray.filter((user) => {
    return userIdsArray.includes(user.userId);
  });

  return filteredUsers;
};

// filtering for detaild reports
const filterProjectsByCriteria = (
  projectsArray,
  userIdsArray,
  clientIdsArray,
  projectIdsArray,
) => {
  return projectsArray
    .filter((project) => {
      const clientFilter =
        clientIdsArray.length === 0 ||
        clientIdsArray.includes(project.projectDetails.client._id);
      const projectFilter =
        projectIdsArray.length === 0 || projectIdsArray.includes(project._id);
      return clientFilter && projectFilter;
    })
    .map((project) => {
      const filteredDevelopers = project.developers.filter(
        (developer) =>
          userIdsArray.length === 0 || userIdsArray.includes(developer.userId),
      );
      return {
        ...project,
        developers: filteredDevelopers,
      };
    });
};

async function getUserEntries(projects, range, userId) {
  const url = new URL(`${config.api}/api/reports/user/${userId}`);

  url.search = new URLSearchParams({
    projects,
    start: range[0].startDate,
    end: range[0].endDate,
  });

  let entries = await FetchApi.fetch(url);
  const entriesData = entries.map((entryData) => {
    const sortedEntries = entryData.entries.sort((prevEntry, nextEntry) => {
      return new Date(prevEntry.startTime) - new Date(nextEntry.startTime);
    });
    entryData.entries = sortedEntries;
    return entryData;
  });

  return entriesData;
}
export {
  calculateTime,
  extractUniqueClients,
  extractUniqueDevelopers,
  extractDevelopersWithProjects,
  filterUsers,
  filterProjectsByCriteria,
  getUserEntries,
};
