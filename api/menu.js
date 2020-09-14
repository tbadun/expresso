const express = require('express');
const sqlite3 = require('sqlite3');
const menuitemRouter = require('./menuitem');
const bodyParser = require('body-parser');

const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite')

menuRouter = express.Router({mergeParams: true});
menuRouter.use(bodyParser.json());
menuRouter.use('/:menuId/menu-items', menuitemRouter);

menuRouter.get('/', (req,res,next) => {
    db.all("SELECT * FROM Menu;", (err,rows) => {
        if (err) {
            next(err);
        } else {
            res.status(200).json({menus: rows})
        }
    })
});

const checkRequirements = (req,res,next) => {
    const menu = req.body.menu;
    if (!menu.title) {
        res.sendStatus(400);
    } else {
        next();
    }
}

menuRouter.post('/', checkRequirements, (req,res,next) => {
    const menu = req.body.menu;
    const sql = `INSERT INTO Menu (title) VALUES ("${menu.title}");`;
    db.run(sql, function(err) {
        if (err) {
            next(err);
        } else {
            db.get(`SELECT * FROM Menu WHERE id = ${this.lastID}`, (err, row) => {
                if (err) {
                    next(err);
                } else {
                    res.status(201).json({ menu: row })
                }
            })
        }
    });
});

menuRouter.param('menuId', (req,res,next,menuId) => {
    db.get(`SELECT * FROM Menu WHERE id = ${menuId};`, (err,row) => {
        if (err) {
            next(err);
        } else if (!row) {
            res.status(404).send();
        } else {
            req.menu = row;
            next();
        }
    })
});

menuRouter.get('/:menuId', (req,res,next) => {
    res.status(200).send({menu: req.menu});
});

menuRouter.put('/:menuId', checkRequirements, (req,res,next) => {
    const sql = `UPDATE Menu SET title = $title WHERE Menu.id = $id;`;
    const params = {
        $id: req.params.menuId,
        $title: req.body.menu.title
    }
    db.run(sql, params, function(err) {
        if (err) {
            next(err);
        } else {
            db.get(`SELECT * FROM Menu WHERE id = ${req.params.menuId}`, (err, row) => {
                if (err) {
                    next(err);
                } else {
                    res.status(200).json({ menu: row })
                }
            })
        }
    });
});

menuRouter.delete('/:menuId', (req,res,next) => {
    db.get(`SELECT * FROM MenuItem WHERE menu_id = ${req.params.menuId}`, (err,row) => {
        if (err) {
            res.status(400).send(err);
        } else if (!row) {
            db.run(`DELETE FROM Menu WHERE id = ${req.params.menuId};`, function(err) {
                if (err) {
                    next(err);
                } else {
                    res.status(204).json(req.menu);
                }
            })
        } else {
            res.status(400).send("Cannot delete menu is menu items still exist.")
        }
    })
});

module.exports = menuRouter;