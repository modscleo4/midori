import { Router as RouterWrapper } from '../../lib/Router.js';

import Oauth2Handler from '../handler/Oauth2Handler.js';
import BinHandler from '../handler/BinHandler.js';
import BinByIdHandler from '../handler/BinByIdHandler.js';

import AuthBearerMiddleware from '../middleware/AuthBearerMiddleware.js';

const Router = new RouterWrapper();

Router.post('/oauth/token', Oauth2Handler);

Router.group('/bin', () => {
    Router.get('/', BinHandler);
    Router.post('/', BinHandler, [AuthBearerMiddleware]);

    Router.group('/{id}', () => {
        Router.get('/', BinByIdHandler);
        Router.put('/', BinByIdHandler, [AuthBearerMiddleware]);
        Router.patch('/', BinByIdHandler, [AuthBearerMiddleware]);
        Router.delete('/', BinByIdHandler, [AuthBearerMiddleware]);
    });
});

Router.usePublicPath('./public');

export default Router;
