const express = require('express');
const employeeRouter = require('./employee');
const menuRouter = require('./menu');

apiRouter = express.Router();
apiRouter.use('/menus', menuRouter);
apiRouter.use('/employees', employeeRouter)

module.exports = apiRouter;
