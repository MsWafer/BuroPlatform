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
app.use("/customer", require("./routes/customer"));

const PORT = process.env.PORT || 7070;

app.listen(PORT, () => console.log(`Server started on ${PORT}`));
