import bodyParser from 'koa-body';
import cors from '@koa/cors';
import dotenv from 'dotenv';
import Koa from 'koa';
import niv from 'node-input-validator';
import { router } from './routes/badges.mjs';

async function bearer(ctx, next) {
  const auth = ctx.get('Authorization');
  if (auth && auth.startsWith('Bearer ')) {
    let token = auth.substring(7);
    try {
      ctx.claims = verifyToken(token);
    } catch (e) {
      console.error('INVALID TOKEN!')
      console.error(decodeToken(token));
      console.error(e);
    }
  }
  await next();
}

dotenv.config();

const port = Number.parseInt(process.env['PORT']);
if (Number.isNaN(port)) {
  console.error('ERROR: Missing PORT environment variable.');
  process.exit(1);
}

const app = new Koa();
app.use(cors({
  allowHeaders: ['Authorization', 'Content-Type']
}));

app.use(niv.koa());
app.use(bearer);

app.use(bodyParser({ multipart: true }));

app.use(router.routes());

app.listen(port, () => console.log(`Accepting connections on ${port}`));

