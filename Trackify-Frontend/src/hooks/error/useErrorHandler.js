import {
  removeStackMessage,
  setErrorStack,
  toggleVisibility,
} from "##/src/app/alertSlice.js";
import { store } from "##/src/app/store.js";
import { ALERT_TIMEOUT } from "##/src/utility/alert.js";

// Hook to manage error messages
export default function useErrorHandler() {
  const { messageStack } = store.getState().alert;
  function handleError(message, type = "error") {
    if (message) {
      store.dispatch(setErrorStack({ message, type }));
      store.dispatch(toggleVisibility());

      setTimeout(() => {
        store.dispatch(removeStackMessage(messageStack.length, message));
        store.dispatch(toggleVisibility());
      }, ALERT_TIMEOUT);
    }
  }

  return {
    handleError,
  };
}
