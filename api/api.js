const express = require('express');
const employeeRouter = require('./employee');
const menuRouter = require('./menu');
const bodyParser = require('body-parser');

apiRouter = express.Router();


apiRouter.use(bodyParser.json());
apiRouter.use('/menus', menuRouter);
apiRouter.use('/employees', employeeRouter)

module.exports = apiRouter;
