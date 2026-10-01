import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const API_BASE_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL.replace(/\/+$/, "")}/api`
  : "/api";

export const rawBaseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  credentials: "include",
});

export const baseQueryWithErrorHandling = async (args, api, extraOptions) => {
  const result = await rawBaseQuery(args, api, extraOptions);

  if (result.error) {
    const { status, data } = result.error;

    let message = "Something went wrong. Please try again.";

    if (status === "FETCH_ERROR" || status === "TIMEOUT_ERROR") {
      message =
        "Unable to reach the server. Please check your connection and try again.";
    } else if (status === 404) {
      message = data?.message || "The requested resource was not found.";
    } else if (status === 500 || status === 502 || status === 503) {
      message = "Something went wrong on our end. Please try again shortly.";
    } else if (data?.message) {
      message = data.message;
    }

    result.error.message = message;
  }

  return result;
};
