// import axios from "axios";
// import { useEffect, useRef } from "react";

// const useApi = (skipAuth = false) => {
//   const api = useRef(
//     axios.create({
//       baseURL: process.env.REACT_APP_DEV_BASE_URL,
//     }),
//   );
//   useEffect(() => {
//     const currentAPI = api.current;

//     const requestInterceptorId = currentAPI.interceptors.request.use(
//       async (config) => {
//         if (skipAuth) {
//           return config;
//         }
//         const accessToken = window.localStorage.getItem("access_token");

//         config.headers.authorization = `${accessToken}`;
//         return config;
//       },
//     );

//     return () => {
//       currentAPI.interceptors.request.eject(requestInterceptorId);
//       //currentAPI.interceptors.response.eject(responseInterceptorId);
//     };
//   });
//   return api.current;
// };

// export default useApi;
