const express = require('express');
const sqlite3 = require('sqlite3');
const bodyParser = require('body-parser');

const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite')

menuitemRouter = express.Router({mergeParams: true});
menuitemRouter.use(bodyParser.json());

menuitemRouter.get('/', (req,res,next) => {
    db.all(`SELECT * FROM MenuItem WHERE menu_id = ${req.params.menuId};`, (err,rows) => {
        if (err) {
            next(err);
        } else {
            res.status(200).json({menuItems: rows})
        }
    })
});

const checkRequirements = (req,res,next) => {
    const menuItem = req.body.menuItem;
    if (!menuItem.name || !menuItem.description || !menuItem.inventory || !menuItem.price) {
        res.sendStatus(400);
    } else {
        next();
    }
}

menuitemRouter.post('/', checkRequirements, (req,res,next) => {
    const menuItem= req.body.menuItem
    const sql = `INSERT INTO MenuItem (name, description, inventory, price, menu_id) VALUES ($name, $description, $inventory, $price, $menu_id);`;
    const params = {
        $name: menuItem.name,
        $description: menuItem.description,
        $inventory: menuItem.inventory,
        $price: menuItem.price,
        $menu_id: req.params.menuId
    }
    db.run(sql, params, function(err) {
        if (err) {
            next(err);
        } else {
            db.get(`SELECT * FROM MenuItem WHERE id = ${this.lastID}`, (err, row) => {
                if (err) {
                    next(err);
                } else {
                    res.status(201).json({ menuItem: row })
                }
            })
        }
    });
});

menuitemRouter.param('menuItemId', (req,res,next,menuItemId) => {
    db.get(`SELECT * FROM MenuItem WHERE id = ${menuItemId};`, (err,row) => {
        if (err) {
            next(err);
        } else if (!row) {
            res.status(404).send();
        } else {
            req.menuItem = row;
            next();
        }
    })
});

menuitemRouter.put('/:menuItemId', checkRequirements, (req,res,next) => {
    const menuItem = req.body.menuItem;
    const sql = `UPDATE MenuItem SET name = $name, description = $description, inventory = $inventory, price = $price, menu_id = $menu_id WHERE MenuItem.id = $id;`;
    const params = {
        $id: req.params.menuItemId,
        $name: menuItem.name,
        $description: menuItem.description,
        $inventory: menuItem.inventory,
        $price: menuItem.price,
        $menu_id: req.params.menuId
    }
    db.run(sql, params, function(err) {
        if (err) {
            next(err);
        } else {
            db.get(`SELECT * FROM MenuItem WHERE id = ${req.params.menuItemId}`, (err, row) => {
                if (err) {
                    next(err);
                } else {
                    res.status(200).json({ menuItem: row })
                }
            })
        }
    });
});

menuitemRouter.delete('/:menuItemId', (req,res,next) => {
    db.run(`DELETE FROM MenuItem WHERE id = ${req.params.menuItemId};`, function(err) {
        if (err) {
            next(err);
        } else {
            res.status(204).json(req.menuItem);
        }
    })
});

module.exports = menuitemRouter;