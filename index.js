const express = require("express");
const connectDB = require("./middleware/db");
const cors = require("cors");
const auth = require("./middleware/auth");
const mob_push = require("./middleware/mob_push");
require("dotenv").config();

const app = express();
connectDB();
app.use(express.json({ extended: false }));
app.use(cors());
app.use(express.static("public"));
app.use("/ticketSS", express.static(__dirname + "/ticketSS"));
app.use("/avatars", express.static(__dirname + "/avatars"));
app.use("/covers", express.static(__dirname + "/covers"));
app.use("/docs", express.static(__dirname + "/docs"));
app.use("/docimages", express.static(__dirname + "/docimages"));

app.get("/", (req, res) => res.send("Не крашься плиз"));
app.post("/ip", async (req, res) => {
  if (process.env.IP != req.body.ip) {
    process.env.IP = req.body.ip;
  }
  console.log(req.body.ip);
  return res.json("uspeh");
});
app.get("/ip", auth, async (req, res) => {
  try {
    return res.json({ ip: process.env.IP });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ err: "server error" });
  }
});

app.use("/auth", require("./routes/auth"));
app.use("/users", require("./routes/users"));
app.use("/tickets", require("./routes/tickets"));
app.use("/projects", require("./routes/projects"));
app.use("/news", require("./routes/news"));
app.use("/props", require("./routes/props"));
app.use("/divisions", require("./routes/div"));
app.use("/customer", require("./routes/customer"));
app.use("/merc", require("./routes/merc"));
app.use("/docs", require("./routes/docs"));
app.use("/prjevent", require("./routes/projevents"));
app.use("/ideas", require("./routes/ideas"));

const PORT = process.env.PORT || 7070;

app.listen(PORT, () => console.log(`Server started on ${PORT}`));
