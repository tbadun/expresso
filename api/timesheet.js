const express = require('express');
const sqlite3 = require('sqlite3');
const bodyParser = require('body-parser');

const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite')

timesheetRouter = express.Router();
timesheetRouter.use(bodyParser.json());

timesheetRouter.get('/', (req,res,next) => {
    db.all(`SELECT * FROM Timesheet WHERE employee_id = ${req.params.employeeId};`, (err,rows) => {
        if (err) {
            next(err);
        } else {
            res.status(200).json({timesheets: rows})
        }
    })
});

const checkRequirements = (req,res,next) => {
    const timesheet = req.body.timesheet;
    if (!timesheet.hours || !timesheet.rate || !timesheet.date) {
        res.sendStatus(400);
    } else {
        next();
    }
}

timesheetRouter.post('/', checkRequirements, (req,res,next) => {
    const timesheet = req.body.timesheet;
    const sql = `INSERT INTO Timesheet (hours, rate, date, employee_id) VALUES ($hours, $rate, $date, $employee_id);`;
    const params = {
        $hours: timesheet.hours,
        $rate: timesheet.rate,
        $date: timesheet.date,
        $employee_id: req.params.employeeId
    }
    db.run(sql, params, function(err) {
        if (err) {
            next(err);
        } else {
            db.get(`SELECT * FROM Timesheet WHERE id = ${this.lastID}`, (err, row) => {
                if (err) {
                    next(err);
                } else {
                    res.status(201).json({ timesheet: row })
                }
            })
        }
    });
});

timesheetRouter.param('timesheetId', (req,res,next,timesheetId) => {
    db.get(`SELECT * FROM Timesheet WHERE id = ${timesheetId};`, (err,row) => {
        if (err) {
            next(err);
        } else if (!row) {
            res.status(404).send();
        } else {
            req.employee = row;
            next();
        }
    })
});

timesheetRouter.put('/:timesheetId', checkRequirements, (req,res,next) => {
    const timesheet = req.body.timesheet;
    const sql = `UPDATE Timesheet SET hours = $hours, rate = $rate, date = $date, employee_id = $employee_id WHERE Timesheet.id = $id;`;
    const params = {
        $id: req.params.timesheetId,
        $hours: timesheet.hours,
        $rate: timesheet.rate,
        $date: timesheet.date,
        $employee_id: req.params.employeeId
    }
    db.run(sql, params, function(err) {
        if (err) {
            next(err);
        } else {
            db.get(`SELECT * FROM Timesheet WHERE id = ${req.params.timesheetId}`, (err, row) => {
                if (err) {
                    next(err);
                } else {
                    res.status(200).json({ timesheet: row })
                }
            })
        }
    });
});

timesheetRouter.delete('/:timesheetId', (req,res,next) => {
    db.run(`DELETE FROM Issue WHERE id = ${req.params.timesheetId} AND employee_id = ${req.params.employeeId};`, function(err) {
        if (err) {
            next(err);
        } else {
            res.sendStatus(204);
        }
    })
});

module.exports = timesheetRouter;