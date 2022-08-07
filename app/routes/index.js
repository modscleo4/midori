import { Router as RouterWrapper } from 'apiframework/router';

import Oauth2Handler from '../handler/Oauth2Handler.js';
import BinHandler from '../handler/BinHandler.js';
import BinByIdHandler from '../handler/BinByIdHandler.js';

import AuthBearerMiddleware from '../middleware/AuthBearerMiddleware.js';
import { HTTPErrorMiddleware, ParseBodyMiddleware } from 'apiframework/middlewares';

const Router = new RouterWrapper();

/**
 * Routing
 *
 * Define your routes here
 * Use the Router.get(), Router.post(), Router.put(), Router.patch, Router.delete() methods to define your routes
 * Use the Router.group() method to group routes under a common prefix
 * Use the Router.usePublicPath() method to define a public path to serve static files from
 */

Router.pipeline([ParseBodyMiddleware, HTTPErrorMiddleware]);

Router.post('/oauth/token', Oauth2Handler).withName('oauth.token');

Router.group('/bin', () => {
    Router.get('/', BinHandler).withName('bin.list');
    Router.post('/', BinHandler, [AuthBearerMiddleware]).withName('bin.create');

    Router.group('/{id}', () => {
        Router.get('/', BinByIdHandler).withName('bin.get');
        Router.put('/', BinByIdHandler, [AuthBearerMiddleware]).withName('bin.update');
        Router.patch('/', BinByIdHandler, [AuthBearerMiddleware]).withName('bin.patch');
        Router.delete('/', BinByIdHandler, [AuthBearerMiddleware]).withName('bin.delete');
    });
});

Router.usePublicPath('./public');

export default Router;
