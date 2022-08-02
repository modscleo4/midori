import IndexHandler from '../handler/IndexHandler.js';
import { Router as RouterWrapper } from '../../lib/Router.js'
import TestMiddleware from '../middleware/TestMiddleware.js';

const Router = new RouterWrapper();

Router.group('/api/v1', () => {
    Router.get('/', IndexHandler, [ TestMiddleware ]);
});

Router.usePublicPath('./public');

export default Router;
