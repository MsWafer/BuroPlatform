const express = require("express");
const router = express.Router();
const { check, validationResult, Result } = require("express-validator");
const auth = require("../middleware/auth");
const manauth = require("../middleware/manauth");
const fetch = require("node-fetch");
const path = require("path");

const CryptoJS = require("crypto-js");

const Project = require("../models/Project");
const Sprint = require("../models/Sprint");
const User = require("../models/User");
const Stat = require("../models/Stat");
const rcprojcreate = require("../middleware/rcprojcreate");
const rckickprj = require("../middleware/rckickprj");
const rcinvprj = require("../middleware/rcinvprj");
const { response } = require("express");
const multer = require("multer");
const mob_push = require("../middleware/mob_push");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, __dirname + "/../public/covers");
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
  limits: { fileSize: 10 * 1024 * 1024 },
  // fileFilter: (req, file, cb) => {
  //   if (
  //     file.mimetype == "image/png" ||
  //     file.mimetype == "image/jpg" ||
  //     file.mimetype == "image/jpeg"
  //   ) {
  //     cb(null, true);
  //   } else {
  //     cb(null, false);
  //     return cb(new Error("Разрешенны только .jpg, .png, .jpeg"));
  //   }
  // },
});

//add new project
router.post(
  "/add",
  auth,
  // upload.single("file"),
  [
    check("title", "Введите название проекта").not().isEmpty(),
    check("type", "Выберите тип проекта").not().isEmpty(),
    check("stage", "Выберите этап строительства").not().isEmpty(),
    check("par", "Выберите раздел").not().isEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ err: errors.array() });
    }

    try {
      let proj_obj = req.body;
      // if (req.file) {
      //   proj_obj.image = req.file
      //     ? "covers/" + req.file.filename
      //     : "avatars/spurdo.png";
      // }

      proj_obj.image = "covers/default_project_image.png"
      console.log(proj_obj);
      if (!proj_obj.dateStart) {
        proj_obj.dateStart = Date.now();
      }

      let count = await Project.find().select("crypt");
      if (count.length > 0) {
        let arr = [];
        for (let el of count) {
          arr.push(Number(el.crypt));
        }
        arr.sort((a, b) => {
          return a - b;
        });
        proj_obj.crypt = arr[arr.length - 1] + 1;
      } else {
        proj_obj.crypt = 1;
      }

      function pad(crypt) {
        return crypt < 10 ? "0" + crypt.toString() : crypt.toString();
      }
      let pepo =
        pad(proj_obj.crypt) + proj_obj.stage.slice(0, 1) + "-" + proj_obj.par;
      proj_obj.crypter = `${proj_obj.dateStart.toString().slice(0, 4)}-${pad(
        proj_obj.crypt
      )}${proj_obj.stage.slice(0, 1)}-${proj_obj.par}`;

      if (proj_obj.rcheck) {
        proj_obj.rocketchat = await rcprojcreate(proj_obj.title, pepo);
      } else {
        proj_obj.rocketchat = null;
      }
      proj_obj.tags = [proj_obj.type];
      project = new Project(proj_obj);

      await project.save();
      console.log(`Проект ${project.title} добавлен`);
      res.json({ project: project, msg: `Проект ${project.title} добавлен` });
      // if(proj_obj.team2){
      //   proj_obj.team2 = proj_obj.team2.split(",")
      // }
      if (proj_obj.team2 && proj_obj.team2.length > 0) {
        let govno = async (project, user) => {
          rcinvprj(project, user), user.projects.push(project._id);
        };
        let userid = [];
        await proj_obj.team2.map((user) => {
          userid.push(user.user);
        });
        let usrs = await User.find({ _id: { $in: userid } });
        usrs.map((user) => govno(project, user));
      }
    } catch (err) {
      console.error(err.message);
      return res.status(500).send("server error");
    }
  }
);

//change project image
router.post(
  "/image/change/:crypt",
  auth,
  upload.single("file"),
  async (req, res) => {
    try {
      let project = await Project.findOne({ crypt: req.params.crypt });
      if (!project) {
        return res.status(404).json({ err: "Проект не найден" });
      }
      if (!req.file) {
        return res.status(400).json({ err: "Файл не загружен" });
      }
      project.image = "covers/" + req.file.filename;
      await project.save();
      return res.redirect(303, "/projects/" + project.crypt);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ err: "server error" });
    }
  }
);

//find all projects
router.get("/", auth, async (req, res) => {
  try {
    let projects = await Project.find()
      .select(
        "crypt crypter sprints title type dateStart dateFinish par stage status tags object"
      )
      .populate("sprints", "status");
    let que = req.query.field;
    let order;
    if (req.query.order == "true") {
      order = 1;
    } else {
      order = -1;
    }
    Array.prototype.sortBy = (query) => {
      return projects.slice(0).sort(function (a, b) {
        return a[query] > b[query] ? order : a[query] < b[query] ? -order : 0;
      });
    };

    console.log("GET all projects");
    return res.json(projects.sortBy(que));
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ err: "server error" });
  }
});

//specific query
router.get("/q/search", auth, async (req, res) => {
  try {
    if (!req.query.field || req.query.value == "Все") {
      let prj = await Project.find()
        .sort({ title: 1 })
        .select(
          "crypt crypter sprints title type dateStart dateFinish par stage status tags object"
        )
        .populate("sprints", "status");
      return res.json(prj);
    }
    let qObj = {};
    function regexEscape(str) {
      return str.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
    }
    qObj[req.query.field] = {
      $regex: regexEscape(req.query.value),
      $options: "i",
    };
    let prj = await Project.find(qObj)
      .sort({ title: 1 })
      .select(
        "crypt sprints title type dateStart dateFinish par stage status tags object"
      )
      .populate("sprints", "status");
    if (!prj) {
      return res.status(404).json({ err: "Проекты не найдены" });
    }
    return res.json(prj);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ err: "server error" });
  }
});

//find project by crypt
router.get("/:auth", async (req, res) => {
  try {
    let project = await Project.findOne({ crypt: req.params.auth })
      .populate(
        "team2.user",
        "-projects -password -permission -tickets -__v -sprints"
      )
      .populate([
        {
          path: "sprints",
          populate: { path: "creator", select: "fullname _id avatar" },
        },
        {
          path: "boards.categories",
          populate: {
            path: "timeline.cards",
            populate: [
              { path: "creator" },
              { path: "execs", select: "avatar fullname" },
            ],
          },
        },
        {
          path: "backlog",
          populate: [
            { path: "creator" },
            { path: "execs", select: "avatar fullname" },
          ],
        },
      ])
      .populate("urnNew.user", "avatar fullname _id")
      .populate("urnNew.old.user", "avatar fullname _id");
    if (!project) {
      return res.status(404).json({ err: "Проект не найден" });
    }
    if (!project.backlog) {
      project.backlog = [];
      await project.save();
    }
    if (project.team2.length == 0 && project.team.length != 0) {
      let team2 = [];
      let user_obj = {};
      await project.team.map((user) => {
        (user_obj = { position: "Проектировщик", task: "А", user: user._id }),
          team2.push(user_obj);
      });
      project.team2 = team2;
      await project.save();
    }
    if (!Array.isArray(project.tags) || project.tags.length < 1) {
      project.tags = [project.type];
      await project.save();
    }
    if (!project.tags.includes(project.type)) {
      await project.tags.unshift(project.type);
      await project.save();
    }
    return res.json(project);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ err: "server error" });
  }
});

//get all user's projects
router.get("/user/:id", auth, async (req, res) => {
  try {
    let projects = await Project.find({ team: req.params.id })
      .sort({ date: -1 })
      .populate("team", "-projects -password -avatar -permission -tickets -__v")
      .populate(
        "team2",
        "-projects -password -avatar -permission -tickets -__v"
      )
      .populate("sprints");

    console.log(`found projects of user ${req.params.id}`);
    return res.json(projects);
  } catch (err) {
    console.error(err.messsage);
    return res.status(500).json({ msg: "server error" });
  }
});

//delete project
router.delete("/:crypt", manauth, async (req, res) => {
  try {
    let project = await Project.findOne({ crypt: req.params.crypt });
    if (!project) {
      return res.status(404).json("Проект не найден");
    }
    await User.updateMany(
      { projects: project.id },
      { $pull: { projects: project.id } },
      { multi: true }
    );
    for (let sprint of project.sprints) {
      await User.updateMany(
        { sprints: sprint },
        { $pull: { sprints: sprint } }
      );
    }
    await Sprint.deleteMany({ project: project._id });
    await project.remove();
    console.log(`project ${req.params.crypt} deleted`);
    return res.json({ msg: `Проект удален` });
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ msg: "server error" });
  }
});

//edit project
router.put("/:crypt", manauth, async (req, res) => {
  try {
    let project = await Project.findOne({ crypt: req.params.crypt });
    if (!project) {
      return res.status(404).json({ err: "Проект не найден" });
    }
    if (typeof req.body.dateStart == "string") {
      req.body.dateStart = new Date(req.body.dateStart);
    }
    if (typeof req.body.dateFinish == "string") {
      req.body.dateFinish = new Date(req.body.dateFinish);
    }
    Object.keys(req.body).forEach((field) => {
      if (field != null && field != "customerNew") {
        typeof req.body[field] == "string"
          ? req.body[field].trim().length > 0
            ? (project[field] = req.body[field])
            : console.log()
          : (project[field] = req.body[field]);
      }
    });
    //for changing old project front needs to send old obj or it's index
    if (req.body.customerNew != null) {
      project.customerNew[0] = req.body.customerNew;
    }
    await project.save();

    console.log(`project ${req.params.crypt} edited`);
    return res.redirect(303, "/projects/" + project.crypt);
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ msg: "server error" });
  }
});

//add rocket
router.put("/addrocket/:crypt", manauth, async (req, res) => {
  try {
    let project = await Project.findOne({ crypt: req.params.crypt });
    if (!project) {
      return res.status(404).json({ err: "Проект не найден" });
    }
    let resp;
    let room = encodeURI(req.body.rocketchat);
    await fetch(`${process.env.CHAT}/api/v1/login`, {
      method: "post",
      headers: {
        Accept: "application/json, text/plain, */*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user: process.env.R_U,
        password: process.env.R_P,
      }),
    })
      .then((response) => response.json())
      .then((response) =>
        fetch(process.env.CHAT + `/api/v1/groups.info?roomName=` + room, {
          method: "get",
          headers: {
            Accept: "application/json, text/plain, */*",
            "Content-Type": "application/json",
            "X-Auth-Token": response.data.authToken,
            "X-User-Id": response.data.userId,
          },
        }).then(async (response) => (resp = await response.json()))
      );
    let msg;
    if (resp.success != false) {
      project.rocketchat = resp.group._id;
      project.rocketname = req.body.rocketchat;
      await project.save();
      msg = "Рокет привязан к проекту";
    } else {
      msg = "Неверно введено имя группы в рокете";
    }
    res.json({ msg: msg });
    if (resp.success != false) {
      await fetch(`${process.env.CHAT}/api/v1/login`, {
        method: "post",
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user: process.env.R_U,
          password: process.env.R_P,
        }),
      })
        .then((response) => response.json())
        .then((response) =>
          fetch(process.env.CHAT + `/api/v1/chat.postMessage`, {
            method: "post",
            headers: {
              Accept: "application/json, text/plain, */*",
              "Content-Type": "application/json",
              "X-Auth-Token": response.data.authToken,
              "X-User-Id": response.data.userId,
            },
            body: JSON.stringify({
              roomId: resp.group._id,
              text: "Канал подключен к платформе",
            }),
          })
        );
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ err: "server error" });
  }
});

//finish project
router.put("/finish/:crypt", manauth, async (req, res) => {
  try {
    let project = await Project.findOne({ crypt: req.params.crypt });
    if (!project) {
      return res.status(404).json({ err: "Проект не найден" });
    }
    project.status = !project.status;
    await project.save();
    console.log("project status changed");
    return res.json({ msg: `Статус проекта изменен` });
  } catch (error) {
    console.log(error);
    return res.json({ err: "server error" });
  }
});

//add/remove user to/from project's team
router.put("/updteam/:crypt", manauth, async (req, res) => {
  try {
    let project = await Project.findOne({ crypt: req.params.crypt });
    if (!project) {
      return res.status(404).json({ err: "Проект не найден" });
    }
    if (!req.body.user || req.body.user == "") {
      return res.status(400).json({ err: "Неверно выбран юзер" });
    }
    let user = await User.findOne({ _id: req.body.user });
    if (!user) {
      return res.status(404).json({ err: "Пользователь не найден" });
    }
    let notification_body;
    let check = project.team2.filter((mate) => mate.user == req.body.user);
    if (check.length > 0) {
      //kick
      project.team2 = project.team2.filter(
        (user) => user.user != check[0].user
      );
      user.projects = user.projects.filter(
        (user_project) => user_project != project._id.toString()
      );
      notification_body = "Вас удалили из команды проекта " + project.title;
    } else {
      //invite
      if (!req.body.user || !req.body.position || !req.body.task) {
        return res.status(400).json({ err: "Заполните все необходимые поля" });
      }
      userObj = {
        user: req.body.user,
        position: req.body.position,
        task: req.body.task,
        fullname: user.fullname,
      };
      project.team2.push(userObj);
      user.projects.push(project._id);
      notification_body = "Вас добавили в команду проекта " + project.title;
    }
    await user.save();
    await project.save();
    await Project.populate(project, "team2.user");
    res.json(project);
    //notification
    if (user.device_tokens && user.device_tokens.length > 0) {
      mob_push(user.device_tokens, notification_body);
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ err: "server error" });
  }
});

//join v2.0
router.put("/join2/:crypt", auth, async (req, res) => {
  try {
    //checks
    let project = await Project.findOne({ crypt: req.params.crypt })
      .populate("team2.user", "-password -permission")
      .populate({
        path: "sprints",
        populate: {
          path: "creator",
          select: "fullname _id avatar",
        },
      });
    if (!project) {
      return res.status(404).json({ err: "Проект не найден" });
    }
    let user = await User.findOne({ _id: req.user.id });
    let msg;
    let member_object;

    let team_check = project.team2.filter(
      (userObj) => userObj.user._id.toString() === user._id.toString()
    );

    if (team_check.length == 0) {
      //join team
      member_object = {
        position: req.body.position,
        task: req.body.task,
        user: req.user.id,
      };
      project.team2.push(member_object);
      user.projects.push(project._id);

      if (project.rocketchat) {
        await rcinvprj(project, user);
      }
      msg = "Вы вступили в команду проекта";
    } else {
      //leave team
      project.team2 = project.team2.filter(
        (user_obj) => user_obj.user._id != req.user.id
      );
      user.projects = user.projects.filter(
        (prj) => prj != project._id.toString()
      );
      if (project.rocketchat) {
        await rckickprj(project, user);
      }
      msg = "Вы вышли из команды проекта";
    }
    await project.save();
    await user.save();
    await Project.populate(project, "team2.user");
    return res.json({ project: project, msg: msg });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ err: "server error" });
  }
});

//edit user's role and task in team
router.put("/roleedit/:crypt", manauth, async (req, res) => {
  try {
    let project = await Project.findOne({ crypt: req.params.crypt }).populate(
      "team2.user",
      "-password -permission"
    );
    if (!project) {
      return res.status(404).json({ err: "Проект не найден" });
    }
    let users = await project.team2.filter((user) => {
      user.user == req.body.id;
    });
    let ind = project.team2.indexOf(users[0]);
    project.team2[ind].position = req.body.position;
    project.team2[ind].task = req.body.task;
    await project.save();
    return res.json(project);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ err: "server error" });
  }
});

//remove user from project's team
router.delete("/updteam/:crypt", manauth, async (req, res) => {
  try {
    let usercheck = await User.findOne({ _id: req.body.userid }).select(
      "-password -avatar -permission"
    );
    if (!usercheck) {
      return res
        .status(400)
        .json({ msg: `Не найден пользователь с указанным _id` });
    }
  } catch (err) {
    if (err.kind == "ObjectId") {
      return res
        .status(400)
        .json({ msg: "Не найден пользователь с указанным _id" });
    }
    res.status(500).send("server error");
  }
  let huy = await Project.findOne({ crypt: req.params.crypt }).select(
    "-_id team"
  );
  if (huy.team.length == 0) {
    return res.status(400).json({ msg: `В команде проекта нет пользователей` });
  }
  let huy2 = huy.toString().replace(/{|}|_id:|\n|]| |\[|team:/g, "");
  let huy3 = huy2.split(",");
  if (!huy3.includes(req.body.userid)) {
    console.log("user not in projects team ");
    return res
      .status(400)
      .json({ msg: `Данный пользователь не находится в команде проекта` });
  }

  try {
    let user = await User.findById(req.body.userid).select(
      "-password -permission"
    );
    await Project.findOneAndUpdate(
      { crypt: req.params.crypt },
      { $pull: { team: user.id } }
    );
    let project = await Project.findOne({ crypt: req.params.crypt });
    await User.findOneAndUpdate(
      { _id: req.body.userid },
      { $pull: { projects: project.id } }
    );

    res.status(200).json({
      msg: `${user.name} удален из команды проекта ${req.params.crypt}`,
    });
    return console.log(
      `${user.name} удален из команды проекта ${req.params.crypt}`
    );
  } catch (error) {
    res.status(400).send(`server error`);
    console.log("произошла якась хуйня");
  }
});

//add infores
router.put("/inf/:crypt", manauth, async (req, res) => {
  try {
    let prj = await Project.findOne({ crypt: req.params.crypt });
    if (!prj) {
      return res.status(404).json({ err: "Не найден проект" });
    }
    await prj.infoRes.push(req.body.info);
    await prj.save();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ err: "server error" });
  }
});

//add customer v.0.2
router.put("/cus/:crypt", manauth, async (req, res) => {
  try {
    let prj = await Project.findOne({ crypt: req.params.crypt });
    if (!prj) {
      return res.status(404).json({ err: "Проект не найден" });
    }
    await prj.customer.push(req.body.customer);
    await prj.save();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ err: "server error" });
  }
});

//add cover
router.put("/cover/:crypt", auth, upload.single("file"), async (req, res) => {
  try {
    let project = await Project.findOne({ crypt: req.params.crypt })
      .populate("sprints")
      .populate("team", "-password -permission");
    if (!project) {
      return response.status(404).json({ err: "Проект не найден" });
    }
    project.cover = req.file ? "covers/" + req.file.filename : project.cover;
    await project.save();
    return res.json(project);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ err: "server error" });
  }
});

//add/edit budget
router.put("/budget/:crypt", manauth, async (req, res) => {
  try {
    let project = await Project.findOne({ crypt: req.params.crypt });
    if (!project) {
      return res.status(404).json({ err: "Проект не найден" });
    }
    let budget = CryptoJS.AES.encrypt(
      req.body.budget,
      process.env.encKey
    ).toString(CryptoJS.enc.Utf8);
    project.budget = budget;
    await project.save();
    return res.json(project);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ err: "server error" });
  }
});

//get budget
router.get("/budget/:crypt", manauth, async (req, res) => {
  try {
    let project = await Project.findOne({ crypt: req.params.crypt }).select(
      "budget"
    );
    let budget = CryptoJS.AES.decrypt(
      project.budget,
      process.env.encKey
    ).toString(CryptoJS.enc.Utf8);
    return res.json(budget);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ err: "server error" });
  }
});

//edit team2 position/job
router.put("/team2/:crypt/:userid", manauth, async (req, res) => {
  try {
    let project = await Project.findOne({ crypt: req.params.crypt });
    if (!project) {
      return res.status(404).json({ err: "Проект не найден" });
    }
    let user2 = project.team2.filter(
      (user) => user.user == req.params.userid
    )[0];
    user2.position = req.body.position;
    user2.task = req.body.task;
    await project.save();
    await Project.populate(project, "team2.user");
    return res.json({ msg: "Данные пользователя обновлены", project: project });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ err: "server error" });
  }
});

//search title
router.get("/title/search", auth, async (req, res) => {
  try {
    function regexEscape(str) {
      return str.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
    }
    let query =
      typeof req.query.title == "string"
        ? {
            title: { $regex: regexEscape(req.query.title), $options: "i" },
          }
        : {};
    let projects = await Project.find(query);
    return res.json(projects);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ err: "server error" });
  }
});

//search [object Object]
router.get("/search/objectobject/object/object", auth, async (req, res) => {
  try {
    let prjs = await Project.find({ object: { $ne: null } }).select("object");
    let obj_arr = [];
    prjs.forEach((prj) => {
      obj_arr.push(prj.object);
    });
    if (req.query.object !== "") {
      function regexEscape(str) {
        return str.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
      }
      let regex = new RegExp(regexEscape(decodeURI(req.query.object)), "g");
      obj_arr = obj_arr.filter((obj) => obj.match(regex));
    }
    let obj_set = new Set(obj_arr);
    return res.json(Array.from(obj_set));
  } catch (error) {
    console.error(error);
    return res.status(500).json({ err: "server error" });
  }
});

///////////////////
///////////////////
///////////////////
/////SPRINTS///////
///////////////////
///////////////////
///////////////////

//add sprint to project found by crypt
router.post("/sprints/new/:crypt", auth, async (req, res) => {
  try {
    let project = await Project.findOne({ crypt: req.params.crypt });
    if (!project) {
      return res
        .status(404)
        .json({ msg: "Не найдено проекта с указанным шифром" });
    }
    let tags;
    if (req.body.tasks) {
      tags = req.body.tags.filter((tag) => tag != null);
    } else {
      tags = [];
    }

    sprint = new Sprint({
      title: req.body.title,
      dateOpen: Date.now(),
      description: req.body.description,
      dateClosePlan: req.body.date,
      tasks: req.body.tasks ? req.body.tasks : [],
      creator: req.user.id,
      tags: tags,
      project: project,
    });
    await sprint.save();
    await project.sprints.unshift(sprint._id);

    if (!Array.isArray(project.tags)) {
      project.tags = [];
    }
    //check if project.tags includes tags from sprint
    let dupe_array = project.tags.concat(tags);
    project.tags = [...new Set(dupe_array)];

    await project.save();
    await Project.populate(project, [
      { path: "sprints" },
      { path: "team2.user" },
    ]);
    console.log("sprint added to project");
    res.json({ sprint: sprint, project: project });
    let d = new Date();
    await Stat.findOneAndUpdate(
      {
        day: d.getDate(),
        month: d.getMonth() + 1,
        year: d.getFullYear(),
      },
      { $inc: { sprints_created: 1 } }
    );
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: "server error" });
  }
});

//add sprint description and planned closing date
router.put("/sprints/dd/:id", auth, async (req, res) => {
  try {
    let spr = await Sprint.findOne({ _id: req.params.id });
    if (!spr) {
      return res.status(404).json({ msg: "Не найден спринт с указанным id" });
    }
    await Sprint.findOneAndUpdate(
      { _id: req.params.id },
      {
        $set: {
          dateClosePlan: req.body.date,
          description: req.body.description,
        },
      }
    );
    return res.json({ msg: `Описание спринта обновлено` });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: "server error" });
  }
});

//edit sprint
router.put("/sprints/edit/:id", auth, async (req, res) => {
  try {
    let sprint = await Sprint.findOne({ _id: req.params.id })
      .populate("tasks.user", "-password -permission")
      .populate("creator", "-password -permission");
    if (!sprint) {
      return res.status(404).json({ err: "Спринт не найден" });
    }
    let keys = Object.keys(req.body);
    keys.forEach((key) => {
      typeof key == "string"
        ? req.body[key].trim().length > 0
          ? (sprint[key] = req.body[key])
          : console.log("Обосрався")
        : (sprint[key] = req.body[key]);
    });
    await sprint.save();
    return res.json(sprint);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ err: "server error" });
  }
});

//find all project's sprints
router.get("/sprints/:crypt", auth, async (req, res) => {
  try {
    let project = await Project.findOne({ crypt: req.params.crypt })
      .select("sprints")
      .populate("sprints");
    if (!project) {
      return res
        .status(404)
        .json({ msg: "Не найдено проектов с указанным шифром" });
    }
    console.log("found all projects sprints");
    return res.json({
      projectid: project.id,
      sprints: project.sprints.reverse(),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: "server error" });
  }
});

//change sprint status
router.put("/sprints/:id", manauth, async (req, res) => {
  try {
    let sprint = await Sprint.findOne({ _id: req.params.id });
    sprint.status = !sprint.status;
    req.body.explanation && (sprint.explanation = req.body.explanation);

    await sprint.save();
    let project = await Project.findOne({ sprints: req.params.id }).populate([
      {
        path: "sprints",
        populate: [
          { path: "tasks.user", select: "avatar fullname" },
          { path: "creator", select: "avatar fullname" },
        ],
      },
      { path: "team2.user", select: "fullname avatar" },
    ]);
    console.log("srint status changed");
    res.json({
      msg: `Статус спринта изменен`,
      sprint: sprint,
      project: project,
    });
    let obj = { complete_sprints_closed: 1 };
    for (let ass of sprint.tasks) {
      if (ass.taskStatus == false) {
        obj = { incomplete_sprints_closed: 1 };
      }
    }
    let d = new Date();
    await Stat.findOneAndUpdate(
      {
        day: d.getDate(),
        month: d.getMonth() + 1,
        year: d.getFullYear(),
      },
      { $inc: obj }
    );
  } catch (error) {
    console.log(error);
    return res.json({ err: "server error" });
  }
});

//get sprint by id
router.get("/getsprint/:id", auth, async (req, res) => {
  try {
    let sprint = await Sprint.findOne({ _id: req.params.id })
      .populate("tasks.user", "-password -permission")
      .populate("creator", "-password -permission");
    if (!sprint) {
      return res.status(404).json({ err: "Спринт не найден" });
    }
    console.log("sprint found by id");
    return res.json(sprint);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ err: "server error" });
  }
});

//un/favorite sprint by id
router.put("/favsprint/:id", auth, async (req, res) => {
  try {
    let user = await User.findOne({ _id: req.user.id }).select("sprints");
    let sprint = await Sprint.findOne({ _id: req.params.id });
    if (!sprint) {
      return res.status(404).json({ err: "Спринт не найден" });
    }
    // let msg;
    if (user.sprints.includes(req.params.id)) {
      //unfavorite
      // await User.findOneAndUpdate(
      //   { _id: req.user.id },
      //   { $pull: { sprints: req.params.id } }
      // );
      user.sprints = user.sprints.filter(
        (el) => el.toString() != req.params.id.toString()
      );
      console.log(`user unfavorited sprint`);
      // msg = "Вы убрали спринт из избранных";
    } else {
      //favorite
      // await User.findOneAndUpdate(
      //   { _id: req.user.id },
      //   { $push: { sprints: req.params.id } }
      // );
      user.sprints.push(req.params.id);
      console.log(`user favorited sprint`);
      // msg = "Вы добавили спринт в избранные";
    }
    await user.save();
    return res.redirect(303, "/users/me");
  } catch (error) {
    console.error(error);
    return res.status(500).json({ err: "server error" });
  }
});

//delete sprint by id
router.delete("/sprints/:id", manauth, async (req, res) => {
  try {
    let sprint = await Sprint.findOne({ _id: req.params.id });
    if (!sprint) {
      return res.status(404).json({ err: "Не найден спринт с указанным id" });
    }
    let project = await Project.findOne({ sprints: req.params.id }).populate([
      {
        path: "sprints",
        populate: [
          { path: "tasks.user", select: "avatar fullname" },
          { path: "creator", select: "avatar fullname" },
        ],
      },
      { path: "team2.user", select: "fullname avatar" },
    ]);
    project.sprints = project.sprints.filter(
      (el) => el._id.toString() != req.params.id.toString()
    );
    await project.save();
    await User.updateMany(
      { sprints: sprint._id },
      { $pull: { sprints: sprint._id } }
    );
    await sprint.remove();
    console.log("sprint deleted");
    return res.json({ msg: "Спринт удален", project: project });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ err: "server error" });
  }
});

//get project's sprints filtered by something
router.get("/sprint/tagsort", auth, async (req, res) => {
  try {
    let project = await Project.findOne({ crypt: req.query.crypt })
      .populate({
        path: "sprints",
        populate: { path: "creator" },
      })
      .populate({ path: "team2.user", select: "_id avatar phone" });
    if (!project) {
      return res.status(404).json({ err: "Проект не найден" });
    }
    project.sprints = project.sprints.filter((sprint) =>
      sprint.tags.includes(req.query.tag)
    );
    return res.json(project);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ err: "server error" });
  }
});

//add tags to sprint
router.put("/sprints/addtag/:id", auth, async (req, res) => {
  try {
    let sprint = await Sprint.findOne({ _id: req.params.id })
      .populate("tasks.user", "-password -permission")
      .populate("creator", "-password -permission");
    if (!sprint) {
      return res.status(404).json({ err: "Спринт не найден" });
    }
    let project = await Project.findOne({ sprints: req.params.id });
    if (!project.tags.includes(req.body.tag)) {
      await project.tags.push(req.body.tag);
      await project.save();
    }

    sprint.tags.push(req.body.tag);
    await sprint.save();

    return res.json(sprint);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ err: "server error" });
  }
});

//get sprints by tags
router.get("/sprint/tags", auth, async (req, res) => {
  try {
    let sprints = await Sprint.find({ tags: { $all: req.query.tag } })
      .populate("creator", "-password -permission")
      .populate("tasks.user", "-password -permission");
    return res.json(sprints);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ err: "server error" });
  }
});

//remove tag from sprint
router.delete("/sprints/:id/tag", auth, async (req, res) => {
  try {
    let sprint = await Sprint.findOne({ _id: req.params.id })
      .populate("tasks.user")
      .populate("creator");
    if (!sprint) {
      return res.status(404).json({ err: "Спринт не найден" });
    }
    let ind = sprint.tags.indexOf(req.query.tag);
    if (ind == -1) {
      return res.status(404).json({ err: "Указанный тэг не найден" });
    }
    sprint.tags.splice(ind, 1);
    await sprint.save();
    return res.json({ sprint: sprint, msg: `Тэг ${req.query.tag} удален` });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ err: "server error" });
  }
});

/////////TASKS//////////

//get tasks
router.get("/sprints/gettasks/:id", auth, async (req, res) => {
  try {
    let sprint = await Sprint.findOne({ _id: req.params.id }).select("tasks");
    if (!sprint) {
      return res.status(404).json({ err: "Спринт не найден" });
    }
    return res.json(sprint);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ err: "server error" });
  }
});

//add single task to sprint
router.post("/sprints/task/:id", auth, async (req, res) => {
  try {
    let sprint = await Sprint.findOne({ _id: req.params.id });
    if (!sprint) {
      return res.status(404).json({ err: "Спринт не найден" });
    }
    if (req.body.taskTitle === "") {
      return res.status(400).json({ err: "Введите задачу" });
    }
    sprint.tasks.push({
      taskState: req.body.taskState,
      taskTitle: req.body.taskTitle,
      workVolume: req.body.workVolume,
      date: Date.now(),
    });
    let d = new Date();
    await Stat.findOneAndUpdate(
      {
        day: d.getDate(),
        month: d.getMonth() + 1,
        year: d.getFullYear(),
      },
      { $inc: { task_open_count: 1 } }
    );

    await sprint.save();
    await Sprint.populate(sprint, "tasks.user");
    await Sprint.populate(sprint, "creator");
    return res.json(sprint);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ err: "server error" });
  }
});

//add user to task
router.put("/sprints/task/adduser/:id", auth, async (req, res) => {
  try {
    let sprint = await Sprint.findOne({ _id: req.params.id }).populate(
      "creator"
    );

    if (!sprint) {
      return res.status(404).json({ err: "Спринт не найден" });
    }
    let user = await User.findOne({ _id: req.body.userid });
    if (!user) {
      return res.status(404).json({ err: "Пользователь не найден" });
    }
    let task = sprint.tasks.filter((task) => task._id == req.body.taskid);
    let ind = sprint.tasks.indexOf(task[0]);
    sprint.tasks[ind].user = req.body.userid;
    sprint.tasks[ind].user2 = req.user.id;
    await sprint.save();
    await Sprint.populate(sprint, "tasks.user");

    res.json(sprint);

    //notifications
    let notification_body = `Вам назначили новую задачу: ${task[0].taskTitle}`;

    if (user.device_tokens && user.device_tokens.length > 0) {
      let user2 = await User.findOne({ _id: req.user.id });
      let data = {
        sprint_id: sprint._id._id,
        avatar: user2.avatar,
        fullname: user2.fullname,
      };
      mob_push(
        user.device_tokens,
        task[0].taskTitle,
        data,
        "Вам назначили задачу"
      );
    }

    if (req.body.rocket == true) {
      let rc = () =>
        fetch(`${process.env.CHAT}/api/v1/login`, {
          method: "post",
          headers: {
            Accept: "application/json, text/plain, */*",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user: process.env.R_U,
            password: process.env.R_P,
          }),
        })
          .then((res) => res.json())
          .then((res) =>
            fetch(`${process.env.CHAT}/api/v1/chat.postMessage`, {
              method: "post",
              headers: {
                Accept: "application/json, text/plain, */*",
                "Content-Type": "application/json",
                "X-Auth-Token": res.data.authToken,
                "X-User-Id": res.data.userId,
              },
              body: JSON.stringify({
                channel: `@${user.rocketname}`,
                text: notification_body,
              }),
            })
          );

      rc();
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ err: "server error" });
  }
});

//add tasks to sprint
router.post("/sprints/addtask/:id", auth, async (req, res) => {
  try {
    let sprint = await Sprint.findOne({ _id: req.params.id });
    if (!sprint) {
      return res.json({ msg: "Указанный спринт не найден" });
    }
    if (!req.body.tasks) {
      return res.json({ err: "Добавьте задачу" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ err: "server error" });
  }

  try {
    if (typeof req.body.tasks == Array) {
      await Sprint.findOneAndUpdate(
        { _id: req.params.id },
        { $push: { tasks: { $each: req.body.tasks, $position: 0 } } },
        { multi: true }
      );
    }
    if (typeof req.body.tasks == Object) {
      await Sprint.findOneAndUpdate(
        { _id: req.params.id },
        { $push: { tasks: req.body.tasks } }
      );
    }

    console.log("new tasks added to sprint");
    res.json({ msg: "Задача добавлена" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "server error" });
  }
});

//deactivate task
router.put("/sprints/DAtask/test", auth, async (req, res) => {
  try {
    let sprint = await Sprint.findOne({
      "tasks._id": req.body.taskid,
    }).populate("creator");
    if (!sprint) {
      return res.status(404).json({ msg: "Спринт не найден" });
    }
    for (let task of sprint.tasks) {
      if (task._id == req.body.taskid) {
        task.taskStatus = !task.taskStatus;
        let num = task.taskStatus ? 1 : -1;
        let d = new Date();
        await Stat.findOneAndUpdate(
          {
            day: d.getDate(),
            month: d.getMonth() + 1,
            year: d.getFullYear(),
          },
          { $inc: { task_close_count: num } }
        );
      }
    }
    await sprint.save();
    await Sprint.populate(sprint, "tasks.user");
    console.log("task de/activated");
    return res.json({
      msg: `Изменен статус задачи`,
      sprint: sprint,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ err: "server error" });
  }
});

//edit task
router.put("/sprints/taskedit/:id", auth, async (req, res) => {
  try {
    let sprint = await Sprint.findOne({ _id: req.params.id }).populate(
      "creator"
    );
    if (!sprint) {
      return res.status(404).json({ err: "Спринт не найден" });
    }
    let a = sprint.tasks.filter((task) => task._id == req.body.taskid)[0];
    let keys = Object.keys(req.body);
    keys.forEach((key) => (a[key] = req.body[key]));
    await sprint.save();
    await Sprint.populate(sprint, "tasks.user");
    return res.json({ msg: `Таск изменен`, sprint: sprint });
  } catch (error) {
    console.error(error);
    return res.json({ msg: "server error" });
  }
});

//delete task
router.put("/sprints/deltask/:id", manauth, async (req, res) => {
  try {
    let sprint = await Sprint.findOne({ _id: req.params.id }).populate(
      "creator"
    );
    if (!sprint) {
      return res.status(404).json({ err: "Спринт не найден" });
    }
    sprint.tasks = sprint.tasks.filter((task) => task._id != req.body.taskid);
    await sprint.save();
    await Sprint.populate(sprint, "tasks.user");
    console.log("task deleted");
    return res.json({ msg: "Задача удалена", sprint: sprint });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ err: "server error" });
  }
});

///////////////////
///////////////////
///////////////////
///////TAGS////////
///////////////////
///////////////////
///////////////////

//add tag to project
router.put("/tag/:crypt", auth, async (req, res) => {
  try {
    await Project.findOneAndUpdate(
      { crypt: req.params.crypt },
      { $push: { tags: req.body.tag } }
    );
    console.log("+tag");
    return res.json({ msg: "Тэг добавлен" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ err: "server error" });
  }
});

//remove tag from project
router.delete("/tag/:crypt", auth, async (req, res) => {
  try {
    await Project.findOneAndUpdate(
      { crypt: req.params.crypt },
      { $pull: { tags: req.body.tag } }
    );
    console.log("-tag");
    return res.json({ msg: "Тэг удален" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ err: "server error" });
  }
});

//find by tags
router.get("/tag/search", auth, async (req, res) => {
  try {
    let projects = await Project.find({ tags: { $all: req.query.tag } });
    if (!projects) {
      return res
        .status(404)
        .json({ err: "Проектов с указанными тэгами не найдено" });
    }
    return res.json(projects);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: "server error" });
  }
});

//find tags
router.get("/tag/find", auth, async (req, res) => {
  try {
    let project = await Project.findOne({ crypt: req.query.crypt });
    if (!project) {
      return res.status(404).json({ err: "Проект не найден" });
    }
    if (
      project.tags === [] ||
      project.tags == null ||
      project.tags == undefined ||
      project.tags.includes(null) ||
      project.tags.length == 0 ||
      project.tags.includes([])
    ) {
      return res.json([]);
    }
    function regexEscape(str) {
      return str.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
    }

    let regex = new RegExp(regexEscape(req.query.tag), "g");
    let tags = project.tags.filter((tag) => tag != null && tag.match(regex));
    return res.json(tags);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ err: "server error" });
  }
});

//add proj to fav
router.put("/favproj/:id", auth, async (req, res) => {
  try {
    let user = await User.findOne({ _id: req.user.id });
    let msg;
    if (!user.fav_proj.includes(req.params.id.toString())) {
      user.fav_proj.push(req.params.id);
      msg = "Проект добавлен в избранные";
    } else {
      user.fav_proj = user.fav_proj.filter(
        (el) => el.toString() != req.params.id.toString()
      );
      msg = "Проект убран из избранных";
    }
    await user.save();
    res.json({ msg: msg });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ err: "server error" });
  }
});

//add custom field
router.post(
  "/custom/add/:crypt",
  auth,
  upload.single("file"),
  async (req, res) => {
    try {
      await Project.findOne({ crypt: req.params.crypt }, async (err, doc) => {
        if (err) throw err;
        let obj = {
          viewable: req.body.viewable,
          field_name: req.body.field_name,
          file_path: req.file ? "covers/" + req.file.filename : undefined,
          field_content: req.file
            ? req.file.originalname
            : req.body.field_content,
          field_type: req.file ? "file" : "string",
        };
        doc.custom_fields.push(obj);
        await doc.save();
        res.json(doc);
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ err: "server error" });
    }
  }
);

//remove custom field
router.post("/custom/remove/:id", async (req, res) => {
  try {
    await Project.findOne(
      { "custom_fields._id": req.params.id },
      async (err, doc) => {
        if (err) throw err;
        doc.custom_fields = doc.custom_fields.filter(
          (el) => el._id != req.params.id
        );
        await doc.save();
        res.json(doc);
      }
    );
  } catch (error) {
    console.error(error);
    return res.status(500).json({ err: "server error" });
  }
});

//edit custom field
router.post("/custom/edit/:id", upload.single("file"), async (req, res) => {
  try {
    await Project.findOne(
      { "custom_fields._id": req.params.id },
      async (err, doc) => {
        if (err) throw err;
        let custom = doc.custom_fields.filter(
          (el) => el._id == req.params.id
        )[0];
        custom.viewable = req.body.viewable;
        custom.field_name = req.body.field_name;
        custom.file_path = req.file ? "covers/" + req.file.filename : undefined;
        custom.field_content = req.file
          ? req.file.originalname
          : req.body.field_content;
        await doc.save();
        res.json(doc);
      }
    );
  } catch (error) {
    console.error(error);
    return res.status(500).json({ err: "server error" });
  }
});

//////////////////// KOSTILI ////////////////////////

//kostil eshe odin
router.get("/huy/huy/huy", async (req, res) => {
  try {
    let huy = await Sprint.updateMany({}, { $set: { title: "Спринт" } });
    return res.json(huy);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ err: "server error" });
  }
});

//eshe odin mega kostil
router.get("/huy/pizda/dzhigurda", async (req, res) => {
  try {
    let projects = await Project.find();
    for (let project of projects) {
      for (let sprint of project.sprints) {
        await Sprint.findOneAndUpdate(
          { _id: sprint },
          { $set: { project: project._id } }
        );
      }
    }
    await Project.populate(projects, "sprints");
    return res.json(projects);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ err: "server error" });
  }
});

//sprint killa
router.delete("/sprintkill/huy/huy", async (req, res) => {
  try {
    let sprints = await Sprint.find();
    let count = 0;
    for (let sprint of sprints) {
      if (!sprint.project) {
        await Sprint.findOneAndRemove({ _id: sprint._id });
        count += 1;
      }
    }
    return res.json({ msg: `${count} sprints killed` });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ err: "server error" });
  }
});

//kostil object Object
router.get("/object/object/object/object", async (req, res) => {
  try {
    let prjs = await Project.updateMany(
      { object: undefined },
      { $set: { object: "" } }
    );
    return res.json(prjs);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ err: "server error" });
  }
});

module.exports = router;
