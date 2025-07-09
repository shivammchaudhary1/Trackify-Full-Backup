import React from 'react';
import { Box, Typography, Button, IconButton, useTheme } from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import CallMadeIcon from '@mui/icons-material/CallMade'; // Diagonal arrow for better visibility
import styled from '@emotion/styled';
import { useSelector } from 'react-redux';
import { selectCurrentTheme } from '../../app/profileSlice';

// Helper function to filter out custom props
const filterProps = (props) => {
  const { accentcolor, hovercolor, direction, ...rest } = props;
  return rest;
};

const SlideContainer = styled(Box)`
  position: fixed;
  top: 50%;
  left: 45%;
  transform: translate(-50%, -50%);
  z-index: 1000;
  background: white;
  padding: 2rem 1.5rem;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  max-width: 75%;
  width: 100%;
  display: flex;
  flex-direction: column;
  max-height: 83vh;
  transition: box-shadow 0.3s ease;

  &:hover {
    box-shadow: 0 15px 60px rgba(0, 0, 0, 0.2);
  }
`;

const Overlay = styled(Box)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 0, 0, 0.1);
  z-index: 998; /* Always below the modal */
  pointer-events: none; /* Never block interaction */
`;

const ContentContainer = styled(Box, {
  shouldComponentUpdate: true,
  filterProps: ['accentcolor']
})`
  margin: 1rem 0 0.5rem;
  padding: 1.25rem;
  background-color: ${props => props.bgcolor || '#f8f9fa'};
  border-radius: 12px;
  text-align: center;
  border: 1px solid ${props => props.borderColor || 'rgba(0,0,0,0.08)'};
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  height: 680px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: ${props => props.accentcolor || props.theme.palette.primary.main};
    opacity: 0.8;
  }

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  }
`;

const DemoImage = styled('img')`
  max-width: 100%;
  max-height: 450px;
  width: auto;
  height: auto;
  object-fit: contain;
  margin: 0 0 0.75rem;
  border-radius: 10px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border: 1px solid rgba(0,0,0,0.08);

  &:hover {
    transform: scale(1.02) translateY(-4px);
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.18);
  }
`;

const NavigationContainer = styled(Box)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.75rem; 
  padding-top: 0.75rem; 
  border-top: 1px solid ${props => props.borderColor || 'rgba(0,0,0,0.08)'};
  width: 100%;
`;

const StyledIconButton = styled(IconButton, {
  shouldComponentUpdate: true,
  filterProps: ['hovercolor', 'direction']
})`
  background-color: ${props => props.bgcolor || '#f8f9fa'};
  margin: 0 0.5rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(0,0,0,0.08);

  &:hover {
    background-color: ${props => props.hovercolor || '#e9ecef'};
    transform: scale(1.1) rotate(${props => props.direction === 'prev' ? '-8deg' : '8deg'});
  }

  &:disabled {
    opacity: 0.5;
    transform: none;
  }
`;

const GuideArrow = styled(Box)`
  position: fixed;
  z-index: 9999;
  pointer-events: none;
  display: flex;
  align-items: center;
  padding: 8px 16px;
  background: #f8f9fa;
  border-radius: 20px;
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.12);
  animation: blink 1.3s infinite;

  @keyframes blink {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.6;
    }
  }

  .arrow-text {
    font-size: 0.9rem;
    font-weight: 500;
    color: black;
    margin-right: 8px;
  }

  .arrow-wrapper {
    display: flex;
    align-items: center;
  }

  .arrow-icon {
    font-size: 1.4rem;
    color: black;
    transform: rotate(45deg);
    filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.15));
  }
`;

const getArrowPosition = (slideIndex) => {
  switch (slideIndex) {
    case 0: 
      return null;
    case 1: 
      return { 
        top: '70px', 
        left: '10%', 
        transform: 'translateX(-50%) rotate(0deg)',
        text: 'Enter Task Name Here'
      };
    case 2: 
      return { 
        top: '30px', 
        left: '28%',
        text: 'Select Project'
      };
    case 3: 
      return { 
        top: '70px', 
        right: '120px',
        text: 'Start Timer'
      };
    case 4: 
      return { 
        top: '70px', 
        right: '120px',
        text: 'Pause/Resume'
      };
    case 5: 
      return { 
        bottom: '20px', 
        right: '100px',
        text: 'Please Click to Open Settings'
      };
    case 6: 
      return { 
       bottom: '50px', 
       right: '300px',
        text: 'You Can Choose Theme'
      };
    case 7: 
      return { 
        bottom: '50px', 
        right: '300px',
        text: 'You Can Add New Workspace'
      };
    case 8: 
      return { 
        bottom: '50px', 
        right: '300px',
        text: 'You Can Edit Time'
      };
    case 9: 
      return null;
    default:
      return null;
  }
};

const DemoSlide = ({
  title,
  description,
  image,
  currentSlide,
  totalSlides,
  onNext,
  onPrevious,
  onSkip,
}) => {
  const theme = useSelector(selectCurrentTheme);
  const muiTheme = useTheme();

  // Create memoized style props
  const contentContainerProps = React.useMemo(() => ({
    bgcolor: theme?.backgroundColor || '#f8f9fa',
    borderColor: theme?.borderColor || 'rgba(0,0,0,0.08)',
    accentcolor: theme?.secondaryColor || muiTheme.palette.primary.main
  }), [theme, muiTheme.palette.primary.main]);

  const iconButtonProps = React.useMemo(() => ({
    bgcolor: theme?.backgroundColor || '#f8f9f8',
    hovercolor: theme?.hovercolor || '#e9ecef'
  }), [theme]);

  const arrowPosition = getArrowPosition(currentSlide);

  return (
    <>
      <Overlay />
      {arrowPosition && (
        <GuideArrow
          sx={{
            ...arrowPosition,
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
          theme={theme}
        >
          <span className="arrow-text">{arrowPosition.text}</span>
          <div className="arrow-wrapper">
            <CallMadeIcon className="arrow-icon" />
          </div>
        </GuideArrow>
      )}
      <SlideContainer>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography 
            variant="h5" 
            component="h2" 
            sx={{ 
              fontWeight: 700,
              color: theme?.secondaryColor || muiTheme.palette.primary.main,
              mb: 1,
              letterSpacing: '-0.01em',
              position: 'relative',
              display: 'inline-block',
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: -4,
                left: 0,
                width: '40%',
                height: 3,
                backgroundColor: theme?.secondaryColor || muiTheme.palette.primary.main,
                opacity: 0.3,
                borderRadius: '2px'
              }
            }}
          >
            {title}
          </Typography>
          <Button 
            color="inherit" 
            onClick={onSkip}
            sx={{ 
              borderRadius: '24px',
              textTransform: 'none',
              fontSize: '0.95rem',
              opacity: 0.75,
              px: 2.5,
              py: 1,
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              border: '1px solid rgba(0,0,0,0.08)',
              '&:hover': {
                opacity: 1,
                backgroundColor: 'rgba(0,0,0,0.04)',
                transform: 'translateY(-1px)'
              }
            }}
          >
            Skip Demo
          </Button>
        </Box>

        <ContentContainer {...contentContainerProps}>
          {image && <DemoImage src={image} alt={title} />}
          <Typography 
            variant="body1" 
            sx={{ 
              color: theme?.textColor || 'text.secondary',
              fontSize: '1.1rem',
              lineHeight: 1.5,
              letterSpacing: '0.01em',
              maxWidth: '100%', 
              mx: 'auto',
              flex: '0 0 auto',
              overflow: 'auto',
              maxHeight: image ? '100px' : '300px', 
              '&::-webkit-scrollbar': {
                width: '6px',
                height: '6px',
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: 'rgba(0,0,0,0.1)',
                borderRadius: '10px',
              },
              '&::-webkit-scrollbar-track': {
                backgroundColor: 'transparent',
              }
            }}
          >
            {description}
          </Typography>
        </ContentContainer>
        <NavigationContainer borderColor={theme?.borderColor || 'rgba(0,0,0,0.08)'}>
          <StyledIconButton 
            onClick={onPrevious} 
            disabled={currentSlide === 0}
            bgcolor={theme?.backgroundColor || '#f8f9f8'}
            hovercolor={theme?.hovercolor || '#e9ecef'}
            direction="prev"
          >
            <NavigateBeforeIcon sx={{ color: theme?.secondaryColor }} />
          </StyledIconButton>

          {currentSlide === totalSlides - 1 ? (
            <Button 
              variant="contained" 
              onClick={onNext}
              sx={{ 
                bgcolor: theme?.secondaryColor || 'primary.main',
                borderRadius: '24px',
                textTransform: 'none',
                px: 4,
                py: 1,
                fontWeight: 600,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  bgcolor: theme?.hoverColor || 'primary.dark',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.2)'
                }
              }}
            >
              Finish
            </Button>
          ) : (
            <StyledIconButton 
              onClick={onNext}
              bgcolor={theme?.backgroundColor || '#f8f9f8'}
              hovercolor={theme?.hovercolor || '#e9ecef'}
              direction="next"
            >
              <NavigateNextIcon sx={{ color: theme?.secondaryColor }} />
            </StyledIconButton>
          )}
        </NavigationContainer>
      </SlideContainer>
    </>
  );
};

export default DemoSlide;
