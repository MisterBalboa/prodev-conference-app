import { authorize } from '../security.mjs';
import { trimProperty } from '../strings.mjs';
import httpRequest from '../http_client.mjs';
import Router from '@koa/router';

const STATUSES = new Map();
STATUSES.set(1, 'SUBMITTED');
STATUSES.set(2, 'APPROVED');
STATUSES.set(3, 'REJECTED');

export const router = new Router({
  prefix: '/events/:eventId/presentations',
});

router.use(authorize);

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
      message: 'Could not create a proposal because at least one of the values is bad.',
      errors: v.errors,
    };
  }

  const options = {
    hostname: 'conference',
    port: '80',
    path: '/api/events/' + eventId + '/presentations',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  }

  const rows = await httpRequest(options);

  const aggregatedData = rows.map(function(p) {
    return {
      ...p,
      status: STATUSES.get(p.statusId),
      email: ctx.claims.email,
      name: ctx.claims.name
    }
  });

  console.log('aggregated presentations', aggregatedData);

  ctx.body = aggregatedData;
});

router.post('/', async ctx => {
  trimProperty(ctx.request.body, 'email');
  trimProperty(ctx.request.body, 'presenterName');
  trimProperty(ctx.request.body, 'companyName');
  trimProperty(ctx.request.body, 'title');
  trimProperty(ctx.request.body, 'synopsis');
  let v = await ctx.validator(ctx.request.body, {
    presenterName: 'required|minLength:1|maxLength:100',
    email: 'required|email|maxLength:100',
    companyName: 'required|minLength:1|maxLength:100',
    title: 'required|minLength:8|maxLength:100',
    synopsis: 'required|minLength:50',
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

  const { email, presenterName, companyName, title, synopsis } = ctx.request.body;

  const options = {
    hostname: 'conference',
    port: '80',
    path: '/api/events/' + eventId + '/presentations',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  }

  const data = { email, presenterName, companyName, title, synopsis }

  const record = await httpRequest(options, data);

  const presentationRows = [ record ];
  if (presentationRows.length === 0) {
    ctx.status = 404;
    return ctx.body = {
      code: 'INVALID_PARAMETER',
      message: 'Could not find an event with that id to add an attendee to'
    };
  }

  const { id, statusId } = presentationRows[0];
  ctx.status = 201;
  ctx.body = {
    id,
    email,
    presenterName,
    companyName,
    title,
    synopsis,
    status: STATUSES.get(statusId),
  };
});

router.put('/:id/approved', async ctx => { const { eventId } = ctx.params; let v = await ctx.validator(ctx.params, {
    eventId: 'required|integer',
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

  const { id } = ctx.params;

  /*******************************************************/
  // TODO: PUT presentations request to conference service 
  /*******************************************************/
  // const { rows } = await pool.query(`
  //   UPDATE presentations
  //   SET status_id = 2
  //   WHERE id = $1
  //   AND status_id IN (1, 2)
  //   AND event_id IN (SELECT e.id FROM events e WHERE e.account_id = $2)
  //   RETURNING email, presenter_name AS "presenterName", company_name AS "companyName", title, synopsis
  // `, [id, ctx.claims.id]);
  const rows = [];
  if (rows.length === 0) {
    ctx.status = 404;
    return ctx.body = {
      code: 'INVALID_IDENTIFIER',
      message: 'Could not approve that presentation.'
    };
  }

  const { email, presenterName, companyName, title, synopsis } = rows[0];

  /*************************************************/
  // TODO: POST badge request to badges service 
  /*************************************************/
  // failing on conflict - event_id
  // await pool.query(`
  //   INSERT INTO badges (email, name, company_name, role, event_id)
  //   VALUES ($1, $2, $3, 'SPEAKER', $4)
  //   ON CONFLICT (email)
  //   DO
  //   UPDATE SET role = 'SPEAKER'
  // `, [email, presenterName, companyName, eventId]);

  ctx.body = {
    id: '',
    email: '',
    presenterName: '',
    companyName: '',
    title: '',
    synopsis: '',
    status: undefined
  };
});

router.put('/:id/rejected', async ctx => {
  const { id } = ctx.params;

  /******************************************************/
  // TODO: PUT presentation request to conference service 
  /******************************************************/
  // const { rows } = await pool.query(`
  //   UPDATE presentations
  //   SET status_id = 3
  //   WHERE id = $1
  //   AND status_id IN (1, 3)
  //   AND event_id IN (SELECT e.id FROM events e WHERE e.account_id = $2)
  //   RETURNING email, presenter_name AS "presenterName", company_name AS "companyName", title, synopsis
  // `, [id, ctx.claims.id]);
  const rows = [];
  if (rows.length === 0) {
    ctx.status = 404;
    return ctx.body = {
      code: 'INVALID_IDENTIFIER',
      message: 'Could not reject that presentation.'
    };
  }

  // const { email, presenterName, companyName, title, synopsis } = rows[0];
  ctx.body = {
    id: '',
    email: '',
    presenterName: '',
    companyName: '',
    title: '',
    synopsis: '',
    status: undefined
  };
});
