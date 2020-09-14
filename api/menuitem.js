const express = require('express');
const sqlite3 = require('sqlite3');
const bodyParser = require('body-parser');

const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite')

menuitemRouter = express.Router();
menuitemRouter.use(bodyParser.json());

module.exports = menuitemRouter;