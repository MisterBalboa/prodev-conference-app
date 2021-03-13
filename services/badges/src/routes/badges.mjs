import { pool } from '../db/index.mjs';
import qrcode from 'qrcode';
import Router from '@koa/router';

export const router = new Router({
  prefix: '/events/:eventId/badges',
});

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

router.post('/', async ctx => {
  try {
    const { eventId } = ctx.params;
    const { email, name, companyName } = ctx.request.body; 
    const { rows } = await pool.query(`
      INSERT INTO badges(email, name, company_name, event_id) VALUES ($1, $2, $3, $4);
    `, [email, name, companyName, eventId]);
    ctx.status = 201;
    return ctx.body = 'badges created successfully';
  } catch (err) {
    console.log('something went wrong in badges db', err);  
  }
});

