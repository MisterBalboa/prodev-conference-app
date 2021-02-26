import Router from '@koa/router';
import { authorize } from '../security.mjs';
import { trimProperty } from '../strings.mjs';
import httpRequest from '../http_client.mjs';

async function selectAll() {
  const options = {
    hostname: 'conference',
    port: '80',
    path: '/api/locations',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  }

  try {
    const response = await httpRequest(options);
    return response;
  } catch (err) {
    console.log('Unexpected network error', err);
    return [];
  }
}

export const router = new Router({
  prefix: '/locations',
});

router.use(authorize);

router.get('/', async ctx => {
  const rows = await selectAll();
  ctx.status = 201;
  ctx.body = rows;
});

router.post('/', async ctx => {
  trimProperty(ctx.request.body, 'name');
  trimProperty(ctx.request.body, 'city');
  trimProperty(ctx.request.body, 'state');
  const v = await ctx.validator(ctx.request.body, {
    name: 'required|minLength:1',
    city: 'required|minLength:1',
    state: 'required|minLength:2|maxLength:2',
    roomCount: 'required|integer|min:1',
    maximumVendorCount: 'required|integer|min:1',
  });
  const fails = await v.fails();
  if (fails) {
    ctx.status = 400;
    return ctx.body = {
      code: 'INVALID_PARAMETER',
      message: 'Could not create a location because at least one of the values is bad.',
      errors: v.errors,
    };
  }

  try {
    let { name, city, state, maximumVendorCount, roomCount } = ctx.request.body;
    const options = {
      hostname: 'conference',
      port: '80',
      path: '/api/locations',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }
    const response = await httpRequest(options, { name, city, state, roomCount, maximumVendorCount });
    console.log('post locations response', response);
  } catch (e) {
    ctx.status = 400;
    return ctx.body = {
      code: 'INVALID_PARAMETER',
      message: 'Could not create that location because it is not a unique name.'
    }
  }

  console.log('after creation');
  const rows = await selectAll();
  console.log('selecting rows', rows);
  ctx.status = 201;
  ctx.body = rows;
});
