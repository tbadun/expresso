const express = require('express');
const sqlite3 = require('sqlite3');
const timesheetRouter = require('./timesheet');
const bodyParser = require('body-parser');

const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite')

employeeRouter = express.Router({mergeParams: true});
employeeRouter.use(bodyParser.json());
employeeRouter.use('/:employeeId/timesheets', timesheetRouter);

employeeRouter.get('/', (req,res,next) => {
    db.all("SELECT * FROM Employee WHERE is_current_employee = 1;", (err,rows) => {
        if (err) {
            next(err);
        } else {
            res.status(200).json({employees: rows})
        }
    })
});

const checkRequirements = (req,res,next) => {
    const employee = req.body.employee;
    if (!employee.name || !employee.position || !employee.wage) {
        res.sendStatus(400);
    } else {
        next();
    }
}

employeeRouter.post('/', checkRequirements, (req,res,next) => {
    const employee = req.body.employee;
    const sql = `INSERT INTO Employee (name, position, wage, is_current_employee) VALUES ($name, $position, $wage, $is_current_employee);`;
    const params = {
        $name: employee.name,
        $position: employee.position,
        $wage: employee.wage,
        $is_current_employee: employee.isCurrentEmployee === 0 ? 0 : 1
    }
    db.run(sql, params, function(err) {
        if (err) {
            next(err);
        } else {
            db.get(`SELECT * FROM Employee WHERE id = ${this.lastID}`, (err, row) => {
                if (err) {
                    next(err);
                } else {
                    res.status(201).json({ employee: row })
                }
            })
        }
    });
});

employeeRouter.param('employeeId', (req,res,next,employeeId) => {
    db.get(`SELECT * FROM Employee WHERE id = ${employeeId};`, (err,row) => {
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

employeeRouter.get('/:employeeId', (req,res,next) => {
    res.status(200).send({employee: req.employee});
});

employeeRouter.put('/:employeeId', checkRequirements, (req,res,next) => {
    const employee = req.body.employee;
    employee['id'] = req.params.employeeId
    const sql = `UPDATE Employee SET name = $name, position = $position, wage = $wage, is_current_employee = $is_current_employee WHERE Employee.id = $id;`;
    const params = {
        $id: employee.id,
        $name: employee.name,
        $position: employee.position,
        $wage: employee.wage,
        $is_current_employee: employee.isCurrentEmployee === 0 ? 0 : 1
    }
    db.run(sql, params, function(err) {
        if (err) {
            next(err);
        } else {
            db.get(`SELECT * FROM Employee WHERE id = ${employee.id}`, (err, row) => {
                if (err) {
                    next(err);
                } else {
                    res.status(200).json({ employee: row })
                }
            })
        }
    });
});

employeeRouter.delete('/:employeeId', (req,res,next) => {
    const id = req.params.employeeId;
    const sql = `UPDATE Employee SET is_current_employee = 0 WHERE Employee.id = ${id};`;
    db.run(sql, function(err) {
        if (err) {
            next(err);
        } else {
            db.get(`SELECT * FROM Employee WHERE id = ${id}`, (err, row) => {
                if (err) {
                    next(err);
                } else {
                    res.status(200).json({ employee: row })
                }
            })
        }
    });
});

module.exports = employeeRouter;