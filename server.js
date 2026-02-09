const express = require("express");
const fs = require("fs");

const app = express();

app.use(express.json());
app.use(express.static(__dirname));

app.post("/book", (req, res) => {
  const data = req.body;

  const line =
`Name: ${data.name}
Phone: ${data.phone}
Email: ${data.email}
Problem: ${data.problem}
Date: ${data.date}
Time: ${data.time}
------------------\n`;

  fs.appendFileSync("appointments.txt", line);

  res.json({ ok: true });
});

app.listen(9000, () =>
  console.log("Server running → http://localhost:9000")
);
