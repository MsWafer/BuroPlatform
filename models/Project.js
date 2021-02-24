const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ProjectSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
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
    default: "a",
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
    required: true,
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
  // [
  //   {
  //     email: {
  //       type: String,
  //     },
  //     phone: {
  //       type: String,
  //     },
  //     name: {
  //       type: String,
  //     },
  //   },
  // ],
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
  tags: [
    {
      type: String,
    },
  ],
  urn: {
    type: String,
  },
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
});

module.exports = Project = mongoose.model("project", ProjectSchema);
