import { format } from "date-fns";
export const formatDate = (date: Date | number) => {
  return format(
    new Date(typeof date === "number" ? date * 1000 : date),
    "MMM dd, yyyy · HH:mm"
  );
};
