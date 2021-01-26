const fetch = require("node-fetch");

module.exports = async (project,user) => fetch(`${process.env.CHAT}/api/v1/login`, {
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
  .then((res) =>
    fetch(`${process.env.CHAT}/api/v1/groups.kick`, {
      method: "post",
      headers: {
        Accept: "application/json, text/plain, */*",
        "Content-Type": "application/json",
        "X-Auth-Token": res.data.authToken,
        "X-User-Id": res.data.userId,
      },
      body: JSON.stringify({
        roomId: project.rocketchat,
        userId: user.rocketId,
      }),
    }).catch((error)=>console.error(error))
  ).catch((error)=>console.error(error));