import Router from '@koa/router';
import { router as swaggerRouter } from './swagger.mjs';
import { router as badgesRouter } from './badges.mjs';
import { mainRouter as badgesMainRouter } from './badges.mjs';

export const router = new Router();

router.use(swaggerRouter.routes()).use(swaggerRouter.allowedMethods());
router.use('/api', badgesRouter.routes(), badgesRouter.allowedMethods());
router.use('/api', badgesMainRouter.routes(), badgesRouter.allowedMethods());
