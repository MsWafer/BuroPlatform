const express = require("express");
const connectDB = require("./middleware/db");
const cors = require("cors");
const auth = require("./middleware/auth");
const mob_push = require("./middleware/mob_push");
require("dotenv").config();

const app = express();
connectDB();
app.use(express.json({ extended: false }));
app.use(
  cors({
    exposedHeaders:
      "Content-Type,Authorization,filename,Cache-Control,Date,Keep-Alive,Connection,Content-Length,Access-Control-Allow-Origin",
    credentials: true,
    origin: true,
  })
);
app.use(express.static("public"));
app.use("/ticketSS", express.static(__dirname + "/ticketSS"));
app.use("/avatars", express.static(__dirname + "/avatars"));
app.use("/covers", express.static(__dirname + "/covers"));
app.use("/docfiles", express.static(__dirname + "/docs"));
app.use("/docimages", express.static(__dirname + "/docimages"));
app.use("/images", express.static(__dirname + "/images"));
app.use("/stickers", express.static(__dirname + "/stickers"));

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
app.use("/mob", require("./routes/mobroutes"));
app.use("/kanban", require("./routes/boards"));

const PORT = process.env.PORT || 7070;

app.listen(PORT, () => console.log(`Server started on ${PORT}`));

const { timeline_refresh, expired_check } = require("./middleware/tm_dd");
const rocketCardNotifications = require("./middleware/rocketCardNotifications");

let timeline_check = async () => {
  await timeline_refresh();
  setTimeout(timeline_check, 1000 * 60 * 60 * 1);
};
let expired = async () => {
  await expired_check();
  setTimeout(expired, 1000 * 60 * 60 * 1);
};
let card_notification_check = async () => {
  await rocketCardNotifications();
  setTimeout(card_notification_check, 1000 * 60 * 60 * 1);
};

expired();
timeline_check();
card_notification_check();
const Project = require("./models/Project");
const Card = require("./models/Card");
let a = async () => {
  let cards = await Card.find()
  let projects = await Project.find();
  for (let project of projects) {
    if (!project.backlog_title) {
      project.backlog_title = "Задачи";
    }
    if (!project.image) {
      project.image = "covers/default_project_image.png";
    }
    await project.save();
  }
  for(let card of cards){
    if(!card.review){
      card.review.state = "not_pending"
    }
    for(let task of card.tasks){
      if(!task.cardId){
        task.cardId = card._id;
        task.cardTitle = card.title;
      }
    }
    await card.save()
  }
};
a();
let f = new Date();
console.log(f.toLocaleString())
console.log(f.toLocaleString('ru-RU',{timezone:'utc+3'}))