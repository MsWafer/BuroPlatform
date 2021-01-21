const express = require("express");
const connectDB = require("./middleware/db");
const cors = require("cors");
const fetch = require("node-fetch");
require("dotenv").config();

const app = express();
connectDB();
app.use(express.json({ extended: false }));
app.use(cors());
app.use(express.static("public"));
app.use("/ticketSS", express.static(__dirname + "/ticketSS"));
app.use("/avatars", express.static(__dirname + "/avatars"));

app.get("/", (req, res) => res.send("Не крашься плиз"));

app.use("/auth", require("./routes/auth"));
app.use("/users", require("./routes/users"));
app.use("/tickets", require("./routes/tickets"));
app.use("/projects", require("./routes/projects"));
app.use("/news", require("./routes/news"));
app.use("/props", require("./routes/props"));
app.use("/divisions", require("./routes/div"));

let rc = async () => {
  await fetch(`${process.env.CHAT}/api/v1/login`, {
    method: "post",
    headers: {
      Accept: "application/json, text/plain, */*",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ user: process.env.R_U, password: process.env.R_P }),
  })
    .then((res) => res.json())
    .then(
      (res) => (
        (process.env.tokena = res.data.authToken),
        (process.env.userid = res.data.userId)
      )
    )
    .then(() => console.log(process.env.tokena));
};
rc();

const PORT = process.env.PORT || 7070;

app.listen(PORT, () => console.log(`Server started on ${PORT}`));
