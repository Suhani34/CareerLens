export default function getErrorMessage(
  error,
  fallback = "Something went wrong. Please try again."
) {
  if (error.code === "ECONNABORTED") {
    return "The request timed out. Please try again.";
  }

  if (error.code === "ERR_NETWORK") {
    return "Unable to connect to CareerLens. Make sure the backend is running.";
  }

  const message =
    error.response?.data?.message;

  if (
    typeof message === "string" &&
    message.trim()
  ) {
    return message;
  }

  return fallback;
}