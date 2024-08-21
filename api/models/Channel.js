const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const channelSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    messages: [{
        type: Schema.Types.ObjectId,
        ref: 'Message'
    }]
});

const Channel = model('Channel', channelSchema);

module.exports = Channel;
