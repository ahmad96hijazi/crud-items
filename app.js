const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
const passport = require('passport');
const flash = require('connect-flash');
const session = require('express-session');
const path = require('path');
const mongoStore = require('connect-mongo');
const fs = require('fs');

const app = express();

// Passport Config
require('./config/passport')(passport);

// DB Config
const db = require('./config/keys').mongoURI;

// Connect to MongoDB
mongoose
    .connect(db, {useNewUrlParser: true, useUnifiedTopology: true})
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));

// EJS
app.use(expressLayouts);
app.set('view engine', 'ejs');
app.set("layout extractScripts", true)
app.set("layout extractStyles", true)

// Express body parser
app.use(express.urlencoded({extended: true}));

// Express session
app.use(
    session({
        secret: process.env.APP_SECRECT || 'secret',
        resave: true,
        saveUninitialized: true,
        store: mongoStore.create({mongoUrl: db})
    })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect flash
app.use(flash());

// Global variables
app.use(function (req, res, next) {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
});

// Routes
app.use('/', require('./routes/index.js'));
app.use('/panel', require('./routes/panel.js'));
app.use('/users', require('./routes/users.js'));

app.post('/upload', (req, res) => {
    require('./config/multer').upload(req, res, (err) => {
        if (err) {
            return res.status(500).json({
                msg: err
            });
        } else {
            if (req.files === undefined) {
                return res.status(422).json({
                    msg: 'Error: No File/s Selected!'
                });
            } else {
                return res.json({
                    msg: 'File Uploaded!',
                });
            }
        }
    });
});

app.post('/upload/delete', (req, res) => {
    fs.unlink(`./storage/uploads/${req.body.tobedeleted}`, function (err) {
        if (err) /*throw err;*/
            return res.status(500).json({
                msg: err
            });

        // if no error, file has been deleted successfully
        return res.redirect(req.body.toberedirected);
    });
});

// Set static folder
app.use('/assets', express.static(path.join(__dirname, 'assets')))
app.use('/uploads', express.static(path.join(__dirname, 'storage', 'uploads')));

const PORT = process.env.APP_PORT || 5050;

app.listen(PORT, () => console.log(`Server running on  ${PORT}`));
console.log('Access URLs')
console.log('-----------------------------------')
console.log(`Localhost: http://localhost:${PORT}`)
console.log('-----------------------------------')
