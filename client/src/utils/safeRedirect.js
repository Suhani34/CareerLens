export default function safeRedirect(
  value,
  fallback = "/profile"
) {
  if (
    typeof value !== "string" ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.includes("\\")
  ) {
    return fallback;
  }

  // Reject control characters without using regex
  const hasControlCharacters = Array.from(value).some(
    (character) => character.charCodeAt(0) < 32
  );

  if (hasControlCharacters) {
    return fallback;
  }

  try {
    const target = new URL(
      value,
      window.location.origin
    );

    if (
      target.origin !== window.location.origin
    ) {
      return fallback;
    }

    if (
      ["/login", "/register"].includes(
        target.pathname
      )
    ) {
      return fallback;
    }

    return (
      target.pathname +
      target.search +
      target.hash
    );
  } catch {
    return fallback;
  }
}