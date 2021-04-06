const axios = require("axios");
const User = require("../models/User");

module.exports = async(tokens, notification_body, data, push_title) => {
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
  message.data.read = false;
  message.data.id = Math.random().toString(36)
  message.data.date = Date.now()
  for(let token of tokens){
    let user = await User.findOne({device_tokens:token})
    if(!user){continue}
    user.notifications.push(message)
    user.notifications = user.notifications.filter((v,i,a)=>a.findIndex(t=>(JSON.stringify(t) === JSON.stringify(v)))===i)
    if(user.notifications.length>10){user.notifications.splice(10,1)}
    await user.save()
  }
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
