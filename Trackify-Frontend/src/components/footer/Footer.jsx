import { CloseRounded, MenuRounded } from "@mui/icons-material";
import {
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { selectMe } from "##/src/app/profileSlice.js";
import { selectCurrentTheme } from "##/src/app/profileSlice.js";
import { selectUserRole } from "##/src/app/profileSlice.js";
import { MENUS, MENU_LABELS, MENU_PATH_ICONS } from "##/src/utility/footer.js";
import { capitalizeFirstWord } from "##/src/utility/miscellaneous/capitalize.js";
import { Link } from "react-router-dom";
import { logout } from "##/src/app/authSlice";
import { useNavigate } from "react-router-dom";
import { startLoading, stopLoading } from "##/src/app/loadingSlice";

const CustomList = ({
  anchor,
  logoutUser,
  toggleDrawer,
  theme,
  isAdmin,
  user,
}) => (
  <Box
    role="presentation"
    sx={{ width: anchor === "top" || anchor === "bottom" ? "auto" : 250 }}
  >
    <List>
      <ListItem
        onClick={toggleDrawer(anchor, false)}
        onKeyDown={toggleDrawer(anchor, false)}
        sx={{
          cursor: "pointer",
          paddingTop: "8px",
          paddingBottom: "8px",
          paddingLeft: "16px",
          paddingRight: "16px",
        }}
      >
        <ListItemIcon>
          <Box
            sx={{
              border: "1px solid #fff",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "30px",
              width: "30px",
              boxSizing: "border-box",
            }}
          >
            <CloseRounded sx={{ color: theme?.textColor }} />
          </Box>
        </ListItemIcon>
        <ListItemText primary={capitalizeFirstWord(user?.name)} />
      </ListItem>

      <Divider
        style={{
          opacity: 1,
          margin: 0,
          border: 0,
          borderTop: "1px solid gold",
        }}
      />
      {MENUS.map((menu, index) => {
        const menuIcon = MENU_PATH_ICONS[menu].Icon;
        const link = MENU_PATH_ICONS[menu].link;
        const label = MENU_LABELS[menu];
        const isAllowedMenu =
          (MENU_PATH_ICONS[menu].adminOnly && isAdmin) ||
          !MENU_PATH_ICONS[menu].adminOnly;

        const isLogOutPath = menu === "logout";

        if (isAllowedMenu && !isLogOutPath) {
          return (
            <ListItem
              key={`${menu}+${index}`}
              onClick={toggleDrawer(anchor, false, menu)}
              onKeyDown={toggleDrawer(anchor, false)}
              sx={{
                cursor: "pointer",
                paddingTop: "8px",
                paddingBottom: "8px",
                paddingLeft: "16px",
                paddingRight: "16px",
              }}
            >
              <Link
                to={link}
                style={{
                  width: "100%",
                  textDecoration: "none",
                  display: "flex",
                }}
              >
                <ListItemIcon sx={{ cursor: "pointer" }}>
                  <img
                    width={30}
                    height={30}
                    alt={label}
                    src={menuIcon}
                    loading="eager"
                  />
                </ListItemIcon>
                <ListItemText primary={label} />
              </Link>
            </ListItem>
          );
        }
        if (isLogOutPath) {
          return (
            <ListItem
              key={`${menu}+${index}`}
              onClick={logoutUser}
              sx={{
                cursor: "pointer",
                paddingTop: "8px",
                paddingBottom: "8px",
                paddingLeft: "16px",
                paddingRight: "16px",
              }}
            >
              <ListItemIcon sx={{ cursor: "pointer" }}>
                <img
                  width={30}
                  height={30}
                  alt={label}
                  src={menuIcon}
                  loading="eager"
                />
              </ListItemIcon>
              <ListItemText primary={label} />
            </ListItem>
          );
        }
      })}
    </List>
  </Box>
);

export default function Footer() {
  const [state, setState] = React.useState({
    bottom: false,
  });

  const navigate = useNavigate();
  const user = useSelector(selectMe);
  const isAdmin = useSelector(selectUserRole);
  const theme = useSelector(selectCurrentTheme);

  const dispatchToRedux = useDispatch();

  async function handleLogout() {
    dispatchToRedux(startLoading());
    await dispatchToRedux(logout()).unwrap();
    dispatchToRedux(stopLoading());
    navigate("/signin");
  }

  const ThemedDrawer = styled(Drawer)({
    ".MuiDrawer-paperAnchorBottom": {
      width: "300px !important",
      borderTopLeftRadius: "12px !important",
      borderTopRightRadius: "12px !important",
      backgroundColor: `${theme?.secondaryColor} !important`,
      color: `${theme?.textColor} !important`,
      img: {
        width: "26px !important",
        filter: "brightness(0) invert(1) !important",
      },
      a: {
        color: `${theme?.textColor} !important`,
      },
    },
    ".MuiCollapse-wrapper": {
      background: `${theme?.primaryColor} !important`,
      ".MuiListItem-root:hover": {
        color: `${theme?.textHover} !important`,
      },
    },
    ".MuiListItem-button:hover": {
      color: `${theme?.textHover} !important`,
    },
  });

  const toggleDrawer = (anchor, open, menu) => (event) => {
    if (
      event.type === "keydown" &&
      (event.key === "Tab" || event.key === "Shift")
    ) {
      return;
    }

    setState({ ...state, [anchor]: open });
  };

  useEffect(() => {
    const images = MENUS.map((menu) => MENU_PATH_ICONS[menu].Icon);
    images.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  return (
    <Box>
      {["bottom"].map((anchor) => (
        <React.Fragment key={anchor}>
          <Box
            className="ThemedButton"
            onClick={toggleDrawer(anchor, true)}
            sx={{
              background: `${theme?.secondaryColor}`,
              width: 250,
              borderTopRightRadius: "10px",
            }}
          >
            <IconButton aria-label="menus" title="Menus">
              <Box
                sx={{
                  border: "1px solid #fff",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "30px",
                  width: "30px",
                  boxSizing: "border-box",
                }}
              >
                <MenuRounded sx={{ color: theme?.textColor }} />
              </Box>
            </IconButton>
            <span style={{ color: `${theme?.textColor}`, marginLeft: "20px" }}>
              {capitalizeFirstWord(user?.name)}
            </span>
          </Box>

          <ThemedDrawer
            anchor={anchor}
            onClose={toggleDrawer(anchor, false)}
            open={state[anchor]}
          >
            <CustomList
              anchor={anchor}
              logoutUser={handleLogout}
              isAdmin={isAdmin}
              theme={theme}
              toggleDrawer={toggleDrawer}
              user={user}
            />
          </ThemedDrawer>
        </React.Fragment>
      ))}
    </Box>
  );
}
