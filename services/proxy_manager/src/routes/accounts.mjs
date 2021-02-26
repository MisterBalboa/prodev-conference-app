import http from 'http';
import Router from '@koa/router';
import axios from 'axios';
import { trimProperty } from '../strings.mjs';

export const router = new Router({
  prefix: '/accounts',
});

var postRequest = async function(options, data) {
  return new Promise(function(resolve, reject) {
    var result = '';
    const req = http.request(options, res => {
      res.on('data', chunk => {
        result += chunk;
      });

      res.on('end', endData => {
        return resolve(JSON.parse(result))
      });
    });

    req.write(JSON.stringify(data))
    req.end()
  });
}

router.post('new_account', '/', async ctx => {
  trimProperty(ctx.request.body, 'name');
  trimProperty(ctx.request.body, 'email');
  trimProperty(ctx.request.body, 'password');
  const v = await ctx.validator(ctx.request.body, {
    name: 'required|minLength:1',
    email: 'required|email',
    password: 'required|minLength:8',
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

  let { name, email, password } = ctx.request.body;
  email = email.toLowerCase();
  try {
    const options = {
      hostname: 'auth',
      port: '80',
      path: '/api/accounts',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }
    const data = { name, email, password };

    const response = await postRequest(options, data); 
    ctx.status = 201;
    ctx.body = { token: response.token };
  } catch (e) {
    console.error(e);
    ctx.status = 400;
    ctx.body = {
      code: 'BAD_CREDENTIALS',
      message: 'Could not create an account with those credentials.',
    };
  }
});
