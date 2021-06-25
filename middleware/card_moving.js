const Card = require("../models/Card");
const Project = require("../models/Project");
const Category = require("../models/Category");

exports.backlog_expired = async (category_id, card_id, user_id, index) => {
  try {
    await Project.findOne({ backlog: card_id }, (err, doc) => {
      if (err) throw err;
      doc.backlog = doc.backlog.filter((el) => el != card_id);
      doc.save();
    });
    await Category.findOne({ _id: category_id }, (err, doc) => {
      if (err) throw err;
      doc.expired.splice(index, 0, card_id);
      doc.save();
    });
    let comment = {
      text: `Беклог -> Просрочено`,
      author: user_id,
      date: Date.now(),
      type: "history",
    };
    await Card.findOneAndUpdate(
      { _id: card_id },
      {
        $set: { column: "Просроченная невидимая колонка" },
        $push: { comments: comment },
      }
    );
    return { msg: "uspeh" };
  } catch (error) {
    console.error(error);
    return { err: "server error" };
  }
};

exports.backlog_timeline = async (
  timeline_id,
  card_id,
  column,
  index,
  user_id
) => {
  try {
    let project = await Project.findOne({ backlog: card_id });
    project.backlog = project.backlog.filter((el) => el != card_id);
    await project.save();
    let category = await Category.findOne({ "timeline._id": timeline_id });
    let comment = {
      text: `Беклог -> "${column}", "${category.name}"`,
      author: user_id,
      date: Date.now(),
      type: "history",
    };
    await Card.findOneAndUpdate(
      { _id: card_id },
      { $set: { column: column }, $push: { comments: comment } }
    );
    let timeline = category.timeline.filter((el) => el._id == timeline_id)[0];
    if (timeline.cards.length > 0) {
      timeline.cards.splice(index, 0, card_id);
    } else {
      timeline.cards.push(card_id);
    }

    await category.save();
    return { msg: "uspeh" };
  } catch (error) {
    console.error(error);
    return { err: "server error" };
  }
};

exports.timeline_timeline = async (
  old_timeline_id,
  timeline_id,
  card_id,
  column,
  index,
  user_id
) => {
  try {
    let old_category = await Category.findOne({
      "timeline._id": old_timeline_id,
    });
    if (!old_category) {
      return;
    }
    let old_timeline = old_category.timeline.filter(
      (el) => el._id == old_timeline_id
    )[0];
    old_timeline.cards = old_timeline.cards.filter((el) => el._id != card_id);
    await old_category.save();
    let category = await Category.findOne({ "timeline._id": timeline_id });
    if (!category) {
      return;
    }
    let timeline = category.timeline.filter((el) => el._id == timeline_id)[0];
    if (timeline.cards.length > 0) {
      timeline.cards.splice(index, 0, card_id);
    } else {
      timeline.cards.push(card_id);
    }
    // timeline.cards.push(card_id);
    await category.save();
    await Card.findOne({ _id: card_id }, (err, doc) => {
      if (err) throw err;
      let comment = {
        author: user_id,
        date: new Date(),
        type: "history",
      };
      switch (true) {
        case doc.column == column && old_timeline_id == timeline_id:
          break;
        case doc.column == column:
          comment.text = `${old_category.name} -> ${category.name}`;
          doc.comments.push(comment);
          break;
        case old_timeline_id == timeline_id:
          comment.text = `${doc.column} -> ${column}`;
          doc.column = column;
          doc.comments.push(comment);
          break;
        default:
          comment.text = `${doc.column} - > ${column}, ${old_category.name} -> ${category.name}`;
          doc.column = column;
          doc.comments.push(comment);
          break;
      }
      doc.save();
    });
    return { msg: "uspeh" };
  } catch (error) {
    console.error(error);
    return { err: "server error" };
  }
};

exports.timeline_expired = async (category_id, card_id, user_id, index) => {
  try {
    await Category.findOne({ _id: category_id }, (err, doc) => {
      if (err) throw err;
      doc.expired.splice(index, 0, card_id);
      doc.save();
    });
    await Card.findOne({ _id: card_id }, (err, doc) => {
      if (err) throw err;
      let comment = {
        text: `${doc.column} -> Просрочено`,
        author: user_id,
        date: Date.now(),
        type: "history",
      };
      doc.comments.push(comment);
      doc.column = "Просроченная невидимая колонка";
      doc.save();
    });
    return { msg: "uspeh" };
  } catch (error) {
    console.error(error);
    return { err: "server error" };
  }
};

exports.expired_expired = async (
  old_category_id,
  category_id,
  card_id,
  index
) => {
  try {
    if (old_category_id == category_id) {
      await Category.findOne({ _id: old_category_id }, (err, doc) => {
        if (err) throw err;
        if (!doc) {
          return;
        }
        doc.expired = doc.expired.filter((el) => el != card_id);
        doc.expired.splice(index, 0, card_id);
        doc.save();
      });
    } else {
      await Category.findOne({ _id: old_category_id }, (err, doc) => {
        if (err) throw err;
        if (!doc) {
          return;
        }
        doc.expired = doc.expired.filter((el) => el != card_id);
        doc.save();
      });
      await Category.findOne({ _id: category_id }, (err, doc) => {
        if (err) throw err;
        if (!doc) {
          return;
        }
        doc.expired.splice(index, 0, card_id);
        doc.save();
      });
    }

    return { msg: "uspeh" };
  } catch (error) {
    console.error(error);
    return { err: "server error" };
  }
};

exports.timeline_backlog = async (
  old_timeline_id,
  crypt,
  card_id,
  index,
  user_id
) => {
  try {
    let project = await Project.findOne({
      crypt: crypt,
    });
    if (!project) {
      return;
    }
    if (project.backlog.length == 0) {
      project.backlog.push(card_id);
    } else {
      project.backlog.splice(index, 0, card_id);
    }
    await project.save();
    let old_category = await Category.findOne({
      "timeline._id": old_timeline_id,
    });
    let comment = {
      text: `"${old_category.name}" -> "Беклог"`,
      author: user_id,
      date: Date.now(),
      type: "history",
    };
    await Card.findOneAndUpdate(
      { _id: card_id },
      { $push: { comments: comment } }
    );
    let timeline = old_category.timeline.filter(
      (el) => el._id == old_timeline_id
    )[0];
    timeline.cards = timeline.cards.filter((el) => el != card_id);
    await old_category.save();
    return { msg: "uspeh" };
  } catch (error) {
    console.error(error);
    return { err: "server error" };
  }
};

exports.backlog_backlog = async (card_id, index, user_id) => {
  try {
    let project = await Project.findOne({ backlog: card_id });
    project.backlog = project.backlog.filter((el) => el != card_id);
    project.backlog.splice(index, 0, card_id);
    await project.save();
    return { msg: "uspeh" };
  } catch (error) {
    console.error(error);
    return { err: "server error" };
  }
};

exports.expired_backlog = async (
  old_category_id,
  crypt,
  card_id,
  index,
  user_id
) => {
  try {
    let project = await Project.findOne({
      crypt: crypt,
    });
    project.backlog.splice(index, 0, card_id);
    await project.save();
    let comment = {
      text: `Просрочено -> Беклог`,
      author: user_id,
      date: Date.now(),
      type: "history",
    };
    await Card.findOneAndUpdate(
      { _id: card_id },
      {
        $set: { column: "Просроченная невидимая колонка" },
        $push: { comments: comment },
      }
    );
    let old_category = await Category.findOne({
      _id: old_category_id,
    });
    old_category.expired = old_category.expired.filter((el) => el != card_id);
    await old_category.save();
    return { msg: "uspeh" };
  } catch (error) {
    console.error(error);
    return { err: "server error" };
  }
};

exports.expired_timeline = async (
  category_id,
  timeline_id,
  card_id,
  column,
  index,
  user_id
) => {
  try {
    await Category.findOneAndUpdate(
      { _id: category_id },
      { $pull: { expired: card_id } }
    );
    let category = await Category.findOne(
      { "timeline._id": timeline_id },
      (err, doc) => {
        if (err) throw err;
        let timeline = doc.timeline.filter((el) => el._id == timeline_id)[0];
        timeline.cards = timeline.cards.filter((el) => el != card_id);
        timeline.cards.splice(index, 0, card_id);
        doc.save();
      }
    );
    let comment = {
      text: `Просрочено -> ${column}`,
      author: user_id,
      date: Date.now(),
      type: "history",
    };
    await Card.findOneAndUpdate(
      { _id: card_id },
      { $set: { column: column }, $push: { comments: comment } }
    );

    await category.save();
    return { msg: "uspeh" };
  } catch (error) {
    console.error(error);
    return { err: "server error" };
  }
};
