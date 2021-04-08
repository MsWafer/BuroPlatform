const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const { check, validationResult } = require("express-validator");
const auth = require("../middleware/auth");
const manauth = require("../middleware/manauth");
const admauth = require("../middleware/admauth");
const rocketlogin = require("../middleware/rocketlogin");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const nodemailer = require("nodemailer");
const fetch = require("node-fetch");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, __dirname + "/../public/avatars");
  },
  filename: (req, file, cb) => {
    cb(
      null,
      file.fieldname + "-" + Date.now() + "-" + path.extname(file.originalname)
    );
  },
});
const upload = multer({
  storage: storage,
  limits: { fileSize: 3 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype == "image/png" ||
      file.mimetype == "image/jpg" ||
      file.mimetype == "image/jpeg"
    ) {
      cb(null, true);
    } else {
      cb(null, false);
      return cb(new Error("Разрешенны только .jpg, .png, .jpeg"));
    }
  },
});

const User = require("../models/User");
const Project = require("../models/Project");
const { findOneAndUpdate } = require("../models/User");
const { response } = require("express");
const rcusercheck = require("../middleware/rcusercheck");
const rcpwdsend = require("../middleware/rcpwdsend");
const Division = require("../models/Division");
const Sprint = require("../models/Sprint");
const { use } = require("./ideas");
const Stat = require("../models/Stat");

//registration
router.post("/", async (req, res) => {
  if (!req.body.email && !req.body.rocketname) {
    return res.json({ err: "Заполните поля" });
  }
  if (!req.body.email) {
    return res.json({ err: "Введите email" });
  }
  if (!req.body.rocketname) {
    return res.json({ err: "Введите логин рокетчата" });
  }
  let { email, rocketname } = req.body;
  rocketname = encodeURI(rocketname);

  try {
    //existing user check
    let rcheck = await User.findOne({ rocketname }).select("-password");
    if (rcheck) {
      return res.status(400).json({
        err: "Пользователь с указанным именем rocket.chat уже существует",
      });
    }
    let user = await User.findOne({ email }).select("-password");
    if (user) {
      return res
        .status(400)
        .json({ err: "Пользователь с указанным email уже существует" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ err: "server error" });
  }

  await rcusercheck(req, res);

  if (typeof rocketId === "undefined") {
    return res
      .status(404)
      .json({ err: "Указанный пользователь rocket.chat не найден" });
  }
  //registration
  function makeid(length) {
    let result = "";
    let characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  try {
    let pwd = makeid(6);

    user = new User({
      email,
      rocketname,
      avatar: "avatars/spurdo.png",
      rocketId,
      device_tokens: req.body.dev_id ? [req.body.dev_id] : [],
    });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(pwd, salt);

    await rcpwdsend(req, res, pwd);

    await user.save();
    console.log("new user registered");

    //jsonwebtoken return
    const payload = { user: { id: user.id } };

    jwt.sign(
      payload,
      process.env.jwtSecret,
      { expiresIn: 360000000 },
      (err, token) => {
        if (err) throw err;
        res.json({
          token: token,
          id: user.id,
          msg: "Пароль был отправлен вам в rocket.chat",
        });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send("server error");
  }
});

//user edit
router.put(
  "/me",
  [
    check("name", "Введите имя").not().isEmpty(),
    check("lastname", "Введите фамилию").not().isEmpty(),
    check("position", "Введите должность").not().isEmpty(),
  ],
  auth,
  async (req, res) => {
    try {
      if (!req.body.position || !req.body.name || !req.body.lastname) {
        return res.json({ err: "Заполните поля" });
      }

      let user = await User.findOne({ _id: req.user.id });
      let keys = Object.keys(req.body);
      keys.forEach((key) => {
        if (key != "division") {
          user[key] = req.body[key];
        }
      });
      user.fullname = user.lastname + " " + user.name;
      await user.save();
      return res.redirect(303, "/users/me");
      // json({
      //   msg: "Данные пользователя обновлены",
      //   userid: user,
      // });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ err: "server error" });
    }
  }
);

//edit another user
router.put("/edit/:id", manauth, async (req, res) => {
  try {
    let user = await User.findOne({ _id: req.params.id })
      .populate("sprint")
      .populate("division")
      .populate("projects");
    if (!user) {
      return res.status(404).json({ err: "Пользователь не найден" });
    }
    req.body.fullname = req.body.lastname + " " + req.body.name;
    let keys = Object.keys(req.body);
    keys.forEach((key) => (user[key] = req.body[key]));
    await user.save();
    return res.json(user);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ err: "server error" });
  }
});

//get current user's info
router.get("/me", auth, async (req, res) => {
  try {
    let user = await User.findOne({ _id: req.user.id })
      .select("-password")
      .populate([
        {
          path: "projects",
          select: "sprints type stage dateFinish title crypt status about",
          populate: { path: "sprints" },
        },
        {
          path: "division",
        },
        {
          path: "sprints",
          select: "status project title tasks tags",
          match: { status: false },
          populate: { path: "project", select: "crypt title" },
        },
      ]);
    let d = new Date();
    let stat = await Stat.findOne({
      day: d.getDate(),
      month: d.getMonth() + 1,
      year: d.getFullYear(),
    });
    if (!stat) {
      stat = new Stat({
        date: d,
        day: d.getDate(),
        month: d.getMonth() + 1,
        year: d.getFullYear(),
        users: [user._id],
        user_count: 1,
      });
      await stat.save();
    } else {
      if (!stat.users.includes(user._id)) {
        stat.users.push(user._id);
        stat.user_count += 1;
        await stat.save();
      }
    }

    if (user.division && !user.division.members.includes(req.user.id)) {
      await Division.findOneAndUpdate(
        { divname: user.division.divname },
        { $push: { members: req.user.id } }
      );
    }
    if (!user.partition) {
      user.partition = [];
      await user.save();
    }

    if (req.query.tasks == "true") {
      let history_array = user.tasks; //.sort((a, b) => a.date - b.date);
      let dateless_arr = [];
      let userTasks = user.tasks
        .filter((el) => !el.deadline && el.taskStatus == false)
        .sort((a, b) => a.date - b.date);
      let userTasksDeadline = user.tasks
        .filter((el) => el.deadline && el.taskStatus == false)
        .sort((a, b) => a.deadline - b.deadline);
      let sprints = await Sprint.find({
        "tasks.user": req.user.id,
      }).select("tasks project");
      if (sprints.length > 0) {
        let arr = [];
        sprints.forEach((sprint) => {
          sprint.tasks.forEach((task) => {
            if (task.user == req.user.id) {
              task.project = sprint.project;
              arr.push(task);
              task.date ? history_array.push(task) : dateless_arr.push(task);
            }
          });
        });
        history_array = history_array
          .sort((a, b) => a.date - b.date)
          .concat(dateless_arr);
        user.tasks = arr;
        if (req.query.project && req.query.project != "Все") {
          await user
            .populate([
              {
                path: "tasks.project",
                select: "title",
              },
            ])
            .execPopulate();
          function regexEscape(str) {
            return str.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
          }
          let regex = new RegExp(
            regexEscape(decodeURI(req.query.project)),
            "g"
          );

          user.tasks = user.tasks.filter((el) => el.project.title.match(regex));
        }
      }
      await user
        .populate([
          {
            path: "tasks.user2",
            select: "avatar fullname",
          },
          {
            path: "tasks.project",
            select: "title crypt",
          },
        ])
        .execPopulate();

      let arr = [];
      let arr2 = [];
      let arr3 = [];
      let arr4 = [];
      user.tasks = user.tasks
        .filter((task) => task.date)
        .sort((a, b) => a.date - b.date);
      if (userTasks.length > 0) {
        for (let task of userTasks) {
          arr2 = arr.filter(
            (el) =>
              el.date.getDate() === task.date.getDate() &&
              el.date.getMonth() === task.date.getMonth() &&
              el.date.getFullYear() === task.date.getFullYear()
          );
          arr2.length < 1
            ? arr.push({
                date: task.date,
                tasks: [task],
              })
            : arr[arr.indexOf(arr2[0])].tasks.push(task);
        }
        user.activeTasks = arr;
      }
      if (userTasksDeadline.length > 0) {
        for (let task of userTasksDeadline) {
          arr4 = arr3.filter(
            (el) =>
              el.date.getDate() === task.deadline.getDate() &&
              el.date.getMonth() === task.deadline.getMonth() &&
              el.date.getFullYear() === task.deadline.getFullYear()
          );
          arr4.length < 1
            ? arr3.push({
                date: task.deadline,
                tasks: [task],
              })
            : arr3[arr3.indexOf(arr4[0])].tasks.push(task);
        }
        user.deadlineTasks = arr3;
      }
      let final_array = [];
      let check_array = [];
      for (let task of history_array) {
        check_array = task.date
          ? final_array.filter(
              (year_obj) => year_obj.year == task.date.getFullYear()
            )
          : final_array.filter((year_obj) => year_obj.year == "Без даты");
        if (check_array.length == 0) {
          let obj = {
            year: task.date ? task.date.getFullYear() : "Без даты",
            month_tasks: task.date
              ? [
                  { month: "Январь", tasks: [] },
                  { month: "Февраль", tasks: [] },
                  { month: "Март", tasks: [] },
                  { month: "Апрель", tasks: [] },
                  { month: "Май", tasks: [] },
                  { month: "Июнь", tasks: [] },
                  { month: "Июль", tasks: [] },
                  { month: "Август", tasks: [] },
                  { month: "Сентябрь", tasks: [] },
                  { month: "Октябрь", tasks: [] },
                  { month: "Ноябрь", tasks: [] },
                  { month: "Декабрь", tasks: [] },
                ]
              : [{ month: "Неизвестно", tasks: [] }],
          };
          task.date
            ? obj.month_tasks[task.date.getMonth()].tasks.push(task)
            : obj.month_tasks[0].tasks.push(task);
          final_array.push(obj);
        } else {
          let ind = final_array.indexOf(check_array[0]);
          task.date
            ? final_array[ind].month_tasks[task.date.getMonth()].tasks.push(
                task
              )
            : final_array[ind].month_tasks[0].tasks.push(task);
        }
      }

      user.taskHistory = final_array.reverse();
      await User.populate(user, {
        path: "taskHistory.month_tasks.tasks.project",
        select: "title crypt",
      });
      // user.__v+=Math.floor(Math.random()*200)
      // console.log(user.__v)
    }

    console.log("user found");
    return res.json(user);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: "Server error" });
  }
});

//get all user's sprints
router.get("/me/sprints", auth, async (req, res) => {
  try {
    let sprints = await User.findOne({ _id: req.user.id })
      .select("sprints")
      .populate("sprints");
    return res.json(sprints);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: "server error" });
  }
});

//change current user's password
router.put("/me/pw", auth, async (req, res) => {
  try {
    const salt = await bcrypt.genSalt(10);
    newPassword = await bcrypt.hash(req.body.password, salt);
    await User.findOneAndUpdate(
      { _id: req.user.id },
      { $set: { password: newPassword } }
    );
    console.log("юзер сменил пароль");
    res.json({ msg: "Ваш пароль был успешно изменен" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ err: "server error" });
  }
});

//change or add avatar
router.put("/me/a", upload.single("file"), auth, async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.user.id })
      .select("-password")
      .populate({
        path: "projects",
        select: "-team",
        populate: { path: "sprints" },
      })
      .populate("tickets", "-user")
      .populate("division")
      .populate({
        path: "sprints",
        match: { status: false },
        populate: { path: "project" },
      });
    if (!user) {
      return res.json({ msg: "Пользователь не найден" });
    }
    console.log(req.file);
    console.log("old",user.avatar)
    if (
      user.avatar != "avatars/spurdo.png" &&
      user.avatar != "avatars/spurdo.jpg"
    ) {
      fs.unlink(__dirname + `/../public/${user.avatar}`, (err) => {
        if (err) {
          throw err;
        }
      });
    }
    user.avatar = req.file ? "avatars/" + req.file.filename : user.avatar;
    await user.save();
    console.log("new",user.avatar)

    let tasks = [];
    let sprints = await Sprint.find({
      "tasks.user": req.user.id,
      status: false,
    }).select("tasks");
    if (!sprints) {
      tasks = [];
    } else {
      sprints.forEach((sprint) => {
        sprint.tasks.forEach((task) => {
          if (task.user == req.user.id) {
            tasks.push(task);
          }
        });
      });
    }
    user.tasks = tasks;

    console.log("avatar changed/added");
    return res.json({ msg: "Ваш аватар был изменен", user: user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ err: "server error" });
  }
});

//change user's position
router.put("/poschange/:id", manauth, async (req, res) => {
  try {
    let user = await User.findOneAndUpdate(
      { _id: req.params.id },
      { $set: { position: req.body.position } }
    );
    if (!user) {
      return res.status(404).json({ msg: "Указанный пользователь не найден" });
    }
    console.log("users position changed");
    return res.json({ msg: "Должность пользователя изменена" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ err: "server error" });
  }
});

//change user's permission
router.put("/permchange/:id", admauth, async (req, res) => {
  try {
    let user = await User.findOneAndUpdate(
      { _id: req.params.id },
      { $set: { permission: req.body.permission } }
    );
    if (!user) {
      return res
        .status(404)
        .json({ msg: "Не найден пользователь с указанным id" });
    }
    console.log("users permission changed");
    return res.json({ msg: "Разрешения пользователя изменены" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ err: "server error" });
  }
});

//change rocket username
router.put("/me/rocket", auth, async (req, res) => {
  try {
    await fetch(
      `${process.env.CHAT}/api/v1/users.info?username=${req.body.rocketname}`,
      {
        method: "get",
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
          "X-Auth-Token": process.env.tokena,
          "X-User-Id": process.env.userId,
        },
      }
    )
      .then((response) => response.json())
      .then((response) => {
        if (typeof response.user._id === "undefined") {
          return res
            .status(404)
            .json({ msg: "Указанный пользователь rocket.chat не найден" });
        } else {
          User.findOneAndUpdate(
            { _id: req.user.id },
            {
              $set: {
                rocketname: req.body.rocketname,
                rocketId: response.user._id,
              },
            }
          );
        }
      });
    return res.json({ msg: "Юзернейм рокетчата изменен" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: "server error" });
  }
});

//find all users
router.get("/all", auth, async (req, res) => {
  try {
    let users = await User.find({ merc: { $ne: true } })
      .select(
        "_id avatar fullname name lastname position partition division sprints projects bday email"
      )
      .populate("division");
    users = users.filter((user) => user.merc !== true);
    let que = req.query.field;
    let order;
    if (req.query.order == "true") {
      order = 1;
    } else {
      order = -1;
    }
    Array.prototype.sortBy = (query) => {
      return users.slice(0).sort(function (a, b) {
        return a[query] > b[query] ? order : a[query] < b[query] ? -order : 0;
      });
    };
    console.log("GET all users");
    return res.json(users.sortBy(que));
  } catch (err) {
    console.error(err.message);
    res.status(500).send("server error");
  }
});

//specific query
router.get("/q/search", auth, async (req, res) => {
  try {
    if (!req.query.field || !req.query.value) {
      let prj = await User.find().sort({ fullname: 1 });
      return res.json(prj);
    }
    let qObj = {};
    qObj[req.query.field] = req.query.value;
    // console.log(qObj)
    let prj = await User.find(qObj).sort({ fullname: 1 });
    if (!prj) {
      return res.status(404).json({ err: "Проекты не найдены" });
    }
    console.log("huy");
    return res.json(prj);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ err: "server error" });
  }
});

//find user by id
router.get("/:id", auth, async (req, res) => {
  try {
    let user = await User.findById(req.params.id)
      .select("-password -report -permission")
      .populate({
        path: "projects",
        select: "-team",
        populate: { path: "sprints" },
      })
      .populate("division")
      .populate("tickets", "-user");

    let tasks = [];
    let sprints = await Sprint.find({
      "tasks.user": req.params.id,
      status: false,
    })
      .select("tasks project")
      .populate("project", "crypt title");
    if (!sprints) {
      tasks = [];
    } else {
      sprints.forEach((sprint) => {
        sprint.tasks.forEach((task) => {
          if (task.user == req.params.id) {
            (task.project = sprint.project), tasks.push(task);
          }
        });
      });
    }
    user.tasks = tasks;
    if (!user) {
      console.log("user not found");
      return res.status(404).json({ msg: "Пользователь не найден" });
    }
    console.log("user found");
    return res.json(user);
  } catch (err) {
    console.error(err.message);
    return res.status(500).send("server error");
  }
});

//delete user by id
router.delete("/:id", admauth, async (req, res) => {
  try {
    let user = await User.findOne({ _id: req.params.id }).select("-password");
    if (!user) {
      return res.status(404).json("Не найден пользователь с указанным id");
    }
    await Project.updateMany(
      { team: user.id },
      { $pull: { team: user.id } },
      { multi: true }
    );
    await user.remove();
    console.log("User deleted");
    return res.json({ msg: `Пользователь удален` });
  } catch (err) {
    console.error(err.message);
    return res.status(500).send("server error");
  }
});

//change user's partition
router.put("/part", auth, async (req, res) => {
  try {
    let usr = await User.findOne({ _id: req.user.id });
    if (!usr) {
      return res.status(404).json({ err: "Huynya yakas" });
    }
    usr.partition = req.body.partition;
    await usr.save();
    return res.json(usr);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ err: "server error" });
  }
});

//get user by letters
router.get("/usr/get", auth, async (req, res) => {
  try {
    function regexEscape(str) {
      return str.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
    }
    let query = {};
    // console.log(req.query)
    if (req.query.name && req.query.name != "") {
      query.fullname = { $regex: regexEscape(req.query.name), $options: "i" };
    }
    if (req.query.partition && req.query.partition != "") {
      query.partition = req.query.partition;
    }
    if (req.query.merc) {
      query.merc = { $ne: true };
    }
    let usr = await User.find(query)
      .select("-password -permission")
      .populate("division");
    if (
      req.query.division &&
      req.query.division != "" &&
      req.query.division != "all"
    ) {
      usr = usr.filter(
        (user) =>
          user.division != undefined &&
          user.division.divname == decodeURI(req.query.division)
      );
    }
    if (req.query.crypt && req.query.crypt !== "") {
      let project = await Project.findOne({ crypt: req.query.crypt });
      usr = usr.filter((user) => !user.projects.includes(project._id));
    }

    return res.json(usr);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ err: "server error" });
  }
});

//get users by position
router.get("/usr/pos", auth, async (req, res) => {
  try {
    function regexEscape(str) {
      return str.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
    }
    let usrs = await User.find({
      position: { $regex: regexEscape(req.query.position), $options: "i" },
    })
      .select(
        "_id avatar fullname name lastname position partition division sprints projects email"
      )
      .populate("division");
    return res.json(usrs);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ err: "server error" });
  }
});

//add/change own report
router.put("/me/report", auth, async (req, res) => {
  try {
    let user = await User.findOne({ _id: req.user.id });
    user.report = CryptoJS.AES.encrypt(
      req.body.report,
      process.env.encKey
    ).toString(CryptoJS.enc.Utf8);
    await user.save();
    return res.json({ msg: "Отчетность добавлена" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ err: "server error" });
  }
});

//get own report
router.get("/me/report", auth, async (req, res) => {
  try {
    let user = await User.findOne({ _id: req.user.id });
    let report = CryptoJS.AES.decrypt(user.report, process.env.encKey).toString(
      CryptoJS.enc.Utf8
    );
    return res.json(report);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ err: "server error" });
  }
});

//get user's report
router.get("/report/:id", manauth, async (req, res) => {
  try {
    let user = await User.findOne({ _id: req.params.id });
    if (!user) {
      return res.status(400).json({ err: "Not found" });
    }
    let report = CryptoJS.AES.decrypt(user.report, process.env.encKey).toString(
      CryptoJS.enc.Utf8
    );
    return res.json(report);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ err: "server error" });
  }
});

//recover password via RC
router.post("/passRC", async (req, res) => {
  try {
    let { email } = req.body;
    let check = await User.findOne({ email }).select("-password");
    if (!check) {
      return res.json({ err: "Пользователь с указанным email не найден" });
    }
    await rcusercheck(req, res);
    if (typeof rocketId === "undefined") {
      return res
        .status(404)
        .json({ msg: "Указанный пользователь rocket.chat не найден" });
    }

    function makeid(length) {
      let result = "";
      let characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      let charactersLength = characters.length;
      for (let i = 0; i < length; i++) {
        result += characters.charAt(
          Math.floor(Math.random() * charactersLength)
        );
      }
      return result;
    }

    let pwd = makeid(6);
    const salt = await bcrypt.genSalt(10);
    check.password = await bcrypt.hash(pwd, salt);
    await check.save();

    await rcpwdsend(req, res, pwd);

    return res.json({ msg: "Новый пароль был отправлен вам в rocket.chat" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ err: "server error" });
  }
});

//bday sort
router.get("/eee/dr", async (req, res) => {
  try {
    let currMonth = new Date().getMonth() + 1;
    let nextMonth;
    if (currMonth <= 11) {
      nextMonth = currMonth + 1;
    } else {
      nextMonth = 1;
    }
    let users = await User.find({ merc: { $ne: true } }).select(
      "bday fullname avatar"
    );
    users = users.filter(
      (user) =>
        (user.bday && user.bday.getMonth() + 1 == currMonth) ||
        (user.bday && user.bday.getMonth() + 1 == nextMonth)
    );
    users.sort((a, b) => {
      let aMonth = a.bday.getMonth() + 1;
      let aDay = a.bday.getDate();
      let bMonth = b.bday.getMonth() + 1;
      let bDay = b.bday.getDate();
      if (aMonth == bMonth) {
        return aDay < bDay ? -1 : aDay > bDay ? 1 : 0;
      } else {
        return aMonth < bMonth ? -1 : 1;
      }
    });
    return res.json(users);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ err: "server error" });
  }
});

//////////////////
//////TASKS//////
/////////////////

//add own task
router.put("/me/addtask", auth, async (req, res) => {
  try {
    if (!req.body.taskTitle) {
      return res.json({ err: "Введите текст задачи" });
    }
    let user = await User.findOne({ _id: req.user.id });
    let task = {
      taskTitle: req.body.taskTitle,
      workVolume: 0,
      date: Date.now(),
      deadline: req.body.deadline,
      own: true,
      user2: req.user.id,
    };
    user.tasks.push(task);
    await user.save();
    return res.redirect(303, "/users/me?tasks=true");
  } catch (error) {
    console.error(error);
    return res.status(500).json({ err: "server error" });
  }
});

//change own task status
router.put("/me/task/status/:id", auth, async (req, res) => {
  try {
    let query = await Sprint.findOne({
      "tasks._id": req.params.id,
    }).select("tasks");
    if (!query) {
      query = await User.findOne({ _id: req.user.id }).select("tasks");
    }
    if (!query) {
      return res.status(404).json("pisos");
    }
    query.tasks.forEach((task) => {
      if (task._id == req.params.id) {
        task.taskStatus = !task.taskStatus;
        task.taskStatus
          ? (task.dateClose = new Date())
          : (task.dateClose = null);
      }
    });
    await query.save();
    console.log("task de/activated");
    res.redirect(303, "/users/me?tasks=true");
  } catch (error) {
    console.error(error);
    return res.status(500).json({ err: "server error" });
  }
});

//edit own task
router.put("/me/task/edit/:id", auth, async (req, res) => {
  try {
    let query = await Sprint.findOne({ "tasks._id": req.params.id });
    if (!query) {
      query = await User.findOne({ _id: req.user.id });
    }
    let task = query.tasks.filter((el) => el._id == req.params.id);
    if (task.length < 1) {
      return res.status(404);
    }
    let keys = Object.keys(req.body);
    for (let key of keys) {
      task[0][key] = req.body[key];
    }
    if (!task[0].taskTitle) {
      return res.json({ err: "Введите текст задачи" });
    }
    await query.save();
    return res.redirect(303, "/users/me?tasks=true");
  } catch (error) {
    console.error(error);
    return res.status(500).json({ err: "server error" });
  }
});

//delete own task
router.delete("/me/task/delete/:id", auth, async (req, res) => {
  try {
    let user = await User.findOne({ _id: req.user.id });
    user.tasks = user.tasks.filter((task) => task._id != req.params.id);
    await user.save();
    return res.redirect(303, "/users/me?tasks=true");
  } catch (error) {
    console.error(error);
    return res.status(500).json({ err: "server error" });
  }
});

//delay/undelay own task
router.put("/me/task/delay/:id", auth, async (req, res) => {
  try {
    let user = await User.findOne({ _id: req.user.id });
    let task = user.tasks.filter((el) => el._id == req.params.id)[0];
    task.delay = !task.delay;
    await user.save();
    return res.redirect(303, "/users/me?tasks=true");
  } catch (error) {
    console.error(error);
    return res.status(500).json({ err: "server error" });
  }
});

//read notification
router.put("/notificationread", auth, async (req, res) => {
  try {
    let user = await User.findOne({ _id: req.user.id });
    for (let notification of user.notifications) {
      if (req.body.ids.includes(notification.data.id.toString())) {
        notification.data.read = !notification.data.read;
      }
    }
    for (abc of user.notifications) {
      console.log("before", abc.data);
    }
    await user.save();
    for (abc of user.notifications) {
      console.log("after", abc.data);
    }
    return res.redirect(303, "/users/me");
  } catch (error) {
    console.error(error);
    return res.status(500).json({ err: "server error" });
  }
});

//PERMISSIOn
router.get("/permission/mne/zapili", auth, async (req, res) => {
  try {
    let user = await User.findOne({ _id: req.user.id }).select("permission");
    return res.json({ permission: user.permission });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ err: "server error" });
  }
});

////////////////////
///УГОЛ ОПУЩЕНЦЕВ///
////////////////////

//COSTIL
router.get("/govno/govno", async (req, res) => {
  try {
    let usrs = await User.find();
    usrs.map((usr) => (usr.fullname = usr.lastname + " " + usr.name));

    const userPromises = usrs.map((usr) => {
      return new Promise((resolve, reject) => {
        usr.save((error, result) => {
          if (error) {
            reject(error);
          }
          resolve(result);
        });
      });
    });

    Promise.all(userPromises).then((response) => {
      return res.json(response);
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ err: "server error" });
  }
});

//find user by mail, generate recovery code, save it to model and send to user's email
router.put("/passrec", async (req, res) => {
  let user = await User.findOne({ email: req.body.email }).select(
    "-password -permission -avatar"
  );
  if (!user) {
    return res.json({ msg: "Не найден пользователь с указанным email" });
  }

  //generating recovery code
  function makeid(length) {
    let result = "";
    let characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  //unnecessary security stuff
  try {
    let reccds = [];
    let users = await User.find().select("reccode");
    users.map((user) => reccds.push(user.reccode));
    const promise = () =>
      new Promise((resolve) => {
        recCode = makeid(6);
        if (reccds.includes(recCode)) {
          resolve(promise());
        }
      });
    promise();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: "server error" });
  }

  //send email
  try {
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.B_E,
        pass: process.env.B_P,
      },
    });
    let mailOptions = {
      from: process.env.B_E,
      to: req.body.email,
      subject: `<no-reply> Восстановление пароля на платформе Buro82`,
      text: `Ваш код для восстановление пароля: ${recCode}`,
    };
    transporter.sendMail(mailOptions, function (error, info) {
      console.log("Email sent: " + info.response);
      return res.json({
        msg: `Код восстановления был отправлен на ${req.body.email}`,
        recCode: recCode,
      });
    });

    //saving recovery code to model
    await User.findOneAndUpdate(
      { email: req.body.email },
      { $set: { reccode: recCode } }
    );
  } catch (error) {
    console.log(error);
    return res.status(400).json(error);
  }
});

//check recovery code
router.get("/passrec/2", async (req, res) => {
  let user = await User.findOne({ recCode: rec.body.recCode }).select(
    "-password"
  );
  if (!user || rec.body.recCode == "a") {
    return res.json({ err: "Введен неверный код" });
  }
  return res.json({
    msg: "Введите новый пароль",
    recCode: req.body.recCode,
  });
});

//new password stuff
router.put(
  "/passrec/3",
  check(
    "password",
    "Введите пароль длиной не менее 7 и не более 20 символов"
  ).isLength({ min: 7, max: 20 }),
  async (req, res) => {
    if (!req.body.password) {
      return res.json({ msg: "Введите новый пароль" });
    }
    try {
      const salt = await bcrypt.genSalt(10);
      newPassword = await bcrypt.hash(req.body.password, salt);
      let user = await User.findOneAndUpdate(
        { recCode: req.body.recCode },
        { $set: { password: newPassword } },
        { $set: { recCode: "a" } }
      );
      console.log("Пароль изменен");
      return res.json({
        msg: "Пароль изменен",
        userid: user.id,
      });
    } catch (error) {
      console.log(error);
      return res.json({ err: "Server error" });
    }
  }
);

module.exports = router;
