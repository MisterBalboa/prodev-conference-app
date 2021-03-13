import { pool } from '../db/index.mjs';
import { trimProperty } from '../strings.mjs';
import Router from '@koa/router';
import httpClient from '../httpClient.mjs';

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
  console.log('post attendees', ctx.request.body);
  const { eventId } = ctx.params;
  const { email, name, companyName } = ctx.request.body;

  const { id, created } = await pool.query(`
    INSERT INTO attendees (name, email, company_name, event_id)
    VALUES ($1, $2, $3, $4)
    RETURNING id, created
  `, [name, email, companyName, eventId]);

  const { rows: attendeesRows } = await pool.query(`
    SELECT id, created FROM attendees
    WHERE event_id = $1 
  `, [eventId]);

  console.log('attendees rows: ', attendeesRows);

  if (attendeesRows.length === 0) {
    ctx.status = 404;
    return ctx.body = {
      code: 'INVALID_PARAMETER',
      message: 'Could not find an event with that id to add an attendee to'
    };
  }

  ctx.status = 201;
  ctx.body = {
    id: eventId,
    email,
    name,
    companyName,
    created,
  };

  try {
    const options = {
      hostname: 'badges',
      port: '80',
      path: '/api/events/' + eventId +  '/badges',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }

    const data = {
      id: eventId,
      name, email,
      companyName
    };

    httpClient(options, data); 
  } catch (err) {
    console.log('call to badges failed', err);  
  }
});
