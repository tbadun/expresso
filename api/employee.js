const express = require('express');
const sqlite3 = require('sqlite3');
const timesheetRouter = require('./timesheet')

const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite')

employeeRouter = express.Router();
employeeRouter.use('/timesheets', timesheetRouter);

module.exports = employeeRouter;