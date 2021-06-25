const fetch = require("node-fetch");
const User = require("../models/User");

module.exports = async (user_id, card_title, board_url) => {
  let user = await User.findOne({ _id: user_id });
  let auth;
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
    .then((res) => (auth = res))
    .then(() =>
      fetch(`${process.env.CHAT}/api/v1/users.info?userId=${user.rocketId}`, {
        method: "get",
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
          "X-Auth-Token": auth.data.authToken,
          "X-User-Id": auth.data.userId,
        },
      })
        .then((response) => response.json())
        .then((response) => {
          if (!response.success) {
            return undefined;
          } else {
            let name = response.user.username;
            fetch(`${process.env.CHAT}/api/v1/chat.postMessage`, {
              method: "post",
              headers: {
                Accept: "application/json, text/plain, */*",
                "Content-Type": "application/json",
                "X-Auth-Token": auth.data.authToken,
                "X-User-Id": auth.data.userId,
              },
              body: JSON.stringify({
                channel: `@${name}`,
                text: `Вас упомянули в карточке "${card_title}"`,
                attachments: [
                  {
                    title: "Ссылка на доску",
                    title_link: board_url,
                  },
                ],
              }),
            });
          }
        })
    );
};
