import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import {
  Box,
  CircularProgress,
  FormControlLabel,
  IconButton,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { useContext, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AuthContext } from "##/src/context/authcontext.js";
import {
  getCalculationRule,
  selectCalculationRules,
  toggleOvertime,
  updateCalculationRule,
} from "##/src/app/calculationSlice.js";
import { selectMe } from "##/src/app/profileSlice.js";
import { selectCurrentTheme } from "##/src/app/profileSlice.js";
import { capitalizeFirstWord } from "##/src/utility/miscellaneous/capitalize.js";
import { FONTS } from "##/src/utility/utility.js";
import UpdateRuleModal from "./UpdateRuleModal.jsx";
import useSetNotification from "##/src/hooks/notification/useSetNotification.js";
import useErrorHandler from "##/src/hooks/error/useErrorHandler.js";

const Rules = () => {
  const dispatchToRedux = useDispatch();
  const user = useSelector(selectMe);
  const rules = useSelector(selectCalculationRules);
  const theme = useSelector(selectCurrentTheme);

  const { setLoadingBarProgress: setProgress } = useContext(AuthContext);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [ruleData, setRuleData] = useState({ ruleId: "", ruleIndex: "" });
  const [componentLoading, setComponentLoading] = useState(false);

  const { setNotification } = useSetNotification();
  const { handleError } = useErrorHandler();

  const tableBodyStyle = {
    fontFamily: FONTS.body,
    fontSize: "14px",
    textAlign: "center",
  };
  const tableHeadStyle = {
    fontFamily: FONTS.subheading,
    fontSize: "16px",
    fontWeight: "bold",
    color: "#5a5a5a",
    textAlign: "center",
  };

  const formatWeekdays = (weekdays) => {
    return weekdays
      .map((weekday) => weekday.charAt(0).toUpperCase() + weekday.slice(1))
      .join(", ");
  };

  useEffect(() => {
    const fetchRule = async () => {
      try {
        if (user && rules.length === 0) {
          setComponentLoading(true);
          setProgress(30);
          await dispatchToRedux(
            getCalculationRule({
              workspaceId: user.currentWorkspace,
              userId: user._id,
            })
          ).unwrap();
          setProgress(100);
          setComponentLoading(false);
        }
      } catch (error) {
        setProgress(100);
        handleError(`Failed to fetch rules, ${error.message}`);
        setComponentLoading(false);
      }
    };

    fetchRule();
  }, [dispatchToRedux]);

  const handleEdit = (ruleId, ruleIndex) => {
    setRuleData({ ruleId: ruleId, ruleIndex: ruleIndex });
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setRuleData({ ruleId: "", ruleIndex: "" });
  };

  const handleUpdateRule = async (formData) => {
    const { workingHours, weekDays, isActive } = formData;
    const workingDays = weekDays.length;

    if (!ruleData.ruleId) {
      setNotification("Please select rule", "warning");
      return;
    }

    try {
      setProgress(30);
      await dispatchToRedux(
        updateCalculationRule({
          ruleId: ruleData.ruleId,
          workingHours,
          workingDays,
          weekDays,
          isActive,
        })
      ).unwrap();
      handleModalClose();
      setProgress(100);
      setNotification("Rules for the week updated successfully", "success");
    } catch (error) {
      setProgress(100);
      handleError(`Failed to update rules, ${error.message}`);
    }
  };

  // for new overtimeCalculation
  const isOvertime = rules.find((rule) => rule.isOvertime)?.isOvertime ?? false;

  const handleToggleOvertime = async (ruleId) => {
    try {
      setProgress(30);
      await dispatchToRedux(toggleOvertime({ ruleId })).unwrap();
      setProgress(100);
      setNotification("Overtime status updated successfully", "success");
    } catch (error) {
      setProgress(100);
      handleError(`Failed to update overtime status, ${error.message}`);
    }
  };

  const handleToggleChange = (ruleId) => (event) => {
    handleToggleOvertime(ruleId);
  };

  return (
    <>
      {!componentLoading && (
        <TableContainer sx={{ maxHeight: "60vh" }}>
          <Table
            stickyHeader
            aria-label="a dense table"
            size="small"
            sx={{
              "& .MuiTableCell-root": {
                padding: "10px 0px",
              },
            }}
          >
            <TableHead>
              <TableRow
                sx={{
                  borderTop: "1px solid #ddd",
                  borderBottom: "1px solid #ddd",
                }}
              >
                <TableCell
                  sx={{
                    fontFamily: FONTS.subheading,
                    fontSize: "16px",
                    fontWeight: "bold",
                    color: "#5a5a5a",
                    textAlign: "left",
                  }}
                >
                  Title
                </TableCell>
                <TableCell sx={tableHeadStyle}>Working Days / Week</TableCell>
                <TableCell sx={tableHeadStyle}>Working Hours / Day</TableCell>
                <TableCell sx={tableHeadStyle}>Weekdays</TableCell>
                <TableCell sx={tableHeadStyle}>Is Active</TableCell>
                <TableCell
                  sx={{
                    fontFamily: FONTS.subheading,
                    fontSize: "16px",
                    fontWeight: "bold",
                    color: "#5a5a5a",
                    textAlign: "right",
                  }}
                >
                  Action
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rules?.map((rule, index) => (
                <TableRow key={rule._id}>
                  <TableCell
                    sx={{
                      fontFamily: FONTS.body,
                      fontSize: "14px",
                      textAlign: "left",
                    }}
                  >
                    {capitalizeFirstWord(rule.title)}
                  </TableCell>
                  <TableCell sx={tableBodyStyle}>{rule.workingDays}</TableCell>
                  <TableCell sx={tableBodyStyle}>{rule.workingHours}</TableCell>
                  <TableCell sx={tableBodyStyle}>
                    {formatWeekdays(rule.weekDays)}
                  </TableCell>
                  <TableCell sx={tableBodyStyle}>
                    {rule.isActive ? "Yes" : "No"}
                  </TableCell>
                  <TableCell
                    sx={{
                      fontFamily: FONTS.body,
                      fontSize: "14px",
                      textAlign: "right",
                    }}
                  >
                    <IconButton onClick={() => handleEdit(rule._id, index)}>
                      <EditOutlinedIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {/* Overtime Toggle  */}
              <TableRow>
                <TableCell
                  sx={{
                    fontFamily: FONTS.body,
                    fontSize: "14px",
                    textAlign: "left",
                  }}
                >
                  Overtime Calculation
                </TableCell>
                <TableCell sx={tableBodyStyle}>-</TableCell>
                <TableCell sx={tableBodyStyle}>-</TableCell>
                <TableCell sx={tableBodyStyle}>-</TableCell>
                <TableCell sx={tableBodyStyle}>
                  {isOvertime ? "Yes" : "No"}
                </TableCell>
                <TableCell>
                  {/* <span
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      alignItems: "center",
                      gap: "10px",
                      width: "100%",
                    }}
                  ></span> */}
                  {rules?.map((rule) => (
                    <FormControlLabel
                      key={rule?._id}
                      control={
                        <Switch
                          checked={rule?.isOvertime}
                          onChange={handleToggleChange(rule._id)}
                          sx={{
                            textAlign: "right",
                          }}
                        />
                      }
                    />
                  ))}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {isModalOpen && (
        <UpdateRuleModal
          onClose={handleModalClose}
          onUpdate={handleUpdateRule}
          open={isModalOpen}
          theme={theme}
          rule={rules[ruleData.ruleIndex]}
          activeRules={rules.map((rule) => rule.isActive).length}
        />
      )}

      {componentLoading && (
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        >
          <CircularProgress color="inherit" />
        </Box>
      )}
    </>
  );
};

export default Rules;
