const axios = require("axios");

module.exports = (tokens, notification_body, data, push_title) => {
  let message = {
    priority: "high",
    delayWhileIdle: true,
    timeToLive: 3,
    restrictedPackageName: "com.buronative",
    notification: {
      icon: "ic_launcher",
    },
  };
  message.notification.body = notification_body;
  message.notification.title = push_title
  message.data = data;
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
