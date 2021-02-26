import http from 'http';
import dotenv from 'dotenv';

dotenv.config();

var httpRequest = async function(options, data) {
  return new Promise(function(resolve, reject) {
    var result = '';
    const req = http.request(options, res => {
      res.on('data', chunk => {
        result += chunk;
      });

      res.on('end', endData => {
        return resolve(result)
      });
    });

    if (data) {
      req.write(JSON.stringify(data))
    }

    req.end()
  });
}

const secret = process.env['JWT_SECRET']
if (secret === undefined || secret.length === 0) {
  console.error('ERROR: Missing JWT_SECRET environment variable.');
  process.exit(2);
}

export async function authorize(ctx, next) {
  const auth = ctx.get('Authorization');
  console.log('auth type: ', typeof auth);
  console.log('auth: ', auth);
  if (auth === undefined) {
    ctx.status = 401;
    return ctx.body = {
      code: 'INVALID_TOKEN',
      message: 'The token provided is invalid.'
    }
  }

  if (auth && auth.startsWith('Bearer ')) {
    let token = auth.substring(7);
    try {
      const options = {
        hostname: 'auth',
        port: '80',
        path: '/api/authentication',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      }

      const response = await httpRequest(options, { token });
      ctx.claims = response
      await next();
    } catch (e) {
      console.error('INVALID TOKEN!')
      console.error(e);
    }

  } else {
    ctx.status = 401;
    return ctx.body = {
      code: 'INVALID_TOKEN',
      message: 'The token provided is invalid.'
    }
  }
}

