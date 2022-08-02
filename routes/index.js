import IndexHandler from '../handler/IndexHandler.js';
import {RouterWrapper } from '../lib/Route.js'
import TestMiddleware from '../middleware/TestMiddleware.js';

const Router = new RouterWrapper();

Router.group('/api/v1', () => {
    Router.get('/', IndexHandler, [ TestMiddleware ]);
});

export default Router.compile();
