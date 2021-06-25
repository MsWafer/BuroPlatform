const fetch = require("node-fetch");
const User = require("../models/User");

module.exports = async (user_ids, card_name, card_date) => {
  let users = await User.find({ _id: { $in: user_ids } });
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
    .then((res) => {
      for (let user of users) {
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
            text: card_date
              ? `Подходит срок сдачи "${card_name}" ${card_date.toLocaleDateString()}`
              : `Подходит срок сдачи "${card_name}"`,
          }),
        });
      }
    });
};
