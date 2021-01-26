const fetch = require("node-fetch");

module.exports = async (title, rocketchat, rname) => 
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
  .then(() =>{rname = title.replace(/:/g, "")},
    fetch(`${process.env.CHAT}/api/v1/channels.create`, {
      method: "post",
      headers: {
        Accept: "application/json, text/plain, */*",
        "Content-Type": "application/json",
        "X-Auth-Token": res.data.authToken,
        "X-User-Id": res.data.userId,
      },
      body: JSON.stringify({ name: rname }),
    })
      .then((response) => response.json())
      .then((response) => rocketchat = response.channel._id)
  );