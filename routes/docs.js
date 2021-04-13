const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const manauth = require("../middleware/manauth");
const { check, validationResult } = require("express-validator");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, __dirname + "/../public/docimages");
  },
  filename: (req, file, cb) => {
    cb(
      null,
      path.basename(file.originalname, path.extname(file.originalname)) +
        "-" +
        Date.now() +
        "-" +
        path.extname(file.originalname)
    );
  },
});
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
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
const Doc = require("../models/Docs");
const mainDir = path.resolve(__dirname + "/../public/docs");

//recursive test
router.get("/recurse", async (req, res) => {
  try {
    let a = path.resolve(__dirname + "/../public");
    let func = (dir,dirname) => {
      let govno = dir + "/" + dirname
      let result = { dirname: dirname,dirpath:/public(.+)/.exec(govno)[1], files: [], subdirs: [] };
      let b = fs.readdirSync(govno);
      for (let c of b) {
        if (fs.lstatSync(govno + "/" + c).isFile()) {
          result.files.push(c);
        } else {
          result.subdirs.push(func(govno,c));
        }
      }
      return result;
    };
    res.json(func(a,"docs"));
  } catch (error) {
    console.error(error);
    return res.status(500).json({ err: "server error" });
  }
});

//get folder structure
router.get("/directory", async (req, res) => {
  try {
    let func = async (mainDir) => {
      let dirs = [{ dirname: "root", files: [] }];
      let subdirs = fs.readdirSync(mainDir);
      if (subdirs.length == 0) {
        return [];
      }
      for (let dir of subdirs) {
        if (dir.match(/\./g)) {
          dirs[0].files.push(`docs/` + dir);
        } else {
          let subdirObj = { dirname: dir, files: [], subdirs: [] };
          dirs.push(subdirObj);
          let dirInd = dirs.indexOf(subdirObj);
          let files = fs.readdirSync(mainDir + "/" + dir);
          for (let file of files) {
            if (file.match(/\./g)) {
              dirs[dirInd].files.push(file);
            } else {
              let obj = { dirname: dir, files: [], subdirs: [] };

              dirs[dirInd].subdirs.push(file);
            }
          }
        }
      }
      return dirs;
    };
    let directories = await func(mainDir);
    res.json(directories);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ err: "server error" });
  }
});

//upload file
router.post(
  "/imageupload",
  manauth,
  upload.single("file"),
  async (req, res) => {
    try {
      return res.json({
        msg: "Файл загружен",
        filename: "docimages/" + req.file.filename,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ err: "server error" });
    }
  }
);

//make dir
router.put("/mkdir", manauth, async (req, res) => {
  try {
    if (req.body.dirname.match(/\.\./g)) {
      return res.json("huy");
    }
    if (fs.existsSync(mainDir + "/" + req.body.dirname)) {
      return res.json("Папка с таким именем уже существует");
    }
    fs.mkdirSync(mainDir + "/" + req.body.dirname);
    res.redirect(303, "/docs/recurse");
  } catch (error) {
    console.error(error);
    return res.status(500).json({ err: "server error" });
  }
});

//write file
router.post("/filepost", manauth, async (req, res) => {
  try {
    let keys = Object.keys(req.body);
    let text = JSON.stringify(req.body.text);
    req.body.text = "";
    for (let key of keys) {
      if (req.body[key].match(/\.\./g)) {
        return res.json("huy");
      }
    }
    if (!fs.existsSync(mainDir + "/" + req.body.dir)) {
      return res.json("Указанной папки не существует");
    }
    let file = path.resolve(
      req.body.dir
        ? mainDir + "/" + req.body.dir + "/" + req.body.filename
        : mainDir + "/" + req.body.filename
    );
    fs.writeFileSync(file, text);
    res.redirect(303, "/docs/recurse");
  } catch (error) {
    console.error(error);
    return res.status(500).json({ err: "server error" });
  }
});

//write file
router.post("/editfile", manauth, async (req, res) => {
  try {
    let keys = Object.keys(req.body);
    let text = JSON.stringify(req.body.text);
    req.body.text = "";
    for (let key of keys) {
      if (req.body[key].match(/\.\./g)) {
        return res.json("huy");
      }
    }
    if (!fs.existsSync(mainDir + "/" + req.body.dir)) {
      return res.json("Указанной папки не существует");
    }
    let file = path.resolve(
      req.body.dir
        ? mainDir + "/" + req.body.dir + "/" + req.body.filename
        : mainDir + "/" + req.body.filename
    );
    fs.writeFileSync(file, text);
    res.download(mainDir + "/" + req.body.dir + "/" + req.body.filename);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ err: "server error" });
  }
});

//readfile
router.put("/read", async (req, res) => {
  try {
    if (req.body.filepath.match(/\.\./g)) {
      return res.json("huy");
    }
    res.download(
      path.resolve(__dirname + "/../public/docs/" + req.body.filepath),
      req.body.filepath
    );
  } catch (error) {
    console.error(error);
    return res.status(500).json({ err: "server error" });
  }
});

//delete file
router.put("/delete", async (req, res) => {
  try {
    if (req.body.filepath.match(/\.\./g)) {
      return res.json("huy");
    }
    if (fs.existsSync(mainDir + "/" + req.body.filepath)) {
      fs.unlinkSync(mainDir + "/" + req.body.filepath);
    }
    res.redirect(303, "/docs/recurse");
  } catch (error) {
    console.error(error);
    return res.status(500).json({ err: "server error" });
  }
});

//rm folder
router.put("/delete/dir", async (req, res) => {
  try {
    if (req.body.path.match(/\.\./g)) {
      return res.json("huy");
    }
    if (fs.existsSync(mainDir + "/" + req.body.path)) {
      fs.rmSync(mainDir + "/" + req.body.path, { recursive: true });
    }
    res.redirect(303, "/docs/recurse");
  } catch (error) {
    console.error(error);
    return res.status(500).json({ err: "server error" });
  }
});

module.exports = router;
