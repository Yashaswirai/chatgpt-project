const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const indexRoute = require('./routes/index.routes');
const authRoute = require('./routes/auth.routes');

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/', indexRoute);
app.use('/auth', authRoute);

module.exports = app;