const Card = require("../models/Card");
const Category = require("../models/Category");

//timeline refresh
exports.timeline_refresh = async () => {
  let categories = await Category.find({
    "timeline.start": { $ne: undefined },
  });
  for (let category of categories) {
    let arr = category.timeline.filter((el, ind) => {
      return (
        el.end.getTime() < Date.now() && ind + 1 == category.timeline.length
      );
    });
    if (arr.length == 1) {
      if (!category.month) {
        let new_timeline = {
          start: Number(arr[0].end) + 1000 * 60 * 60 * 24,
          cards: [],
        };
        new_timeline.end =
          new_timeline.start + 1000 * 60 * 60 * 24 * (category.step - 1);
        await Category.populate(categories, { path: "timeline.cards" });
        // for (let card of arr[0].cards) {
        //   // if (card.regular) {
        //   //   // console.log(card)
        //   //   let newCard = new Card(JSON.parse(JSON.stringify(card)));
        //   //   // console.log(newCard)
        //   //   newCard.status = false;
        //   //   delete newCard._id;
        //   //   newCard.comments = [];
        //   //   newCard.expired = false;
        //   //   newCard.column = "В работе";
        //   //   newCard.deadline
        //   //     ? (newCard.deadline += 1000 * 60 * 60 * 24 * category.step)
        //   //     : undefined;
        //   //   for (let task of newCard.tasks) {
        //   //     task.taskStatus = false;
        //   //     delete task._id;
        //   //     task.deadline
        //   //       ? (task.deadline += 1000 * 60 * 60 * 24 * category.step)
        //   //       : undefined;
        //   //   }
        //   //   await newCard.save();
        //   //   new_timeline.cards.push(newCard);
        //   // }
        // }
        category.timeline.push(new_timeline);
      } else {
        let new_timeline = {
          start: Number(arr[0].end) + 1000 * 60 * 60 * 24,
          cards: [],
        };
        // let end;
        // console.log(new Date(new_timeline.start).getMonth());
        let month =
          new Date(new_timeline.start).getMonth() + category.month < 12
            ? new Date(new_timeline.start).getMonth() + category.month
            : new Date(new_timeline.start).getMonth() + category.month - 12;
        new_timeline.end = new Date(
          new Date(new_timeline.start).getFullYear() + category.month < 12
            ? new Date(new_timeline.start).getFullYear()
            : new Date(new_timeline.start).getFullYear() + 1,
          month,0
        );
        // new_timeline.end =
        //   new_timeline.start + 1000 * 60 * 60 * 24 * (category.step - 1);
        await Category.populate(categories, { path: "timeline.cards" });
        for (let card of arr[0].cards) {
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
    }
    await category.save();
  }
};

//expired check
exports.expired_check = async () => {
  try {
    let categories = await Category.find().populate({ path: "timeline.cards" });
    for (let category of categories) {
      for (let timeline of category.timeline) {
        if (timeline.end && timeline.end.getTime() < Date.now()) {
          for (let card of timeline.cards) {
            if (
              card.column != "Готово" &&
              card.column != "Просроченная невидимая колонка" &&
              !card.deadline
            ) {
              card.column = "Просроченная невидимая колонка";
              category.expired.push(card._id);
              card.comments.push({
                text: "Карточка просрочена",
                date: new Date(),
                type: "history",
                author: card.creator,
              });
              await card.save();
            }
          }
        }
        for (let card of timeline.cards) {
          if (
            card.deadline &&
            card.column != "Готово" &&
            card.column != "Просроченная невидимая колонка" &&
            card.deadline.getTime() < Date.now()
          ) {
            card.column = "Просроченная невидимая колонка";
            category.expired.push(card._id);
            card.comments.push({
              text: "Карточка просрочена",
              date: new Date(),
              type: "history",
              author: card.creator,
            });
            await card.save();
          }
        }
      }
      await category.save();
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ err: "server error" });
  }
};
