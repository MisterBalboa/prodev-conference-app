import { trimProperty } from '../strings.mjs';
import Router from '@koa/router';
import httpRequest from '../http_client.mjs';

export const router = new Router({
  prefix: '/events/:eventId/attendees',
});

router.get('/', async ctx => {
  const { eventId } = ctx.params;
  let v = await ctx.validator(ctx.params, {
    eventId: 'required|integer',
  });
  let fails = await v.fails();
  if (fails) {
    ctx.status = 400;
    return ctx.body = {
      code: 'INVALID_PARAMETER',
      message: 'Could not find that event.',
      errors: v.errors,
    };
  }

  /************************************************/
  // TODO: CALL TO CONFERENCE SERVICE FOR attendees
  /************************************************/
  // const { rows } = await pool.query(`
  //   SELECT p.id, p.email, p.name, p.company_name AS "companyName", p.created
  //   FROM attendees p
  //   JOIN events e ON (p.event_id = e.id)
  //   JOIN accounts a ON (e.account_id = a.id)
  //   WHERE a.id = $1
  //   AND e.id = $2
  // `, [ctx.claims.id, eventId])
  const rows = []
  ctx.body = rows;
});

router.post('/', async ctx => {
  trimProperty(ctx.request.body, 'name');
  trimProperty(ctx.request.body, 'email');
  trimProperty(ctx.request.body, 'companyName');
  let v = await ctx.validator(ctx.request.body, {
    name: 'required|minLength:1|maxLength:100',
    email: 'required|email|maxLength:100',
    companyName: 'required|minLength:1|maxLength:100',
  });
  let fails = await v.fails();
  if (fails) {
    ctx.status = 400;
    return ctx.body = {
      code: 'INVALID_PARAMETER',
      message: 'Could not create a proposal because at least one of the values is bad.',
      errors: v.errors,
    };
  }

  const { eventId } = ctx.params;
  v = await ctx.validator(ctx.params, {
    eventId: 'required|integer',
  });
  fails = await v.fails();
  if (fails) {
    ctx.status = 400;
    return ctx.body = {
      code: 'INVALID_PARAMETER',
      message: 'Could not create a proposal because at least one of the values is bad.',
      errors: v.errors,
    };
  }

  const accountId = ctx.claims.id;

  const { email, name, companyName } = ctx.request.body;

  const options = {
    hostname: 'conference',
    port: '80',
    path: '/api/events/' + eventId + '/attendees/',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  }

  const attendeesRows = await httpRequest(options, { name, email, companyName, accountId });

  console.log('attendees rows: ', attendeesRows);

  if (attendeesRows.length === 0) {
    ctx.status = 404;
    return ctx.body = {
      code: 'INVALID_PARAMETER',
      message: 'Could not find an event with that id to add an attendee to'
    };
  }

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
