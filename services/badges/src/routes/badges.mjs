import { authorize, identify } from '../security.mjs';
import { pool } from '../db/index.mjs';
import qrcode from 'qrcode';
import Router from '@koa/router';

export const router = new Router({
  prefix: '/events/:eventId/badges',
});

export const mainRouter = new Router({
  prefix: '/badges',
});

mainRouter.post('/', async ctx => {
  console.log('badges route');
  ctx.status = 200;

  const { rows } = await pool.query(`
    INSERT INTO badges VALUES (2, 'antonio@badges.com', 'antonio', 'booz', NULL, 3);
  `)
  return ctx.body = 'post create badge';
});

// router.use(authorize);
router.use(identify);

router.get('/', async ctx => {
  const { eventId } = ctx.params;
  const { rows } = await pool.query(`
    SELECT b.id, b.email, b.name, b.company_name AS "companyName", b.role
    FROM badges b
    JOIN events e ON (b.event_id = e.id)
    JOIN accounts a ON (e.account_id = a.id)
    WHERE a.id = $1
    AND e.id = $2
  `, [ctx.claims.id, eventId])
  ctx.body = rows.map(x => ({
    name: x.name,
    companyName: x.companyName,
    role: x.role,
  }));
  for (let item of ctx.body) {
    item.qrcode = await qrcode.toString(`${item.id}|${item.name}`);
  }
});
