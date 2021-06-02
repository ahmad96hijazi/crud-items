const mongoose = require('mongoose');

const ItemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    link: {
        type: String,
    },
    datetime: {
        type: Date,
        default: Date.now
    }
});

const Item = mongoose.model('Item', ItemSchema);

module.exports = Item;
