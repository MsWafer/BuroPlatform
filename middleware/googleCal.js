const fs = require("fs");
const { google } = require("googleapis");
const CALENDAR_ID = "tcavbodc69gi2igvsb2scbkt20@group.calendar.google.com";
const KEYFILE = "../testcalendarplatform-aa4bb3d00f81.json";
const SCOPE_CALENDAR = "https://www.googleapis.com/auth/calendar";
const SCOPE_EVENTS = "https://www.googleapis.com/auth/calendar.events";

let readKey = async () => {
  try {
    const content = fs.readFileSync(__dirname + "/" + KEYFILE);
    return JSON.parse(content.toString());
  } catch (error) {
    console.error(error);
    return { err: "server error" };
  }
};

let authenticate = async (key) => {
  const jwtClient = new google.auth.JWT(
    key.client_email,
    null,
    key.private_key,
    [SCOPE_CALENDAR, SCOPE_EVENTS]
  );
  await jwtClient.authorize();
  return jwtClient;
};

let googleAuth = async () => {
  return await authenticate(await readKey());
};

exports.createEvent = async (title, description, start, end) => {
  const event = {
    summary: title,
    description: description,
    start: {
      dateTime: start,
      timeZone: "Europe/Riga",
    },
    // endTimeUnspecified: true,
    end: {
      dateTime: start,
      timeZone: "Europe/Riga",
    },
  };

  let calendar = google.calendar("v3");
  await calendar.events.insert({
    auth: await googleAuth(),
    calendarId: CALENDAR_ID,
    resource: event,
  });
};
