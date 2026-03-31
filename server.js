const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();

app.use(express.json());
app.use(express.static("public"));

const ADMIN_USER = "admin";
const ADMIN_PASS = "#!54847**__";


app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "login.html"));
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (username === ADMIN_USER && password === ADMIN_PASS) {
    res.json({ ok: true });
  } else {
    res.json({ ok: false });
  }
});

app.get("/dashboard", (req, res) => {
  res.sendFile(path.join(__dirname, "dashboard.html"));
});

app.get("/data", (req, res) => {
  fs.readFile("appointments.txt", "utf8", (err, data) => {
    if (err) return res.json([]);

    const entries = data.split("--------------------------").filter(e => e.trim());

    const result = entries.map(e => ({
      name: e.match(/Name: (.*)/)?.[1],
      phone: e.match(/Phone: (.*)/)?.[1],
      date: e.match(/Date: (.*)/)?.[1],
      time: e.match(/Time: (.*)/)?.[1],
    }));

    res.json(result);
  });
});

app.get("/slots", (req, res) => {
  const { date } = req.query;

  fs.readFile("appointments.txt", "utf8", (err, data) => {
    if (err || !data) return res.json([]);

    const booked = [];
    const entries = data.split("--------------------------");

    entries.forEach(entry => {
      if (entry.includes(`Date: ${date}`)) {
        const match = entry.match(/Time: (.*)/);
        if (match) booked.push(match[1].trim());
      }
    });

    res.json(booked);
  });
});

function timeToMinutes(t) {
  let [time, mod] = t.split(" ");
  let [h, m] = time.split(":");

  h = parseInt(h);
  m = parseInt(m);

  if (mod === "PM" && h !== 12) h += 12;
  if (mod === "AM" && h === 12) h = 0;

  return h * 60 + m;
}

app.post("/book", (req, res) => {
  const { name, phone, email, problem, date, time } = req.body;

  const newTime = timeToMinutes(time);

  fs.readFile("appointments.txt", "utf8", (err, data) => {

    if (data) {
      const entries = data.split("--------------------------");

      for (let entry of entries) {
        if (entry.includes(`Date: ${date}`)) {

          const match = entry.match(/Time: (.*)/);
          if (match) {
            const existingTime = timeToMinutes(match[1].trim());

            if (Math.abs(existingTime - newTime) < 35) {
              return res.json({ ok: false, msg: "Slot not available (35 min gap required)" });
            }
          }
        }
      }
    }

    const line = `
Name: ${name}
Phone: ${phone}
Email: ${email}
Problem: ${problem}
Date: ${date}
Time: ${time}
--------------------------
`;

    fs.appendFile("appointments.txt", line, (err) => {
      if (err) return res.status(500).json({ ok: false });
      res.json({ ok: true });
    });

  });
});

app.listen(9000, () => {
  console.log("Server running → http://localhost:9000");
});