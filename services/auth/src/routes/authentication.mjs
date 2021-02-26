import { pool } from '../db/index.mjs';
import Router from '@koa/router';
import bcrypt from 'bcryptjs';
import { signToken, verifyToken, decodeToken, identify } from '../security.mjs';
import { trimProperty } from '../strings.mjs';

export const router = new Router({
  prefix: '/authentication',
});

router.post('/', async ctx => {
  let { token } = ctx.request.body;
  try {
    try {
      ctx.claims = await verifyToken(token);
      console.log('claims: ', ctx.claims);
      let { rows } = await pool.query(`
        SELECT id FROM accounts WHERE email = $1
      `, [ctx.claims.email]);

      console.log('rows: ', rows);

      if (rows.length === 1) {
        ctx.body = {
          id: rows[0].id,
          email: ctx.claims.email,
          name: ctx.claims.name
        };
        ctx.status = 200;
      } else {
        console.error('INVALID TOKEN!')
        ctx.status = 401;
      }
    } catch (e) {
      console.error('INVALID TOKEN!')
      console.error(decodeToken(token));
      console.error(e);
      ctx.status = 401;
    }
  } catch (e) {
    console.error(e);
    console.log('errr', e);
    ctx.status = 401; ctx.body = { code: 'BAD_CREDENTIALS',
      message: 'Could not create an account with those credentials.',
    };
  }
});

