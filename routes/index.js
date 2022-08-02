import IndexHandler from '../handler/IndexHandler.js';
import Handler from '../lib/Handler.js';
import {RouterWrapper } from '../lib/Route.js'

const Router = new RouterWrapper();

Router.group('/api/v1', () => {
    Router.get('/', new IndexHandler());
});

export default Router.compile();
