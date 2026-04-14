const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const ADMIN_USER = "admin";
const ADMIN_PASS = "#!54847**__";

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

app.get("/dashboard", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "dashboard.html"));
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (username === ADMIN_USER && password === ADMIN_PASS) {
    res.json({ ok: true });
  } else {
    res.json({ ok: false });
  }
});

app.get("/data", (req, res) => {
  fs.readFile("appointments.csv", "utf8", (err, data) => {
    if (err || !data) return res.json([]);

    const lines = data.trim().split("\n").slice(1);

    const result = lines
      .filter(line => line.trim())
      .map(line => {
        const [name, phone, email, problem, date, time, status] = line.split(",");
        return {
          name,
          phone,
          email,
          problem,
          date,
          time,
          status: status || "Pending"
        };
      });

    res.json(result);
  });
});

app.get("/slots", (req, res) => {
  const { date } = req.query;

  fs.readFile("appointments.csv", "utf8", (err, data) => {
    if (err || !data) return res.json([]);

    const lines = data.trim().split("\n").slice(1);
    const booked = [];

    lines.forEach(line => {
      if (!line.trim()) return;

      const cols = line.split(",");
      const existingDate = cols[4];
      const existingTime = cols[5];

      if (existingDate === date) {
        booked.push(existingTime);
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

  fs.readFile("appointments.csv", "utf8", (err, data) => {
    const lines = data ? data.trim().split("\n").slice(1) : [];

    for (let line of lines) {
      if (!line.trim()) continue;

      const cols = line.split(",");
      const existingDate = cols[4];
      const existingTime = cols[5];

      if (existingDate === date) {
        const existingMinutes = timeToMinutes(existingTime);
        if (Math.abs(existingMinutes - newTime) < 35) {
          return res.json({ ok: false, msg: "Slot not available (35 min gap required)" });
        }
      }
    }

    const safeName = (name || "").replace(/,/g, " ");
    const safePhone = (phone || "").replace(/,/g, " ");
    const safeEmail = (email || "").replace(/,/g, " ");
    const safeProblem = (problem || "").replace(/,/g, " ");
    const safeDate = (date || "").replace(/,/g, " ");
    const safeTime = (time || "").replace(/,/g, " ");

    const row = `\n${safeName},${safePhone},${safeEmail},${safeProblem},${safeDate},${safeTime},Pending`;

    fs.appendFile("appointments.csv", row, err => {
      if (err) return res.status(500).json({ ok: false });
      res.json({ ok: true });
    });
  });
});

app.post("/update-status", (req, res) => {
  const { phone, date, time, status } = req.body;

  fs.readFile("appointments.csv", "utf8", (err, data) => {
    if (err || !data) return res.status(500).json({ ok: false });

    const lines = data.trim().split("\n");
    const header = lines[0];
    const rows = lines.slice(1);

    const updatedRows = rows.map(line => {
      const cols = line.split(",");

      const existingPhone = cols[1];
      const existingDate = cols[4];
      const existingTime = cols[5];

      if (
        existingPhone === phone &&
        existingDate === date &&
        existingTime === time
      ) {
        cols[6] = status;
      }

      return cols.join(",");
    });

    const finalData = [header, ...updatedRows].join("\n");

    fs.writeFile("appointments.csv", finalData, err => {
      if (err) return res.status(500).json({ ok: false });
      res.json({ ok: true });
    });
  });
});

app.listen(9000, () => {
  console.log("Server running → http://localhost:9000");
});