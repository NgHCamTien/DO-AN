export const sendHolidayEmail = async (event, token) => {
  const res = await fetch("http://localhost:5000/api/email/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ event })
  });

  return res.json();
};
