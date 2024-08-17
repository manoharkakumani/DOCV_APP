// Function to convert a date to ISO string (yyyy-mm-dd)
export const toISOString = (date) => {
  const parsedDate = new Date(date);
  if (isNaN(parsedDate.getTime())) {
    throw new RangeError("Invalid date value");
  }
  return parsedDate.toISOString().split("T")[0];
};

export const toLocaleDateString = (date) => {
  const parsedDate = new Date(date);
  if (isNaN(parsedDate.getTime())) {
    throw new RangeError("Invalid date value");
  }
  return parsedDate.toLocaleDateString();
};

export const getNextDate = (date) => {
  const parsedDate = new Date(date);
  if (isNaN(parsedDate.getTime())) {
    throw new RangeError("Invalid date value");
  }
  parsedDate.setDate(parsedDate.getDate() + 1);
  return parsedDate.toLocaleDateString();
};
