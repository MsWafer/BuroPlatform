const fetch = require("node-fetch");

module.exports = fetch(`${process.env.CHAT}/api/v1/login`, {
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
