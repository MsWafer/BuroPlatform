const fetch = require("node-fetch");

module.exports = async (req,res) => fetch(`${process.env.CHAT}/api/v1/login`, {
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
      fetch(`${process.env.CHAT}/api/v1/users.info?username=${req.body.rocketname}`, {
        method: "get",
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
          "X-Auth-Token": res.data.authToken,
          "X-User-Id": res.data.userId,
        },
      })
        .then((response) => response.json())
        .then((response) => {
          if (!response.success) {
            rocketId = undefined;
          } else {
            rocketId = response.user._id;
          }
        })
    );