const { response } = require("express");
const fetch = require("node-fetch");

module.exports = async (title, rocketchat, pepo) => 
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
  .then((res) =>
    fetch(`${process.env.CHAT}/api/v1/groups.create`, {
      method: "post",
      headers: {
        Accept: "application/json, text/plain, */*",
        "Content-Type": "application/json",
        "X-Auth-Token": res.data.authToken,
        "X-User-Id": res.data.userId,
      },
      body: JSON.stringify({ name: pepo+`-`+title }),
    })
      .then((response) => response.json())
      .then((response) => rocketchat = response.group._id)
      .then((rocketchat)=>{return rocketchat})
  );