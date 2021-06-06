const express = require('express');
const Item = require("../models/Item");
const router = express.Router();

router.get('/items/:id?', async (req, res) => {
        if (req.params.id === undefined) {
            const items = await Item.find({}, {__v: 0})
            return res.json({items})
        } else {
            const item = await Item.findById(req.params.id, {__v: 0})

            if (item === undefined)
                return res.status(404).json({
                    message: 'Not Found'
                })
            else
                return res.json({item})
        }
    }
);

module.exports = router;
