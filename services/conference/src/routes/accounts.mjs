import { pool } from '../db/index.mjs';
import Router from '@koa/router';
import bcrypt from 'bcryptjs';
import { signToken } from '../security.mjs';
import { trimProperty } from '../strings.mjs';

const DEFAULT_HASH = '$2a$10$QlWNohhjpbGuty6UnyeeJOeKY6dKbiaoFxeWdOoIUiNYaO/ZD2khW';

export const router = new Router({
  prefix: '/accounts',
});

router.post('new_account', '/', async ctx => {
  let { name, email, password } = ctx.request.body;
  email = email.toLowerCase();
  const hash = await bcrypt.hash(password || '', 8);
  try {
    const { rows } = await pool.query(`
      INSERT INTO accounts (name, email, hashed_password)
      VALUES ($1, $2, $3)
      RETURNING created, updated
    `, [name, email, hash]);
    const { created, updated } = rows[0];
    const token = signToken({ name, email, created, updated });
    ctx.status = 201;
    ctx.body = { token };
  } catch (e) {
    console.error(e);
    ctx.status = 400;
    ctx.body = {
      code: 'BAD_CREDENTIALS',
      message: 'Could not create an account with those credentials.',
    };
  }
});
