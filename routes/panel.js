const express = require('express');
const fs = require('fs');
const Item = require('../models/Item');
const router = express.Router();
const {ensureAuthenticated, forwardAuthenticated} = require('../config/auth');

// Home
router.get('/home', ensureAuthenticated, (req, res) =>
    res.render('panel/home', {
        user: req.user,
        host: req.get('host'),
        pathname: req.originalUrl,
        layout: 'panel',
    })
);

// Items
router.all('/items/:id?', ensureAuthenticated, async (req, res) => {
        if (req.params.id === undefined) {
            if (req.method === 'POST') {
                switch (req.body.method) {
                    case 'post':
                        await (new Item({
                            ...(req.body)
                        })).save()
                        break;
                    case 'put':
                        await Item.findByIdAndUpdate(req.body.id, {
                            name: req.body.name,
                            datetime: req.body.datetime,
                            description: req.body.description,
                            price: req.body.price,
                            quantity: req.body.quantity,
                        })
                        break;
                    case 'delete':
                        await Item.findByIdAndDelete(req.body.id)
                        break;
                }

                return res.redirect('/panel/items')
            }

            const items = await Item.find({})
            return res.render('panel/items', {
                user: req.user,
                host: req.get('host'),
                pathname: req.originalUrl,
                items: items,
                layout: 'panel',
            })
        } else {
            const item = await Item.findById(req.params.id)

            if (item === undefined)
                return res.status(404).json({
                    message: 'Not Found'
                })
            else
                return res.json(item)
        }
    }
);

router.get('/items/:id/gallery', ensureAuthenticated, (req, res) => {
        fs.readdir(`./storage/uploads/${req.params.id}/`, async (err, files) => {
            const item = await Item.findById(req.params.id)

            if (item === undefined)
                return res.status(404).json({
                    message: 'Not Found'
                })
            else
                return res.render('panel/gallery', {
                    user: req.user,
                    host: req.get('host'),
                    pathname: req.originalUrl,
                    id: req.params.id,
                    item: item,
                    images: files,
                    layout: 'panel',
                })

        });
    }
);

module.exports = router;
