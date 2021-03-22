const axios = require("axios");
let message;
const message_template = {
  priority: "high",
  delayWhileIdle: true,
  timeToLive: 3,
  restrictedPackageName: "com.buronative",
  notification: {
    title: "buro platform",
    icon: "ic_launcher",
  },
};

module.exports = (tokens, notification_body) => {
  message = message_template;
  message.notification.body = notification_body;
  axios
    .post(process.env.PUSH_SERVER, {
      tokens: tokens,
      message: message,
      key: process.env.PUSH_SERVER_KEY,
    })
    .then((response) => {
      return console.log(response.data);
    })
    .catch((err) => {
      return console.log(err.data);
    });
};

//call example

// let notification_body = "notification's text"
// if (token_array) {
//     await mob_push([token_array], notification_body)
//       .then((response) => console.log(response.data))
//       .catch((err) => console.log(err.data));
//   }
