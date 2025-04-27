export function calculateReadTime(text: string, wordsPerMinute = 200) {
  if (typeof text !== "string") {
    throw new Error("Text must be a string");
  }

  const words = text.trim().split(/\s+/).length;
  const minutes = words / wordsPerMinute;
  const readTimeMinutes = Math.ceil(minutes);

  return readTimeMinutes;
}
