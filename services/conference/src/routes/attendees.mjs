import { pool } from '../db/index.mjs';
import { trimProperty } from '../strings.mjs';
import Router from '@koa/router';

export const router = new Router({
  prefix: '/events/:eventId/attendees',
});

router.get('/', async ctx => {
  const { eventId } = ctx.params;
  const { rows } = await pool.query(`
    SELECT p.id, p.email, p.name, p.company_name AS "companyName", p.created
    FROM attendees p
    JOIN events e ON (p.event_id = e.id)
    JOIN accounts a ON (e.account_id = a.id)
    WHERE a.id = $1
    AND e.id = $2
  `, [ctx.claims.id, eventId])
  ctx.body = rows;
});

router.post('/', async ctx => {
  const { eventId } = ctx.params;
  const accountId = ctx.claims.id;
  const { email, name, companyName } = ctx.request.body;
  const { rows: attendeesRows } = await pool.query(`
    INSERT INTO attendees (name, email, company_name, event_id)
    SELECT $1, $2, $3, e.id
    FROM events e
    JOIN accounts a ON (e.account_id = a.id) 
    WHERE e.id = $4
    AND a.id = $5
    RETURNING id, created
  `, [email, name, companyName, eventId, accountId]);

  if (attendeesRows.length === 0) {
    ctx.status = 404;
    return ctx.body = {
      code: 'INVALID_PARAMETER',
      message: 'Could not find an event with that id to add an attendee to'
    };
  }

  // This is failing with event_id -- there is no unique or exclusion constraint matching the ON CONFLICT specification --
  // ON CONFLICT (email, event_id)
  await pool.query(`
    INSERT INTO badges (email, name, company_name, role, event_id)
    VALUES ($1, $2, $3, '', $4)
    ON CONFLICT (email)
    DO NOTHING
  `, [email, name, companyName, eventId]);

  const { id, created } = attendeesRows[0];
  ctx.status = 201;
  ctx.body = {
    id,
    email,
    name,
    companyName,
    created,
  };
});
