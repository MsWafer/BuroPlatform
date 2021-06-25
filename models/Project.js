const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ProjectSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  epics: [
    {
      title: { type: String },
      description: { type: String },
      datePlan: { type: Date },
      dateFact: { type: Date },
      status: { type: Number, default: 0 },
      notes: [
        {
          text: { type: String },
          date: { type: Date },
        },
      ],
    },
  ],
  stageChange: [
    {
      status: {
        type: Number,
      },
      oldStage: {
        type: String,
      },
      nextStage: {
        type: String,
      },
      datePlan: {
        type: Date,
      },
      dateFact: {
        type: Date,
      },
    },
  ],
  offTitle: {
    type: String,
  },
  type: {
    type: String,
    required: true,
  },
  stage: {
    type: String,
    required: true,
  },
  about: {
    type: String,
    default: "",
  },
  dateStart: {
    type: Date,
  },
  dateFinish: {
    type: Date,
    default: null,
  },
  par: {
    type: String,
  },
  cusStorage: {
    type: String,
  },
  schedule: {
    type: String,
  },
  budget: {
    type: String,
  },
  team: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      default: [],
    },
  ],
  team2: [
    {
      position: {
        type: String,
      },
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
      },
      task: {
        type: String,
      },
      fullname: {
        type: String,
      },
    },
  ],
  sprints: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "sprint",
      default: [],
    },
  ],
  customer: { type: String },
  customerNew: [
    {
      name: { type: String },
      phone: { type: String },
      email: { type: String },
      other: { type: Array, default: [] },
    },
  ],
  city: {
    type: String,
  },
  area: {
    type: Number,
  },
  crypt: {
    type: String,
  },
  crypter: {
    type: String,
  },
  status: {
    type: Boolean,
    default: false,
  },
  rocketchat: {
    type: String,
  },
  rocketname: {
    type: String,
  },
  tags: {
    type: Array,
    default: [],
  },
  urn: {
    type: String,
  },
  urnDate: {
    type: Date,
  },
  urnNew: [
    {
      urn: { type: String },
      date: { type: Date },
      title: { type: String },
      version: { type: Number, default: 1 },
      user: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
      tags: { type: Array, default: [] },
      old: [
        {
          urn: { type: String },
          date: { type: Date },
          version: { type: Number },
          user: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
        },
      ],
    },
  ],
  obj: {
    type: String,
  },
  mtl: {
    type: String,
  },
  release: [
    {
      version: {
        type: Number,
        default: 1,
      },
      publicId: {
        type: String,
      },
      urn: {
        type: String,
      },
      approve: {
        type: String,
        default: "unapproved",
      },
      edits: {
        type: String,
      },
      date: {
        type: Date,
      },
    },
  ],
  infoRes: [
    {
      description: {
        type: String,
      },
      name: {
        type: String,
      },
      content: {
        type: String,
      },
      type: {
        type: String,
      },
    },
  ],
  boards: [
    {
      name: String,
      categories: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "category",
        },
      ],
      columns: {
        type: Array,
      },
      archive: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "card",
        },
      ],
      monitor: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "category",
        },
      ],
    },
  ],
  backlog: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "card",
    },
  ],
  cover: {
    type: String,
    default: "avatars/spurdo.png",
  },
  object: {
    type: String,
  },
});

module.exports = Project = mongoose.model("project", ProjectSchema);
