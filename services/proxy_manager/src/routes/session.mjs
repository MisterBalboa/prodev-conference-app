import Router from '@koa/router';
import dotenv from 'dotenv';
import httpRequest from '../http_client.mjs';

dotenv.config();

const DEFAULT_HASH = '$2a$10$QlWNohhjpbGuty6UnyeeJOeKY6dKbiaoFxeWdOoIUiNYaO/ZD2khW';

const secret = process.env['JWT_SECRET']
if (secret === undefined || secret.length === 0) {
  console.error('ERROR: Missing JWT_SECRET environment variable.');
  process.exit(2);
}

export const router = new Router({
  prefix: '/session',
});

router.put('new_session', '/', async ctx => {
  let { email, password } = ctx.request.body;
  email = email.toLowerCase().trim();
  password = password.trim();

  const options = {
    hostname: 'auth',
    port: '80',
    path: '/api/session',
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    }
  }

  const response = await httpRequest(options, { email, password })
  if (response.good) {
    ctx.status = 201;
    ctx.body = { token: response.token };
  } else {
    ctx.status = 404;
    ctx.body = {
      code: 'BAD_CREDENTIALS',
      message: 'Could not authenticate with those credentials'
    };
  }
});
