import { Box, FormControl, TextField } from "@mui/material";
import format from "date-fns/format";
import { useEffect, useRef, useState } from "react";
import { DateRangePicker } from "react-date-range";
import "react-date-range/dist/styles.css"; // main style file
import "react-date-range/dist/theme/default.css"; // theme css file
import "./CalendarRange.css";

const FilterDateRange = ({ setRange, range }) => {
  const [openCalendar, setOpenCalendar] = useState(false);
  const dateRef = useRef(null);

  useEffect(() => {
    document.addEventListener("keydown", hideOnEscape, true);
    document.addEventListener("click", hideOnClickOutside, true);

    return () => {
      document.removeEventListener("keydown", hideOnEscape);
      document.removeEventListener("click", hideOnClickOutside);
    };
  }, []);

  const hideOnEscape = (e) => {
    if (e.key === "Escape") {
      setOpenCalendar(false);
    }
  };

  const hideOnClickOutside = (e) => {
    if (dateRef.current && !dateRef.current.contains(e.target)) {
      setOpenCalendar(false);
    }
  };

  return (
    <FormControl ref={dateRef} sx={{ flex: 1 }}>
      <TextField
        label="Select Date"
        onClick={() => setOpenCalendar((openCalendar) => !openCalendar)}
        value={`${format(range[0].startDate, "MM/dd/yyyy")} to ${format(
          range[0].endDate,
          "MM/dd/yyyy"
        )}`}
        variant="standard"
      ></TextField>
      {openCalendar && (
        <Box className="calendarRangeBox">
          <DateRangePicker
            className="calendarElement"
            date={new Date()}
            direction="horizontal"
            editableDateInputs={true}
            months={2}
            moveRangeOnFirstSelection={false}
            onChange={(item) => setRange([item.selection])}
            ranges={range}
          />
        </Box>
      )}
    </FormControl>
  );
};

export default FilterDateRange;
