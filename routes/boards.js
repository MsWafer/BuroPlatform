const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { check, validationResult } = require("express-validator");
const fetch = require("node-fetch");
const Card = require("../models/Card");
const Project = require("../models/Project");
const Category = require("../models/Category");
const Stat = require("../models/Stat");
const { response } = require("express");
const { readdirSync } = require("fs");
const multer = require("multer");
const path = require("path");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, __dirname + "/../public/images");
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
  limits: { fileSize: 100 * 1024 * 1024 },
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
const {
  backlog_expired,
  backlog_timeline,
  timeline_timeline,
  timeline_expired,
  expired_expired,
  backlog_backlog,
  timeline_backlog,
  expired_backlog,
  expired_timeline,
} = require("../middleware/card_moving");
const rc_mention = require("../middleware/rc_mention");
const User = require("../models/User");
const { findOne } = require("../models/Project");
const manauth = require("../middleware/manauth");
const rocketPushCard = require("../middleware/rocketPushCard");

//new board
router.post("/boards/new/:crypt", async (req, res) => {
  try {
    let start =
      new Date().setHours(-3) - 1000 * 60 * 60 * 24 * (new Date().getDay() - 1);
    let end = new Date(start + 1000 * 60 * 60 * 24 * 6);
    let project = await Project.findOne({ crypt: req.params.crypt });
    if (!project) {
      return res.status(404).json({ err: "Проект не найден" });
    }
    let timed_category = new Category({
      name: "Спринт",
      columns: ["В работе", "Готово"],
      step: 7,
      timeline: [{ start: start, end: end, cards: [] }],
    });
    await timed_category.save();
    let board = {
      name: req.body.name,
      columns: ["В работе", "Готово"],
      categories: [timed_category._id],
    };
    project.boards.push(board);
    await project.save();
    await Project.populate(project, [
      { path: "backlog" },
      { path: "team2.user" },
    ]);
    return res.json(project);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ err: "server error" });
  }
});

//get board
router.get("/boards/get/single/:id", auth, async (req, res) => {
  try {
    if (req.params.id == "undefined") {
      return;
    }
    let project = await Project.findOne({ "boards._id": req.params.id });
    if (!project) {
      return res.status(404).json({ err: "Проект не найден" });
    }
    await Project.populate(project, [
      {
        path: "boards.categories",
        populate: [
          {
            path: "timeline.cards",
            populate: [
              { path: "creator" },
              { path: "execs", select: "avatar fullname" },
              {
                path: "event_users",
                select: "avatar fullname",
              },
            ],
          },
          {
            path: "expired",
            populate: [
              { path: "creator" },
              { path: "execs", select: "avatar fullname" },
              {
                path: "event_users",
                select: "avatar fullname",
              },
            ],
          },
        ],
      },
      {
        path: "backlog",
        populate: [
          { path: "creator" },
          { path: "execs", select: "avatar fullname" },
          {
            path: "event_users",
            select: "avatar fullname",
          },
        ],
      },
      {
        path: "boards.monitor",
        populate: [
          {
            path: "timeline.cards",
            populate: [
              { path: "creator" },
              { path: "execs", select: "avatar fullname" },
              {
                path: "event_users",
                select: "avatar fullname",
              },
            ],
          },
          {
            path: "expired",
            populate: [
              { path: "creator" },
              { path: "execs", select: "avatar fullname" },
              {
                path: "event_users",
                select: "avatar fullname",
              },
            ],
          },
        ],
      },
    ]);
    let board = project.boards.filter((el) => el._id == req.params.id)[0];
    return res.json({ board: board, backlog: project.backlog });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ err: "server error" });
  }
});

//delete board
router.delete("/boards/delete/:id", manauth, async (req, res) => {
  try {
    let project = await Project.findOne({ "boards._id": req.params.id });
    project.boards = project.boards.filter((el) => el._id != req.params.id);
    await project.save();
    await Project.populate(project, { path: "boards.categories" });
    res.json(project);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ err: "server error" });
  }
});

//rename board
router.put("/boards/rename/:id", auth, async (req, res) => {
  try {
    console.log(req.params);
    console.log(req.body);
    let project = await Project.findOne({ "boards._id": req.params.id });
    let board = project.boards.filter((el) => el._id == req.params.id)[0];
    board.name = req.body.name;
    await project.save();
    await Project.populate(project, [
      {
        path: "team2.user",
        selet: "avatar fullname",
      },
      {
        path: "boards.categories",
        populate: [
          {
            path: "timeline.cards",
            populate: [
              { path: "creator" },
              { path: "execs", select: "avatar fullname" },
              {
                path: "event_users",
                select: "avatar fullname",
              },
            ],
          },
          {
            path: "expired",
            populate: [
              { path: "creator" },
              { path: "execs", select: "avatar fullname" },
              {
                path: "event_users",
                select: "avatar fullname",
              },
            ],
          },
        ],
      },
      {
        path: "boards.monitor",
        populate: [
          {
            path: "timeline.cards",
            populate: [
              { path: "creator" },
              { path: "execs", select: "avatar fullname" },
              {
                path: "event_users",
                select: "avatar fullname",
              },
            ],
          },
          {
            path: "expired",
            populate: [
              { path: "creator" },
              { path: "execs", select: "avatar fullname" },
              {
                path: "event_users",
                select: "avatar fullname",
              },
            ],
          },
        ],
      },
    ]);
    res.json({ project, board });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ err: "server error" });
  }
});

//new category
router.post("/categories/new/:id", async (req, res) => {
  try {
    let project = await Project.findOne({ "boards._id": req.params.id });
    if (!project) {
      return response.status(404).json({ err: "Проект не найден" });
    }
    let board = project.boards.filter((el) => el._id == req.params.id)[0];
    let category = new Category({
      og_board: {
        board_name: board.name,
        board_id: board._id,
      },
      columns: board.columns,
      name: req.body.name,
      timeline: [{ start: req.body.start, end: req.body.end, cards: [] }],
    });
    await category.save();
    board.categories.push(category);
    await project.save();
    await Project.populate(project, [
      {
        path: "boards.categories",
        populate: [
          {
            path: "timeline.cards",
            populate: [
              { path: "creator" },
              { path: "execs", select: "avatar fullname" },
              {
                path: "event_users",
                select: "avatar fullname",
              },
            ],
          },
          {
            path: "expired",
            populate: [
              { path: "creator" },
              { path: "execs", select: "avatar fullname" },
              {
                path: "event_users",
                select: "avatar fullname",
              },
            ],
          },
        ],
      },
      {
        path: "boards.monitor",
        populate: [
          {
            path: "timeline.cards",
            populate: [
              { path: "creator" },
              { path: "execs", select: "avatar fullname" },
              {
                path: "event_users",
                select: "avatar fullname",
              },
            ],
          },
          {
            path: "expired",
            populate: [
              { path: "creator" },
              { path: "execs", select: "avatar fullname" },
              {
                path: "event_users",
                select: "avatar fullname",
              },
            ],
          },
        ],
      },
    ]);
    return res.json(board);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ err: "server error" });
  }
});

//rename category
router.put("/categories/edit/rename/:id", manauth, async (req, res) => {
  try {
    let category = await Category.findOne({ _id: req.params.id });
    if (!category) {
      return res.status(404).json({ err: "Категория не найдена" });
    }
    category.name = req.body.name;
    await category.save();
    let project = await Project.findOne({
      "boards._id": req.body.board_id,
    }).populate([
      {
        path: "boards.categories",
        populate: [
          {
            path: "timeline.cards",
            populate: [
              { path: "creator" },
              { path: "execs", select: "avatar fullname" },
              {
                path: "event_users",
                select: "avatar fullname",
              },
            ],
          },
          {
            path: "expired",
            populate: [
              { path: "creator" },
              { path: "execs", select: "avatar fullname" },
              {
                path: "event_users",
                select: "avatar fullname",
              },
            ],
          },
        ],
      },
      {
        path: "boards.monitor",
        populate: [
          {
            path: "timeline.cards",
            populate: [
              { path: "creator" },
              { path: "execs", select: "avatar fullname" },
              {
                path: "event_users",
                select: "avatar fullname",
              },
            ],
          },
          {
            path: "expired",
            populate: [
              { path: "creator" },
              { path: "execs", select: "avatar fullname" },
              {
                path: "event_users",
                select: "avatar fullname",
              },
            ],
          },
        ],
      },
    ]);
    let board = project.boards.filter((el) => el._id == req.body.board_id)[0];
    return res.json(board);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ err: "server error" });
  }
});

//change category to timeline
router.put("/categories/edit/timeline/:id", auth, async (req, res) => {
  try {
    let category = await Category.findOne({ _id: req.params.id });
    if (!category) {
      return res.status(404).json({ err: "Категория не найдена" });
    }
    let timeline = category.timeline.filter(
      (el) => el._id == req.body.timeline_id
    )[0];
    category.step = req.body.step;
    category.month = req.body.month ? req.body.month : undefined;
    let start;
    let end;
    if (!req.body.month) {
      start =
        new Date().setHours(-3) -
        1000 * 60 * 60 * 24 * (new Date().getDay() - 1);
      end = new Date(start + 1000 * 60 * 60 * 24 * (req.body.step - 1));
    }
    if (req.body.month) {
      start = new Date(
        Date.now() - 1000 * 60 * 60 * 24 * (new Date().getDate() - 1)
      ).setHours(-3);
      let month =
        start.getMonth() + req.body.month < 12
          ? start.getMonth() + req.body.month
          : start.getMonth() + req.body.month - 12;
      end = new Date(start.getFullYear(), month, 0);
    }
    timeline.start = start;
    timeline.end = end;
    await category.save();
    let project = await Project.findOne({
      "boards._id": req.body.board_id,
    }).populate([
      {
        path: "boards.categories",
        populate: [
          {
            path: "timeline.cards",
            populate: [
              { path: "creator" },
              { path: "execs", select: "avatar fullname" },
              {
                path: "event_users",
                select: "avatar fullname",
              },
            ],
          },
          {
            path: "expired",
            populate: [
              { path: "creator" },
              { path: "execs", select: "avatar fullname" },
              {
                path: "event_users",
                select: "avatar fullname",
              },
            ],
          },
        ],
      },
      {
        path: "boards.monitor",
        populate: [
          {
            path: "timeline.cards",
            populate: [
              { path: "creator" },
              { path: "execs", select: "avatar fullname" },
              {
                path: "event_users",
                select: "avatar fullname",
              },
            ],
          },
          {
            path: "expired",
            populate: [
              { path: "creator" },
              { path: "execs", select: "avatar fullname" },
              {
                path: "event_users",
                select: "avatar fullname",
              },
            ],
          },
        ],
      },
    ]);
    let board = project.boards.filter((el) => el._id == req.body.board_id)[0];
    return res.json(board);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ err: "server error" });
  }
});

//add new timeline to category
router.put("/categories/edit/newtimeline/:id", auth, async (req, res) => {
  try {
    let category = await Category.findOne({
      _id: req.params.id,
    }).populate({
      path: "timeline.cards",
    });

    if (!category.month) {
      let new_timeline = {
        start:
          Number(category.timeline[category.timeline.length - 1].end) +
          1000 * 60 * 60 * 24,
        cards: [],
      };
      new_timeline.end =
        new_timeline.start + 1000 * 60 * 60 * 24 * (category.step - 1);
      await Category.populate(category, { path: "timeline.cards" });
      for (let card of category.timeline[category.timeline.length - 1].cards) {
        if (card.regular) {
          let newCard = new Card(JSON.parse(JSON.stringify(card)));
          newCard.status = false;
          delete newCard._id;
          newCard.comments = [];
          newCard.expired = false;
          newCard.column = "В работе";
          newCard.deadline
            ? (newCard.deadline += 1000 * 60 * 60 * 24 * category.step)
            : undefined;
          for (let task of newCard.tasks) {
            task.taskStatus = false;
            delete task._id;
            task.deadline
              ? (task.deadline += 1000 * 60 * 60 * 24 * category.step)
              : undefined;
          }
          await newCard.save();
          new_timeline.cards.push(newCard);
        }
      }
      category.timeline.push(new_timeline);
    } else {
      let new_timeline = {
        start:
          Number(category.timeline[category.timeline.length - 1].end) +
          1000 * 60 * 60 * 24,
        cards: [],
      };
      let month =
        new Date(new_timeline.start).getMonth() + category.month < 12
          ? new Date(new_timeline.start).getMonth() + category.month
          : new Date(new_timeline.start).getMonth() + category.month - 12;
      new_timeline.end = new Date(
        new Date(new_timeline.start).getFullYear() + category.month < 12
          ? new Date(new_timeline.start).getFullYear()
          : new Date(new_timeline.start).getFullYear() + 1,
        month,
        0
      );
      await Category.populate(category, { path: "timeline.cards" });
      for (let card of category.timeline[category.timeline.length - 1].cards) {
        /////////////////
        ///ЧЕТО ДЕЛАЕМ///
        /////////////////
        if (card.regular) {
          let newCard = new Card(JSON.parse(JSON.stringify(card)));
          newCard.status = false;
          delete newCard._id;
          newCard.comments = [];
          newCard.expired = false;
          newCard.column = "В работе";
          newCard.deadline
            ? new Date(
                newCard.deadline.getMonth() + category.month < 12
                  ? newCard.deadline.getFullYear()
                  : newCard.deadline.getFullYear() + 1,
                newCard.deadline.getMonth() + category.month < 12
                  ? newCard.deadline.getMonth() + category.month
                  : newCard.deadline.getMonth() + category.month - 12,
                newCard.deadline.getDate()
              )
            : undefined;
          for (let task of newCard.tasks) {
            task.taskStatus = false;
            delete task._id;
            task.deadline
              ? (task.deadline += 1000 * 60 * 60 * 24 * category.step)
              : undefined;
          }
          await newCard.save();
          new_timeline.cards.push(newCard);
        }
      }
      category.timeline.push(new_timeline);
    }
    await category.save();
    let project = await Project.findOne({
      "boards._id": req.body.board_id,
    }).populate([
      {
        path: "boards.categories",
        populate: [
          {
            path: "timeline.cards",
            populate: [
              { path: "creator", select: "avatar fullname" },
              { path: "execs", select: "avatar fullname" },
              {
                path: "event_users",
                select: "avatar fullname",
              },
            ],
          },
          {
            path: "expired",
            populate: [
              { path: "creator", select: "avatar fullname" },
              { path: "execs", select: "avatar fullname" },
              {
                path: "event_users",
                select: "avatar fullname",
              },
            ],
          },
        ],
      },
      {
        path: "boards.monitor",
        populate: [
          {
            path: "timeline.cards",
            populate: [
              { path: "creator" },
              { path: "execs", select: "avatar fullname" },
              {
                path: "event_users",
                select: "avatar fullname",
              },
            ],
          },
          {
            path: "expired",
            populate: [
              { path: "creator" },
              { path: "execs", select: "avatar fullname" },
              {
                path: "event_users",
                select: "avatar fullname",
              },
            ],
          },
        ],
      },
    ]);
    let board = project.boards.filter((el) => el._id == req.body.board_id)[0];
    return res.json(board);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ err: "server error" });
  }
});

//delete category
router.put("/categories/delete/:id", async (req, res) => {
  try {
    let projects = await Project.find({
      "boards.categories": req.params.id,
    }).populate([{ path: "board.categories" }]);
    for (let project of projects) {
      for (let board of project.boards) {
        for (let category of board.categories) {
          if (category.timeline && category.timeline.length > 0) {
            for (let timeline of category.timeline) {
              board.archive.concat(timeline.cards);
            }
            board.archive.concat(category.expired);
          }
        }
      }
      await project.save();
    }
    await Category.findOneAndDelete({ _id: req.params.id });
    let project = await Project.findOne({ "boards._id": req.body.board_id });
    await Project.populate(project, [
      {
        path: "boards.categories",
        populate: [
          {
            path: "timeline.cards",
            populate: [
              { path: "creator", select: "avatar fullname" },
              { path: "execs", select: "avatar fullname" },
              {
                path: "event_users",
                select: "avatar fullname",
              },
            ],
          },
          {
            path: "expired",
            populate: [
              { path: "creator", select: "avatar fullname" },
              { path: "execs", select: "avatar fullname" },
              {
                path: "event_users",
                select: "avatar fullname",
              },
            ],
          },
        ],
      },
      {
        path: "boards.monitor",
        populate: [
          {
            path: "timeline.cards",
            populate: [
              { path: "creator" },
              { path: "execs", select: "avatar fullname" },
              {
                path: "event_users",
                select: "avatar fullname",
              },
            ],
          },
          {
            path: "expired",
            populate: [
              { path: "creator" },
              { path: "execs", select: "avatar fullname" },
              {
                path: "event_users",
                select: "avatar fullname",
              },
            ],
          },
        ],
      },
    ]);
    let board = project.boards.filter((el) => el._id == req.body.board_id)[0];
    return res.json(board);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ err: "server error" });
  }
});

//new column
router.put("/boards/column/new/:id", async (req, res) => {
  try {
    let project = await Project.findOne({
      "boards._id": req.params.id,
    }).populate([
      {
        path: "boards.categories",
        populate: [
          {
            path: "timeline.cards",
            populate: [
              { path: "creator", select: "avatar fullname" },
              { path: "execs", select: "avatar fullname" },
              {
                path: "event_users",
                select: "avatar fullname",
              },
            ],
          },
          {
            path: "expired",
            populate: [
              { path: "creator", select: "avatar fullname" },
              { path: "execs", select: "avatar fullname" },
              {
                path: "event_users",
                select: "avatar fullname",
              },
            ],
          },
        ],
      },
      {
        path: "boards.monitor",
        populate: [
          {
            path: "timeline.cards",
            populate: [
              { path: "creator" },
              { path: "execs", select: "avatar fullname" },
              {
                path: "event_users",
                select: "avatar fullname",
              },
            ],
          },
          {
            path: "expired",
            populate: [
              { path: "creator" },
              { path: "execs", select: "avatar fullname" },
              {
                path: "event_users",
                select: "avatar fullname",
              },
            ],
          },
        ],
      },
    ]);
    if (!project) {
      return response.status(404).json({ err: "Проект не найден" });
    }
    let board = project.boards.filter((el) => el._id == req.params.id)[0];
    if (board.columns.includes(req.body.column)) {
      return res.status(400).json({ msg: "Такая колонка уже существует" });
    }
    board.columns.push(req.body.column);
    for (let category of board.categories) {
      category.columns.push(req.body.column);
      await category.save();
    }
    await project.save();
    // await Project.populate(project, [
    //   {
    //     path: "boards.categories",
    //     populate: [
    //       {
    //         path: "timeline.cards",
    //         populate: [
    //           { path: "creator", select: "avatar fullname" },
    //           { path: "execs", select: "avatar fullname" },
    //           {
    //             path: "event_users",
    //             select: "avatar fullname",
    //           },
    //         ],
    //       },
    //       {
    //         path: "expired",
    //         populate: [
    //           { path: "creator", select: "avatar fullname" },
    //           { path: "execs", select: "avatar fullname" },
    //           {
    //             path: "event_users",
    //             select: "avatar fullname",
    //           },
    //         ],
    //       },
    //     ],
    //   },
    //   {
    //     path: "boards.monitor",
    //     populate: [
    //       { path: "creator" },
    //       { path: "execs", select: "avatar fullname" },
    //       {
    //         path: "event_users",
    //         select: "avatar fullname",
    //       },
    //     ],
    //   },
    // ]);
    console.log(board);
    // let board = project.boards.filter((el) => el._id == req.body.board_id)[0];
    return res.json(board);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ err: "server error" });
  }
});

//delete column
router.put("/boards/column/delete/:id", async (req, res) => {
  try {
    let project = await Project.findOne({
      "boards._id": req.params.id,
    }).populate([
      {
        path: "board.categories",
        populate: [
          {
            path: "timeline.cards",
            select: "avatar fullname",
            populate: [
              { path: "creator" },
              { path: "execs", select: "avatar fullname" },
              {
                path: "event_users",
                select: "avatar fullname",
              },
            ],
          },
          {
            path: "expired",
            populate: [
              { path: "creator", select: "avatar fullname" },
              { path: "execs", select: "avatar fullname" },
              {
                path: "event_users",
                select: "avatar fullname",
              },
            ],
          },
        ],
      },
      {
        path: "boards.monitor",
        populate: [
          {
            path: "timeline.cards",
            populate: [
              { path: "creator" },
              { path: "execs", select: "avatar fullname" },
              {
                path: "event_users",
                select: "avatar fullname",
              },
            ],
          },
          {
            path: "expired",
            populate: [
              { path: "creator" },
              { path: "execs", select: "avatar fullname" },
              {
                path: "event_users",
                select: "avatar fullname",
              },
            ],
          },
        ],
      },
      // { path: "board.categories" },
    ]);
    if (!project) {
      return response.status(404).json({ err: "Проект не найден" });
    }
    let board = project.boards.filter((el) => el._id == req.params.id)[0];
    board.columns = board.columns.filter((el) => el != req.body.column);
    for (let category of board.categories) {
      if (category.columns) {
        category.columns = category.columns.filter(
          (el) => el != req.body.column
        );
      }

      if (category.timeline) {
        for (let timeline of category.timeline) {
          let arr = [];
          for (let card of timeline.cards) {
            if (card.column == req.body.column) {
              board.archive.push(card);
              arr.push(card.id);
            }
          }
          await Category.findOneAndUpdate(
            { _id: category._id },
            { $pull: { timeline: { cards: { $in: arr } } } }
          );
        }
      }
    }
    await project.save();
    await Project.populate(project, [
      {
        path: "boards.categories",
        populate: [
          {
            path: "timeline.cards",
            populate: [
              { path: "creator", select: "avatar fullname" },
              { path: "execs", select: "avatar fullname" },
              {
                path: "event_users",
                select: "avatar fullname",
              },
            ],
          },
          {
            path: "expired",
            populate: [
              { path: "creator", select: "avatar fullname" },
              { path: "execs", select: "avatar fullname" },
              {
                path: "event_users",
                select: "avatar fullname",
              },
            ],
          },
        ],
      },
      {
        path: "boards.monitor",
        populate: [
          {
            path: "timeline.cards",
            populate: [
              { path: "creator" },
              { path: "execs", select: "avatar fullname" },
              {
                path: "event_users",
                select: "avatar fullname",
              },
            ],
          },
          {
            path: "expired",
            populate: [
              { path: "creator" },
              { path: "execs", select: "avatar fullname" },
              {
                path: "event_users",
                select: "avatar fullname",
              },
            ],
          },
        ],
      },
    ]);
    return res.json(board);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ err: "server error" });
  }
});

//rename column
router.put("/boards/column/rename/:id", manauth, async (req, res) => {
  try {
    console.log(req.params);
    console.log(req.body);
    let project = await Project.findOne({
      "boards._id": req.params.id,
    }).populate([
      {
        path: "boards.categories",
        populate: [
          {
            path: "timeline.cards",
            select: "avatar fullname",
            populate: [
              { path: "creator" },
              { path: "execs", select: "avatar fullname" },
              {
                path: "event_users",
                select: "avatar fullname",
              },
            ],
          },
          {
            path: "expired",
            populate: [
              { path: "creator", select: "avatar fullname" },
              { path: "execs", select: "avatar fullname" },
              {
                path: "event_users",
                select: "avatar fullname",
              },
            ],
          },
        ],
      },
      {
        path: "boards.monitor",
        populate: [
          {
            path: "timeline.cards",
            populate: [
              { path: "creator" },
              { path: "execs", select: "avatar fullname" },
              {
                path: "event_users",
                select: "avatar fullname",
              },
            ],
          },
          {
            path: "expired",
            populate: [
              { path: "creator" },
              { path: "execs", select: "avatar fullname" },
              {
                path: "event_users",
                select: "avatar fullname",
              },
            ],
          },
        ],
      },
    ]);
    if (!project) {
      return response.status(404).json({ err: "Проект не найден" });
    }
    let board = project.boards.filter((el) => el._id == req.params.id)[0];
    let old_column = board.columns[req.body.ind];
    board.columns.splice(req.body.ind, 1, req.body.new_column);
    for (let category of board.categories) {
      // let old = category.columns[req.body.ind]
      category.columns.splice(req.body.ind, 1, req.body.new_column);
      for (let timeline of category.timeline) {
        for (let card of timeline.cards) {
          if (card.column == old_column) {
            if (!card.comments) {
              card.comments = [];
            }
            card.column = req.body.new_column;
            card.comments.push({
              type: "history",
              date: new Date(),
              text: `${old_column} -> ${req.body.new_column}`,
              author: req.user.id,
            });
            await card.save();
          }
        }
      }
      await category.save();
    }
    await project.save();
    return res.json(board);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ err: "server error" });
  }
});

//new card to backlog
router.post("/cards/new/backlog/:crypt", auth, async (req, res) => {
  try {
    let project = await Project.findOne({ crypt: req.params.crypt }).populate({
      path: "backlog",
      populate: [
        {
          path: "comments.author",
        },
        { path: "creator" },
        { path: "user" },
        { path: "user2" },
        { path: "tasks.user" },
        { path: "tasks.user2" },
        { path: "execs" },
        {
          path: "event_users",
          select: "avatar fullname",
        },
      ],
    });
    if (!project) {
      return response.status(404).json({ err: "Проект не найден" });
    }
    let card = new Card({
      title: req.body.title,
      description: req.body.description,
      creator: req.user.id,
      type: req.body.type,
      comments: [
        { author: req.user.id, date: Date.now(), text: "Карточка создана" },
      ],
      board_id: req.body.board_id,
    });
    await card.save();
    if (!project.backlog) {
      project.backlog = [];
    }
    project.backlog.push(card);
    await project.save();
    return res.json(project.backlog);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ err: "server error" });
  }
});

//new card to category
router.post("/cards/new/category/:id", auth, async (req, res) => {
  try {
    let category = await Category.findOne({
      _id: req.params.id,
    }).populate([
      {
        path: "timeline.cards",
        populate: [
          {
            path: "comments.author",
          },
          { path: "creator" },
          { path: "user" },
          { path: "user2" },
          { path: "tasks.user" },
          { path: "tasks.user2" },
          { path: "execs" },
          {
            path: "event_users",
            select: "avatar fullname",
          },
        ],
      },
    ]);
    if (!category) {
      return response.status(404).json({ err: "Категория не найдена" });
    }
    let card = new Card({
      title: req.body.title,
      description: req.body.description,
      column: req.body.column,
      creator: req.user.id,
      type: req.body.type,
      board_id: req.body.board_id,
      regular: req.body.regular ? req.body.regular : undefined,
      comments: [
        { author: req.user.id, date: Date.now(), text: "Карточка создана" },
      ],
    });
    await card.save();
    let timeline = category.timeline.filter(
      (el) => el._id == req.body.timeline
    )[0];
    timeline.cards.push(card);
    await category.save();
    let project = await Project.findOne({
      "boards._id": req.body.board_id,
    }).populate([
      {
        path: "boards.categories",
        populate: [
          {
            path: "timeline.cards",
            populate: [
              {
                path: "comments.author",
              },
              { path: "creator" },
              { path: "user" },
              { path: "user2" },
              { path: "tasks.user" },
              { path: "tasks.user2" },
              { path: "execs" },
              {
                path: "event_users",
                select: "avatar fullname",
              },
            ],
          },
          {
            path: "expired",
            populate: [
              { path: "creator" },
              { path: "execs", select: "avatar fullname" },
              {
                path: "event_users",
                select: "avatar fullname",
              },
            ],
          },
        ],
      },
      {
        path: "boards.monitor",
        populate: [
          {
            path: "timeline.cards",
            populate: [
              { path: "creator" },
              { path: "execs", select: "avatar fullname" },
              {
                path: "event_users",
                select: "avatar fullname",
              },
            ],
          },
          {
            path: "expired",
            populate: [
              { path: "creator" },
              { path: "execs", select: "avatar fullname" },
              {
                path: "event_users",
                select: "avatar fullname",
              },
            ],
          },
        ],
      },
    ]);
    let board = project.boards.filter((el) => el._id == req.body.board_id)[0];
    res.json(board);
    let d = new Date();
    await Stat.findOneAndUpdate(
      {
        day: d.getDate(),
        month: d.getMonth() + 1,
        year: d.getFullYear(),
      },
      { $inc: { cards_created: 1 } }
    );
    let date = Date.now();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ err: "server error" });
  }
});

//move card to another category/column
router.put("/cards/move", auth, async (req, res) => {
  try {
    let user_id = req.user.id;
    let { old_place, new_place, card_id, column, index } = req.body;
    switch (true) {
      case req.body.backlog_timeline:
        await backlog_timeline(new_place, card_id, column, index, user_id);
        break;
      case req.body.timeline_timeline:
        await timeline_timeline(
          old_place,
          new_place,
          card_id,
          column,
          index,
          user_id
        );
        break;
      case req.body.timeline_backlog:
        await timeline_backlog(old_place, new_place, card_id, index, user_id);
        break;
      case req.body.backlog_backlog:
        await backlog_backlog(card_id, index, user_id);
        break;
      case req.body.backlog_expired:
        await backlog_expired(new_place, card_id, user_id, index);
        break;
      case req.body.timeline_expired:
        await timeline_expired(new_place, card_id, user_id, index);
        break;
      case req.body.expired_timeline:
        await expired_timeline(
          old_place,
          new_place,
          card_id,
          column,
          index,
          user_id
        );
        break;
      case req.body.expired_backlog:
        await expired_backlog(old_place, new_place, card_id, index, user_id);
        break;
      case req.body.expired_expired:
        await expired_expired(old_place, new_place, card_id, index);
        break;
    }
    let project = await Project.findOne({
      "boards._id": req.body.board_id,
    }).populate([
      {
        path: "boards.monitor",
        populate: [
          {
            path: "timeline.cards",
            populate: [
              { path: "creator" },
              { path: "execs", select: "avatar fullname" },
              {
                path: "event_users",
                select: "avatar fullname",
              },
            ],
          },
          {
            path: "expired",
            populate: [
              { path: "creator" },
              { path: "execs", select: "avatar fullname" },
              {
                path: "event_users",
                select: "avatar fullname",
              },
            ],
          },
        ],
      },
      {
        path: "boards.categories",
        populate: [
          {
            path: "timeline.cards",
            populate: [
              {
                path: "comments.author",
              },
              { path: "creator" },
              { path: "user" },
              { path: "user2" },
              { path: "tasks.user" },
              { path: "tasks.user2" },
              { path: "execs" },
              {
                path: "event_users",
                select: "avatar fullname",
              },
            ],
          },
          {
            path: "expired",
            populate: [
              { path: "creator" },
              { path: "execs", select: "avatar fullname" },
              {
                path: "event_users",
                select: "avatar fullname",
              },
            ],
          },
        ],
      },
      {
        path: "backlog",
        populate: [
          {
            path: "comments.author",
          },
          { path: "creator" },
          { path: "user" },
          { path: "user2" },
          { path: "tasks.user" },
          { path: "tasks.user2" },
          { path: "execs" },
          {
            path: "event_users",
            select: "avatar fullname",
          },
        ],
      },
    ]);
    let board = project.boards.filter((el) => el._id == req.body.board_id)[0];
    return res.json({ board: board, backlog: project.backlog });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ err: "server error" });
  }
});

//add comment to card
router.post(
  "/cards/comment/new/:id",
  auth,
  upload.single("file"),
  async (req, res) => {
    try {
      let card = await Card.findOne({ _id: req.params.id });
      if (!card) {
        return res.status(404).json({ err: "Карточка не найдена" });
      }
      let type;
      if (req.file) {
        type = "file";
        if (
          req.file.mimetype == "image/png" ||
          req.file.mimetype == "image/jpg" ||
          req.file.mimetype == "image/jpeg" ||
          req.file.mimetype == "image/svg+xml"
        ) {
          type = "image";
        }
      }
      let comment = {
        date: new Date() + 3 * 60 * 60 * 1000,
        text: req.body.text,
        author: req.user.id,
        type: "comment",
        file: req.file
          ? {
              path: "images/" + req.file.filename,
              og_name: req.file.originalname,
              file_type: type,
            }
          : undefined,
      };
      card.comments.push(comment);
      if (req.body.mentions.length > 0) {
        req.body.mentions = req.body.mentions.split(",");
        for (let id of req.body.mentions) {
          await rc_mention(id, card.title, req.body.url);
        }
      }
      await card.save();
      await Card.populate(card, [
        {
          path: "comments.author",
        },
        { path: "creator" },
        { path: "user" },
        { path: "user2" },
        { path: "tasks.user" },
        { path: "tasks.user2" },
        { path: "execs" },
        {
          path: "event_users",
          select: "avatar fullname",
        },
      ]);
      return res.json(card.comments);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ err: "server error" });
    }
  }
);

//add tag to card
router.put("/cards/tags/add/:id", auth, async (req, res) => {
  try {
    let card = await Card.findOne({ _id: req.params.id });
    if (!card) {
      return res.status(404).json({ err: "Карточка не найдена" });
    }
    await Project.findOneAndUpdate(
      { crypt: req.body.crypt },
      { $push: { tags: req.body.tag } }
    );
    if (!card.tags.includes(req.body.tag)) {
      card.tags.push(req.body.tag);
    }
    await card.save();
    await Card.populate(card, [
      {
        path: "comments.author",
      },
      { path: "creator" },
      { path: "user" },
      { path: "user2" },
      { path: "tasks.user" },
      { path: "tasks.user2" },
      { path: "execs" },
      {
        path: "event_users",
        select: "avatar fullname",
      },
    ]);
    return res.json(card);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ err: "server error" });
  }
});

//delete tag
router.put("/cards/tags/remove/:id", auth, async (req, res) => {
  try {
    let card = await Card.findOne({ _id: req.params.id });
    if (!card) {
      return res.status(404).json({ err: "Карточка не найдена" });
    }
    card.tags = card.tags.filter((el) => el != req.body.tag);
    await card.save();
    return res.json(card);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ err: "server error" });
  }
});

//edit card
router.put("/cards/fields/edit/:id", auth, async (req, res) => {
  try {
    console.log(req.body)
    await Card.findOne({ _id: req.params.id }, async (err, card) => {
      if (err) throw err;
      if (!card) {
        return res.status(404).json({ err: "Карточка не найдена" });
      }
      let comment = {
        author: req.user.id,
        date: Date.now(),
        type: "history",
      };
      if (req.body.deadline) {
        req.body.deadline = new Date(req.body.deadline);
        let new_date = req.body.deadline.toLocaleString().substring(0, 10);
        if (card.deadline != undefined) {
          let old_date = card.deadline.toLocaleString().substring(0, 10);
          let new_date = req.body.deadline.toLocaleString().substring(0, 10);
          comment.text = `Дедлайн изменен с ${old_date} на ${new_date}`;
          card.comments.push(comment);
        } else {
          comment.text = `Дедлайн изменен на ${new_date}`;
          card.comments.push(comment);
        }
      }
      if (req.body.emergency) {
        comment.text = `Срочность изменена с "${card.emergency}" на "${req.body.emergency}"`;
        card.comments.push(comment);
      }
      for (let key of Object.keys(req.body)) {
        card[key] = req.body[key];
      }
      await card.save();
      await Card.populate(card, [
        {
          path: "comments.author",
        },
        { path: "creator" },
        { path: "user" },
        { path: "user2" },
        { path: "tasks.user" },
        { path: "tasks.user2" },
        { path: "execs" },
        {
          path: "event_users",
          select: "avatar fullname",
        },
      ]);
      return res.json(card);
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ err: "server error" });
  }
});

//add tasks to card
router.post("/cards/tasks/new/:id", async (req, res) => {
  try {
    let card = await Card.findOne({ _id: req.params.id });
    if (!card) {
      return res.status(404).json({ err: "Карточка не найдена" });
    }
    if (!req.body.title) {
      return res.status(400).json({ err: "Введите имя таска" });
    }
    if (card.tasks.length == 0) {
      card.type = "Чеклист";
    }
    card.tasks.push({
      taskTitle: req.body.title,
      project: req.body.project_id,
      date: new Date(),
    });
    // card.date = new Date();
    await card.save();
    await Card.populate(card, [
      {
        path: "comments.author",
      },
      { path: "creator" },
      { path: "user" },
      { path: "user2" },
      { path: "tasks.user" },
      { path: "tasks.user2" },
      { path: "execs" },
      {
        path: "event_users",
        select: "avatar fullname",
      },
    ]);
    res.json(card);
    let d = new Date();
    await Stat.findOneAndUpdate(
      {
        day: d.getDate(),
        month: d.getMonth() + 1,
        year: d.getFullYear(),
      },
      { $inc: { task_open_count: 1 } }
    );
  } catch (error) {
    console.error(error);
    return res.status(500).json({ err: "server error" });
  }
});

//edit task
router.put("/cards/tasks/edit/:id", async (req, res) => {
  try {
    let card = await Card.findOne({ "tasks._id": req.params.id });
    if (!card) {
      return res.status(404).json({ err: "Карточка не найдена" });
    }
    let keys = Object.keys(req.body);
    let task = card.tasks.filter((el) => el._id == req.params.id)[0];
    for (let key of keys) {
      task[key] = req.body[key];
    }
    if (typeof req.body.taskStatus == "boolean") {
      let num = req.body.taskStatus ? 1 : -1;
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
    await card.save();
    await Card.populate(card, [
      {
        path: "comments.author",
      },
      { path: "creator" },
      { path: "user" },
      { path: "user2" },
      { path: "tasks.user" },
      { path: "tasks.user2" },
      { path: "execs" },
      {
        path: "event_users",
        select: "avatar fullname",
      },
    ]);
    return res.json(card);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ err: "server error" });
  }
});

//set task exec
router.put("/cards/tasks/exec/:id", auth, async (req, res) => {
  try {
    let card = await Card.findOne({ "tasks._id": req.params.id });
    if (!card) {
      return res.status(404).json({ err: "Карточка не найдена" });
    }
    let task = card.tasks.filter((el) => el._id == req.params.id)[0];
    task.user = req.body.user;
    task.user2 = req.user.id;
    // task.project = req.body.project;
    if (!card.execs.includes(req.body.user)) {
      card.execs.push(req.body.user);
    }
    await card.save();
    await Card.populate(card, [
      {
        path: "comments.author",
      },
      { path: "creator" },
      { path: "user" },
      { path: "user2" },
      { path: "tasks.user" },
      { path: "tasks.user2" },
      { path: "execs" },
      {
        path: "event_users",
        select: "avatar fullname",
      },
    ]);
    return res.json(card);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ err: "server error" });
  }
});

//delete task
router.delete("/cards/tasks/delete/:id", async (req, res) => {
  try {
    let card = await Card.findOne({ "tasks._id": req.params.id }).populate([
      {
        path: "comments.author",
        select: "avatar fullname",
      },
    ]);
    if (!card) {
      return res.status(404).json({ err: "Карточка не найдена" });
    }
    card.tasks = card.tasks.filter((el) => el._id != req.params.id);
    await card.save();
    return res.json(card);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ err: "server error" });
  }
});

//get single card
router.get("/cards/get/single/:id", async (req, res) => {
  try {
    let card = await Card.findOne({ _id: req.params.id }).populate([
      {
        path: "comments.author",
      },
      { path: "creator", select: "avatar fullname" },
      { path: "user", select: "avatar fullname" },
      { path: "user2", select: "avatar fullname" },
      { path: "tasks.user", select: "avatar fullname" },
      { path: "tasks.user2", select: "avatar fullname" },
      { path: "execs", select: "avatar fullname" },
      {
        path: "event_users",
        select: "avatar fullname",
      },
    ]);
    if (!card) {
      return res.status(404).json({ err: "Карточка не найдена" });
    }
    return res.json(card);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ err: "server error" });
  }
});

//add card to fav
router.put("/cards/favorite/:id", auth, async (req, res) => {
  try {
    let user = await User.findOne({ _id: req.user.id });
    user.fav_cards.push(req.params.id);
    await user.save();
    return res.json(":^)");
  } catch (error) {
    console.error(error);
    return res.status(500).json({ err: "server error" });
  }
});

//delete card
router.delete("/cards/delete/single", auth, async (req, res) => {
  try {
    let project = await Project.findOne({ crypt: req.query.crypt }).populate({
      path: "boards.categories",
      populate: [
        {
          path: "timeline.cards",
          populate: [
            { path: "creator", select: "avatar fullname" },
            { path: "execs", select: "avatar fullname" },
            {
              path: "event_users",
              select: "avatar fullname",
            },
          ],
        },
        {
          path: "expired",
          populate: [
            { path: "creator" },
            { path: "execs", select: "avatar fullname" },
            {
              path: "event_users",
              select: "avatar fullname",
            },
          ],
        },
      ],
    });
    let x = false;
    for (let card of project.backlog) {
      if (card == req.query.cardid) {
        project.backlog = project.backlog.filter(
          (el) => el != req.query.cardid
        );
        x = req.query.cardid;
      }
    }
    for (let board of project.boards) {
      for (let category of board.categories) {
        category.expired = category.expired.filter((el) => {
          return el._id == req.query.cardid;
        });
        for (let timeline of category.timeline) {
          timeline.cards = timeline.cards.filter(
            (el) => el._id != req.query.cardid
          );
        }
        await category.save();
      }
      if (x) {
        // board.archive.push(req.query.cardid);
        await Card.findOneAndUpdate(
          { _id: x },
          {
            $push: {
              comments: {
                date: new Date(),
                type: "history",
                text: "Карточка удалена",
                author: req.user.id,
              },
            },
          }
        );
      }
      board.archive.push(req.query.cardid);
    }
    await project.save();
    await Project.populate(project, [
      {
        path: "backlog",
        populate: [
          { path: "execs" },
          {
            path: "event_users",
            select: "avatar fullname",
          },
        ],
      },
    ]);
    let board;
    if (req.query.boardid) {
      board = project.boards.filter((el) => el._id == req.query.boardid)[0];
    }
    return res.json({ board: board, backlog: project.backlog });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ err: "server error" });
  }
});

//un/fav board
router.put("/boards/favorite/:id", auth, async (req, res) => {
  try {
    let project = await Project.findOne({ "boards._id": req.params.id });
    let user = await User.findOne({ _id: req.user.id });
    if (!project || !user) {
      return res.status(404);
    }
    let insert = true;
    user.fav_boards.map((el, ind) => {
      if (el.board_id == req.params.id) {
        user.fav_boards.splice(ind, 1);
        insert = false;
      }
    });
    if (insert) {
      user.fav_boards.push({
        board_id: req.params.id,
        project: project._id,
      });
    }
    await user.save();
    return res.json(":^)");
  } catch (error) {
    console.error(error);
    return res.status(500).json({ err: "server error" });
  }
});

//un-expire card
router.put("/cards/unexpire/:id", auth, async (req, res) => {
  try {
    let category = await Category.findOneAndUpdate(
      { expired: req.params.id },
      { $pull: { expired: req.params.id } },
      { $new: true }
    );
    let comment = {
      author: req.user.id,
      text: "Просрочено -> Готово",
      date: new Date(),
      type: "history",
    };
    let card = await Card.findOneAndUpdate(
      { _id: req.params.id },
      { $set: { column: "Готово" }, $push: { comments: comment } },
      { $new: true }
    );
    let project = await Project.findOne({
      "boards._id": req.body.board_id,
    })
      .select("title crypt boards")
      .populate([
        {
          path: "boards.categories",
          populate: [
            {
              path: "timeline.cards",
              populate: [
                { path: "creator", select: "avatar fullname" },
                { path: "execs", select: "avatar fullname" },
                {
                  path: "event_users",
                  select: "avatar fullname",
                },
              ],
            },
            {
              path: "expired",
              populate: [
                { path: "creator", select: "avatar fullname" },
                { path: "execs", select: "avatar fullname" },
                {
                  path: "event_users",
                  select: "avatar fullname",
                },
              ],
            },
          ],
        },
        {
          path: "backlog",
          populate: [
            { path: "creator", select: "avatar fullname" },
            { path: "execs", select: "avatar fullname" },
            {
              path: "event_users",
              select: "avatar fullname",
            },
          ],
        },
      ]);
    return res.json({
      category: category,
      card: card,
      board: project.boards.filter((el) => el._id == req.body.board_id)[0],
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ err: "server error" });
  }
});

//add user to event
router.put("/cards/events/adduser/:id", auth, async (req, res) => {
  try {
    let card = await Card.findOne({ _id: req.params.id });
    if (!card) {
      return res.status(404).json({ err: "Карточка не найдена" });
    }
    if (!card.execs.includes(req.body.user_id)) {
      await User.findOneAndUpdate(
        { _id: req.body.user_id },
        { $push: { event_cards: req.params.id } }
      );
      card.execs.push(req.body.user_id);
    }
    await card.save();
    await Card.populate(card, [
      {
        path: "event_users",
      },
      { path: "execs", select: "avatar fullname" },
      { path: "user", select: "avatar fullname" },
      { path: "user2", select: "avatar fullname" },
      { path: "creator", select: "avatar fullname" },
      { path: "tasks.user", select: "avatar fullname" },
      { path: "tasks.user2", select: "avatar fullname" },
      { path: "comments.author", select: "avatar fullname" },
    ]);
    return res.json(card);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ err: "server error" });
  }
});

////////LIKES//////////////
router.post("/cards/like/:id", auth, async (req, res) => {
  try {
    let card = await Card.findOne({ _id: req.params.id }, (err, doc) => {
      if (err) throw err;
      if (!doc) {
        return res.status(404).json({ err: "Карточка не найдена" });
      }
      if (!doc.likeUsers.includes(req.user.id)) {
        doc.likeCount++;
        doc.likeUsers.push(req.user.id);
      } else {
        doc.likeCount--;
        doc.likeUsers = doc.likeUsers.filter((el) => el != req.user.id);
      }
      doc.save();
    }).populate([
      {
        path: "event_users",
      },
      { path: "execs", select: "avatar fullname" },
      { path: "user", select: "avatar fullname" },
      { path: "user2", select: "avatar fullname" },
      { path: "creator", select: "avatar fullname" },
      { path: "tasks.user", select: "avatar fullname" },
      { path: "tasks.user2", select: "avatar fullname" },
      { path: "comments.author", select: "avatar fullname" },
    ]);
    return res.json(card);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ err: "server error" });
  }
});

//card copy
router.put("/cards/copy/:id", auth, async (req, res) => {
  try {
    let card = await Card.findOne({ _id: req.params.id });
    if (!card) {
      return res.status(404).json({ err: "Карточка не найдена" });
    }
    delete card._doc._id;
    let newCard = new Card(JSON.parse(JSON.stringify(card._doc)));
    newCard.column = req.body.column;
    newCard.title = req.body.title;
    await newCard.save();
    if (req.body.newTimeline) {
      await Category.findOneAndUpdate(
        { "timeline._id": req.body.newTimeline },
        { $push: { "timeline.$.cards": newCard._id } }
      );
    }
    let prj = await Project.findOne({
      "boards._id": req.body.board_id,
    }).populate([
      {
        path: "boards.categories",
        populate: [
          {
            path: "timeline.cards",
            populate: [
              { path: "creator", select: "avatar fullname" },
              { path: "execs", select: "avatar fullname" },
              {
                path: "event_users",
                select: "avatar fullname",
              },
            ],
          },
          {
            path: "expired",
            populate: [
              { path: "creator", select: "avatar fullname" },
              { path: "execs", select: "avatar fullname" },
              {
                path: "event_users",
                select: "avatar fullname",
              },
            ],
          },
        ],
      },
      {
        path: "backlog",
        populate: [
          { path: "creator", select: "avatar fullname" },
          { path: "execs", select: "avatar fullname" },
          {
            path: "event_users",
            select: "avatar fullname",
          },
        ],
      },
    ]);
    let board = prj.boards.filter((el) => el._id == req.body.board_id)[0];
    res.json({
      board,
      backlog: prj.backlog,
      msg: "Карточка скопировалась",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ err: "server error" });
  }
});

//card notifications
router.put("/cards/notification/:id", auth, async (req, res) => {
  try {
    await Card.findOne({ _id: req.params.id }, async (err, card) => {
      if (err) throw err;
      if (!card) {
        return res.status(404).json({ err: "Карточка не найдена" });
      }
      if (!req.body.date) {
        req.body.execs
          ? await rocketPushCard(card.execs, card.title)
          : await rocketPushCard([req.user.id], card.title);
      }
      if (req.body.date) {
        console.log("a");
        let notification_obj = {
          date: req.body.date,
          users: req.body.execs ? card.execs : [req.user.id],
        };
        typeof card.notification == "array"
          ? card.notification.push(notification_obj)
          : (card.notification = [notification_obj]);
        await card.save();
      }
      await Card.populate(card, [
        {
          path: "event_users",
        },
        { path: "execs" },
        { path: "user" },
        { path: "user2" },
        { path: "creator" },
        { path: "tasks.user" },
        { path: "tasks.user2" },
        { path: "comments.author" },
      ]);
      res.json({ card, msg: "Уведомление отправлено" });
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ err: "server error" });
  }
});

//rocket_kostil
// router.get("/kostil/kostil/kostil", async (req, res) => {
//   try {
//     const delay = ms => new Promise(res => setTimeout(res, ms));
//     let a = await User.find();
//     function sliceIntoChunks(arr, chunkSize) {
//       const res = [];
//       for (let i = 0; i < arr.length; i += chunkSize) {
//           const chunk = arr.slice(i, i + chunkSize);
//           res.push(chunk);
//       }
//       return res;
//   }
//   let temp = sliceIntoChunks(a,5)
//   for(let chunk of temp){
//     for (let user of chunk) {
//       if (user.rocketId) {
//         await fetch(`${process.env.CHAT}/api/v1/login`, {
//           method: "post",
//           headers: {
//             Accept: "application/json, text/plain, */*",
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({
//             user: process.env.R_U,
//             password: process.env.R_P,
//           }),
//         })
//           .then((response) => response.json())
//           .then((response) => {
//             // console.log(response);
//             fetch(
//               `${process.env.CHAT}/api/v1/users.info?userId=${user.rocketId}`,
//               {
//                 method: "get",
//                 headers: {
//                   Accept: "application/json, text/plain, */*",
//                   "Content-Type": "application/json",
//                   "X-Auth-Token": response.data.authToken,
//                   "X-User-Id": response.data.userId,
//                 },
//               }
//             )
//               .then((response) => response.json())
//               .then((response) => {
//                 console.log(response);
//                 user.rocketname = response.user.username;
//               });
//           });
//         await user.save();
//       }
//     }
//     await delay(1000*60)
//   }

//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ err: "server error" });
//   }
// });

//add monitored category to board
router.put("/category/monitor/:id", auth, async (req, res) => {
  try {
    let new_prj = await Project.findOne({ "boards._id": req.body.board_id });
    let board = new_prj.boards.filter((el) => el._id == req.body.board_id)[0];
    board.monitor.push(req.params.id);
    await new_prj.save();
    await Project.populate(new_prj, [
      {
        path: "boards.categories",
        populate: [
          {
            path: "timeline.cards",
            populate: [
              {
                path: "comments.author",
              },
              { path: "creator" },
              { path: "user" },
              { path: "user2" },
              { path: "tasks.user" },
              { path: "tasks.user2" },
              { path: "execs" },
              {
                path: "event_users",
                select: "avatar fullname",
              },
            ],
          },
          {
            path: "expired",
            populate: [
              { path: "creator" },
              { path: "execs", select: "avatar fullname" },
              {
                path: "event_users",
                select: "avatar fullname",
              },
            ],
          },
        ],
      },
      {
        path: "boards.monitor",
        populate: [
          {
            path: "timeline.cards",
            populate: [
              { path: "creator" },
              { path: "execs", select: "avatar fullname" },
              {
                path: "event_users",
                select: "avatar fullname",
              },
            ],
          },
          {
            path: "expired",
            populate: [
              { path: "creator" },
              { path: "execs", select: "avatar fullname" },
              {
                path: "event_users",
                select: "avatar fullname",
              },
            ],
          },
        ],
      },
    ]);
    return res.json({ backlog: new_prj.backlog, board: board });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ err: "server error" });
  }
});

//remove monitored category from board
router.put("/category/monitor/remove/:id", auth, async (req, res) => {
  try {
    let prj = await Project.findOne({ "boards._id": req.body.board_id });
    let board = prj.boards.filter((el) => el._id == req.body.board_id)[0];
    board.monitor = board.monitor.filter((el) => el != req.params.id);
    await prj.save();
    await Project.populate(prj, [
      {
        path: "boards.categories",
        populate: [
          {
            path: "timeline.cards",
            populate: [
              {
                path: "comments.author",
              },
              { path: "creator" },
              { path: "user" },
              { path: "user2" },
              { path: "tasks.user" },
              { path: "tasks.user2" },
              { path: "execs" },
              {
                path: "event_users",
                select: "avatar fullname",
              },
            ],
          },
          {
            path: "expired",
            populate: [
              { path: "creator" },
              { path: "execs", select: "avatar fullname" },
              {
                path: "event_users",
                select: "avatar fullname",
              },
            ],
          },
        ],
      },
      {
        path: "boards.monitor",
        populate: [
          {
            path: "timeline.cards",
            populate: [
              { path: "creator" },
              { path: "execs", select: "avatar fullname" },
              {
                path: "event_users",
                select: "avatar fullname",
              },
            ],
          },
          {
            path: "expired",
            populate: [
              { path: "creator" },
              { path: "execs", select: "avatar fullname" },
              {
                path: "event_users",
                select: "avatar fullname",
              },
            ],
          },
        ],
      },
    ]);
    return res.json({ backlog: prj.backlog, board: board });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ err: "server error" });
  }
});

// //microkostil
// router.get("/micro/kostil/eee", async (req, res) => {
//   try {
//     let prjs = await Project.find({}).populate("boards.categories");
//     for (let prj of prjs) {
//       for (let board of prj.boards) {
//         for (let category of board.categories) {
//           category.columns = board.columns;
//           await category.save();
//         }
//       }
//     }
//     res.json("huy");
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ err: "server error" });
//   }
// });

//and another one
router.get("/eee/opyat/kostil/eee", async (req, res) => {
  try {
    let prjs = await Project.find().populate("boards.categories");
    for (let prj of prjs) {
      for (let board of prj.boards) {
        let og_board = { board_name: board.name, board_id: board._id };
        for (let category of board.categories) {
          category.og_board = og_board;
          await category.save();
        }
      }
    }
    res.json("huy");
  } catch (error) {
    console.error(error);
    return res.status(500).json({ err: "server error" });
  }
});

///help me
router.get("/help/me/pls", async (req, res) => {
  try {
    let categories = await Category.find({
      month: undefined,
      step: { $ne: undefined },
    });
    for (let category of categories) {
      for (let timeline of category.timeline) {
        if (timeline.start && timeline.end) {
          timeline.end = new Date(
            timeline.start.getTime() + 1000 * 60 * 60 * 24 * (category.step - 1)
          );
        }
        await category.save();
      }
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ err: "server error" });
  }
});
module.exports = router;
