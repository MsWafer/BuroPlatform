// const fetch = require("node-fetch");
const Card = require("../models/Card");
const rocketPushCard = require("./rocketPushCard");

module.exports = async () => {
  try {
    await Card.find(
      {
        "notification.date": { $lte: Date.now() },
      },
      async (err, docs) => {
        if (err) throw err;
        for (let doc of docs) {
          for (let notification of doc.notification) {
            if (notification.date <= Date.now()) {
              await rocketPushCard(
                notification.users,
                doc.title,
                new Date(notification.date)
              );
              doc.notification = doc.notification.filter(
                (el) => el._id != notification._id
              );
            }
          }
          await doc.save();
        }
      }
    );
  } catch (error) {
    console.error(error);
    return res.status(500).json({ err: "server error" });
  }
};
