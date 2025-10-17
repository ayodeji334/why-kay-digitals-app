export const formatDate = (
  dateString: string,
  shouldIncudeTime: boolean = true,
) => {
  const date = new Date(dateString);

  const dateOptions: any = {
    month: "short",
    day: "numeric",
    year: "numeric",
  };

  const formattedDate = date.toLocaleDateString("en-US", dateOptions);

  if (shouldIncudeTime) {
    const timeOptions: any = {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    };
    const formattedTime = date.toLocaleTimeString("en-US", timeOptions);

    return `${formattedDate} ${formattedTime}`;
  }
  return formattedDate;
};

export const customizedformatDate = (input: string | Date): string => {
  const date = new Date(input);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");

  return `${yyyy}-${mm}-${dd}`;
};
