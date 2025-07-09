import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  messageStack: [],
  isVisible: false,
};

const alertSlice = createSlice({
  name: "alert",
  initialState,
  reducers: {
    setErrorStack(state, action) {
      if (state.messageStack.length < 3) {
        state.messageStack.push(action.payload);
      } else {
        state.messageStack.shift();
        state.messageStack.push(action.payload);
      }
    },
    removeStackMessage(state, action) {
      const { index, message } = action.payload;
      if (state.messageStack[index]?.message === message) {
        state.messageStack.splice(index, 1);
      }
    },
    toggleVisibility(state) {
      if (!state.isVisible && !!state.messageStack.length) {
        state.isVisible = true;
      } else if (!state.messageStack.length) {
        state.isVisible = false;
      }
    },
  },
});

const selectAlert = (state) => state.alert;
const { removeStackMessage, setErrorStack, toggleVisibility } =
  alertSlice.actions;
export { selectAlert, removeStackMessage, setErrorStack, toggleVisibility };
export default alertSlice.reducer;
