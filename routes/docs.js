const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const manauth = require("../middleware/manauth");
const { check, validationResult } = require("express-validator");
const fs = require("fs");
const path = require("path");
const Doc = require("../models/Docs");
const mainDir = __dirname + "/../public/docs";

//get folder structure
router.get("/directory", async (req, res) => {
  try {
    // let mainDir = __dirname + "/../public/docs";
    let func = async (mainDir) => {
      let dirs = [{ dirname: "root", files: [] }];
      let subdirs = fs.readdirSync(mainDir);
      if (subdirs.length == 0) {
        return res.json([]);
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
              dirs[dirInd].files.push(`docs/${dir}/` + file);
            } else {
              let obj_obj = { dirname: file, files: [] };
              dirs[dirInd].subdirs.push(obj_obj);
              let subdirInd = dirs[dirInd].subdirs.indexOf(obj_obj);
              console.log(file);
              let idk = fs.readdirSync(mainDir + "/" + dir + "/" + file);
              for (let shit of idk) {
                dirs[dirInd].subdirs[subdirInd].files.push(
                  `docs/${dir}/${file}/` + shit
                );
              }
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

//make dir
router.put("/mkdir", async (req, res) => {
  try {
    if (req.body.dirname.match(/\.\./g)) {
      return res.json("huy");
    }
    if (fs.existsSync(mainDir + "/" + req.body.dirname)) {
      return res.json("Папка с таким именем уже существует");
    }
    fs.mkdirSync(mainDir + "/" + req.body.dirname);
    res.redirect(303, "/docs/directory");
  } catch (error) {
    console.error(error);
    return res.status(500).json({ err: "server error" });
  }
});

//write file
router.post("/filepost", async (req, res) => {
  try {
    let keys = Object.keys(req.body);
    let text = req.body.text;
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
    res.redirect(303, "/docs/directory");
  } catch (error) {
    console.error(error);
    return res.status(500).json({ err: "server error" });
  }
});

//readfile
router.get("/read", async (req, res) => {
  try {
    if (req.body.filepath.match(/\.\./g)) {
      return res.json("huy");
    }
    res.download(__dirname + "/../public/" + req.body.filepath, "file.txt");
  } catch (error) {
    console.error(error);
    return res.status(500).json({ err: "server error" });
  }
});

// //new part
// router.post("/", auth, async (req, res) => {
//   try {
//     let doc = await Doc.findOne({ title: req.body.title });
//     if (doc) {
//       return res.status(400).json({ err: "Название занято" });
//     }
//     doc = new Doc({
//       title: req.body.title,
//       text: req.body.text,
//       creator: req.user.id,
//     });
//     await doc.save();
//     return res.json(doc);
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ err: "server error" });
//   }
// });

// //add doc
// router.post("/:id", auth, async (req, res) => {
//   try {
//     let doc = await Doc.findOne({ _id: req.params.id });
//     if (!doc) {
//       return res.status(404).json({ err: "Док не найден" });
//     }
//     let subdoc = {
//       title: req.body.title,
//       text: req.body.text,
//       creator: req.user.id,
//     };
//     doc.docs.push(subdoc);
//     await doc.save();
//     return res.json(doc);
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ err: "server error" });
//   }
// });

// //get all
// router.get("/", auth, async (req, res) => {
//   try {
//     let docs = await Doc.find().select("title docs.title");
//     return res.json(docs);
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ err: "server error" });
//   }
// });

// //get specific doc
// router.get("/find", auth, async (req, res) => {
//   try {
//     let doc;
//     req.query.type == "id"
//       ? (doc = await Doc.findOne({ _id: req.query._id }).select("title text"))
//       : (doc = await Doc.findOne({ "docs._id": req.query.id }).docs[
//           req.query.index
//         ]);
//     return res.json(doc);
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ err: "server error" });
//   }
// });
module.exports = router;
