const express = require('express');
const sqlite3 = require('sqlite3');
const menuitemRouter = require('./menuitem');

const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite')

menuRouter = express.Router();
menuRouter.use('/menu-items', menuitemRouter);

module.exports = menuRouter;