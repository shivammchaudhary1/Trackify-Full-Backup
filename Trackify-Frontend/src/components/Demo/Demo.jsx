import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getDemoState, updateDemoState, nextSlide, previousSlide, resetDemo } from '../../app/demoSlice';
import DemoSlide from './DemoSlide';
import { useLocation } from 'react-router-dom';
import { selectMe } from '../../app/profileSlice';
import { USER_ROLE } from '../../utility/utility';

// Import images
import welcomeImg from '../../assets/images/demo/welcome.png';
import taskNameImg from '../../assets/images/demo/task-name.png';
import projectSelectionImg from '../../assets/images/demo/project-selection.png';
import timerImg from '../../assets/images/demo/timer.png';
import pauseResumeImg from '../../assets/images/demo/pause-resume.png';
import themeImg from '../../assets/images/demo/theme.png';
import workspaceImg from '../../assets/images/demo/workspace.png';
import timeEditorImg from '../../assets/images/demo/time-editor.png';
import settings from '../../assets/images/demo/settings.png';

const userDemoSlides = [
  {
    title: 'Welcome to Trackify',
    description: 'Let\'s get you started with Trackify! This quick tour will show you the essential features you\'ll need for time tracking.',
    image: welcomeImg
  },
  {
    title: 'Your Task Name',
    description: 'Look at the top-left corner! That\'s your Task name What you\'re currently working On. You can have multiple Task, and your time entries will be organized under the selected project.',
    image: taskNameImg
  },
  {
    title: 'Select a Project',
    description: 'Before tracking time, select a project from the dropdown menu in the timer section. This helps organize your work and track time for specific projects.',
    image: projectSelectionImg
  },
  {
    title: 'Using the Timer',
    description: 'To track your work, click the "Start Timer" button. Add a description of your task, and the timer will begin tracking your time. Click "Stop" when you\'re done.',
    image: timerImg
  },
  {
    title: 'Pause and Resume',
    description: 'Need a break? Click the "Pause" button to temporarily stop the timer. Click "Resume" when you\'re ready to continue working.',
    image: pauseResumeImg
  },
  {
    title: 'Settings Access',
    description: 'Click the settings icon in the top-right corner to access your profile settings, preferences, and account options.',
    image: settings
  },
  {
    title: 'Customize Your Theme',
    description: 'Make Trackify yours! Click the theme selector in the sidebar to choose a color theme that suits your style.',
    image: themeImg
  },
  {
    title: 'Ready to Track!',
    description: 'You\'re all set to start tracking your time! Remember these basic steps: Select project → Start timer → Work → Pause/Resume as needed → Stop when done.',
    image: welcomeImg
  }
];

const adminDemoSlides = [
  {
    title: 'Welcome to Trackify',
    description: 'Let\'s get you started with Trackify! As an admin, you\'ll have access to both user features and advanced workspace management tools.',
    image: welcomeImg
  },
  {
    title: 'Your Task Name',
    description: 'Look at the top-left corner! That\'s your Task name What you\'re currently working On. You can have multiple Task, and your time entries will be organized under the selected project.',
    image: taskNameImg
  },
  {
    title: 'Select a Project',
    description: 'Before tracking time, select a project from the dropdown menu in the timer section. This helps organize your work and track time for specific projects.',
    image: projectSelectionImg
  },
  {
    title: 'Using the Timer',
    description: 'To track your work, click the "Start Timer" button. Add a description of your task, and the timer will begin tracking your time. Click "Stop" when you\'re done.',
    image: timerImg
  },
  {
    title: 'Pause and Resume',
    description: 'Need a break? Click the "Pause" button to temporarily stop the timer. Click "Resume" when you\'re ready to continue working.',
    image: pauseResumeImg
  },
  {
    title: 'Settings Access',
    description: 'Click the settings icon in the top-right corner to access workspace settings, user management, and advanced configuration options.',
    image: settings
  },
  {
    title: 'Customize Your Theme',
    description: 'Make Trackify yours! Click the theme selector in the sidebar to choose a color theme that suits your style.',
    image: themeImg
  },
  {
    title: 'Workspace Management',
    description: 'As an admin, you can create and manage workspaces. Go to Workspace Settings to add team members, set roles, and configure workspace preferences.',
    image: workspaceImg
  },
  {
    title: 'Time Editor',
    description: 'Access the Time Editor to review and modify time entries for your team. You can edit durations, update descriptions, and ensure accurate time tracking.',
    image: timeEditorImg
  },
  {
    title: 'Ready to Lead!',
    description: 'You\'re all set to manage your workspace! Remember that you can access these admin tools from the sidebar menu whenever you need them.',
    image: welcomeImg
  }
];

const Demo = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const { isDemoDone, currentSlide, loading } = useSelector((state) => state.demo);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const user = useSelector(selectMe);
  const [showDemo, setShowDemo] = React.useState(false);

  // Determine admin status from user roles
  const isAdmin = user?.roles?.[user?.currentWorkspace]?.includes(USER_ROLE.ADMIN) || false;

  useEffect(() => {
    // Always fetch demo state when authenticated to sync with backend
    if (isAuthenticated) {
      dispatch(getDemoState());
    }
  }, [dispatch, isAuthenticated]);

  // Debug logs
  useEffect(() => {
  }, [isDemoDone, isAdmin, loading, isAuthenticated, showDemo, user]);

  useEffect(() => {
    // Show demo with a delay after authentication if not done
    if (isAuthenticated && !isDemoDone && !loading) {
      const timer = setTimeout(() => {
        setShowDemo(true);
      }, 2500); // 2.5 seconds delay
      return () => {
        clearTimeout(timer);
      };
    } else {
      setShowDemo(false);
    }
  }, [isAuthenticated, isDemoDone, loading]);

  // Don't show demo on auth pages, if not authenticated, or if not ready to show
  if (!isAuthenticated || location.pathname.includes('/auth') || !showDemo) {
    return null;
  }

  // Return null while loading
  if (loading) {
    return null;
  }

  // Don't show demo if it's marked as done
  if (isDemoDone) {
    return null;
  }

  // Select slides based on user role
  const slides = isAdmin ? adminDemoSlides : userDemoSlides;

  const handleNext = () => {
    if (currentSlide === slides.length - 1) {
      handleEnd();
    } else {
      dispatch(nextSlide());
    }
  };

  const handlePrevious = () => {
    dispatch(previousSlide());
  };

  const handleSkip = async () => {
    await dispatch(updateDemoState(true));
    dispatch(resetDemo());
  };

  const handleEnd = async () => {
    await dispatch(updateDemoState(true));
    dispatch(resetDemo());
  };

  const currentSlideData = slides[currentSlide];

  return (
    <DemoSlide
      {...currentSlideData}
      currentSlide={currentSlide}
      totalSlides={slides.length}
      onNext={currentSlide === slides.length - 1 ? handleEnd : handleNext}
      onPrevious={handlePrevious}
      onSkip={handleSkip}
    />
  );
}

export default Demo;
