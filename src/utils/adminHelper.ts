const getWeekStartAndEnd = (): { startOfWeek: Date; endOfWeek: Date } => {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 (Sunday) to 6 (Saturday)
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - dayOfWeek);
  startOfWeek.setHours(0, 0, 0, 0); // Start of the week at midnight

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(endOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999); // End of the week at the last millisecond

  return { startOfWeek, endOfWeek };
};

export { getWeekStartAndEnd };
