const path = require('path');
const fs = require('fs');
const _ = require('lodash');
const Router = require('koa-router');

const { ValidationError } = require('../../common/errors');

// Controllers
const controllersPath = '../../controllers';
const controllersDir = path.join(__dirname, controllersPath);

const controllers = [];
getAllControllersInFolder(controllersDir);

function getAllControllersInFolder(dir) {
  const files = fs.readdirSync(dir);
  files.forEach((file) => {
    const controllerPath = path.join(dir, file);
    if (fs.lstatSync(controllerPath).isDirectory()) {
      getAllControllersInFolder(controllerPath);
    } else {
      const controller = require(controllerPath);
      controllers.push(controller);
    }
  });
}

function getActionsFromController(controller) {
  const actions = {};
  const { prototype } = controller.constructor || [];

  Object.getOwnPropertyNames(prototype).forEach((key) => {
    if (key === 'constructor') {
      return;
    }

    actions[key] = prototype[key];
  });

  return actions;
}

function buildControllerRouter(controller) {
  const router = new Router();
  const ctrlPath = controller.path;
  const ctrlRoutes = controller.routes;
  const { beforeAction, afterAction } = controller.constructor.prototype;
  const actions = getActionsFromController(controller);
  if (ctrlPath.charAt(0) !== '/') {
    throw new ValidationError(`controller path should start with /`);
  }
  ctrlRoutes.forEach((route) => {
    const { method, path, handler } = route;

    if (!router.methods.includes(method)) {
      throw new ValidationError(`Method ${method} is not supported`);
    }

    const routerArgs = [path, afterAction.bind(controller), beforeAction.bind(controller), actions[handler].bind(controller)];


    router[method.toLowerCase()](...routerArgs);
  });

  return [ctrlPath, router.routes()];
}

module.exports = () => {
  const routes = [];
  const router = new Router();
  controllers.forEach((Controller) => {
    const ctrlInstance = new Controller();
    const ctrlRoute = buildControllerRouter(ctrlInstance);
    routes.push(ctrlRoute);
  });

  routes.forEach((route) => {
    router.use(...route);
  });

  router.allowedMethods();
  return router.routes();
};
