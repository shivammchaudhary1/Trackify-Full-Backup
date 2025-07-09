import { CircularProgress } from "@mui/material";
import { Suspense, lazy } from "react";

// References:
// https://react.dev/reference/react/lazy
// https://reactjs.org/docs/code-splitting.html
// https://www.geeksforgeeks.org/lazy-loading-in-react-and-how-to-implement-it/
// https://stackoverflow.com/questions/53174915/what-is-lazy-in-react

function loadWithLazyLoader(loaderFun) {
  async function lazyLoaderWithReload() {
    try {
      return await loaderFun();
    } catch (error) {
      alert("Something went wrong. Please try again later.");
    }
  }

  const LazyComponent = lazy(lazyLoaderWithReload);


  const LazyRouteWithFallback = (props) => (
    <Suspense
      fallback={
        <CircularProgress
          sx={{ position: "fixed", top: "47%", left: "47%", zIndex: 1000 }}
        />
      }
    >
      <LazyComponent {...props} />
    </Suspense>
  );
  return LazyRouteWithFallback;
}

export default loadWithLazyLoader;
