const mongoose = require ('mongoose');
const Schema = mongoose.Schema;

const ProjectSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    stage: {
        type: String,
        required: true
    },
    dateStart: {
        type: Date,
    },
    dateFinish: {
        type: Date,
        default: null
    },
    team: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        default: []
    }],
    sprints: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'sprint',
        default: []
    }],
    customer: {
        type: String
    },
    city: {
        type: String
    },
    area: {
        type: String,
    },
    crypt: {
        type: String
    },
    crypter: {
        type: String
    }
    
});

module.exports = Project = mongoose.model('project', ProjectSchema);