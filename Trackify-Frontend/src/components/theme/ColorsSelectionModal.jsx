import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import { Box } from "@mui/material";
import ThemeColorItem from "##/src/components/theme/ThemeColorItem.jsx";
import { themes } from "##/src/utility/themes.js";
import { useContext } from "react";
import { AuthContext } from "##/src/context/authcontext.js";

const ColorsSelectionModal = ({
  currentThemeId,
  isThemeExpanded,
  onCollapse,
}) => {
  const { loadingBarProgress } = useContext(AuthContext);

  return (
    <Box sx={{ width: "100%", display: "flex", flexDirection: "column" }}>
      <Box
        onClick={onCollapse}
        sx={{
          paddingBottom: "10px",
          "&:hover": {
            cursor: "pointer",
          },
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: 16,
          fontWeight: 700,
          marginBottom: 0,
          padding: 0,
        }}
      >
        Themes
        {isThemeExpanded ? (
          <ArrowDropDownIcon
            sx={{
              fontSize: "32px",
              alignSelf: "center",
              marginLeft: "100px",
            }}
          />
        ) : (
          <ArrowDropUpIcon
            sx={{
              fontSize: "32px",
              alignSelf: "center",
              marginLeft: "100px",
            }}
          />
        )}
      </Box>
      {isThemeExpanded &&
        themes.map((theme) => {
          return (
            <ThemeColorItem
              key={theme.themeId}
              theme={theme}
              currentThemeId={currentThemeId}
              isDisabled={!!loadingBarProgress}
            />
          );
        })}
    </Box>
  );
};

export default ColorsSelectionModal;
