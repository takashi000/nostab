import {setupWorker, rest} from 'msw';
import { storage } from '../lib/utils';
import { getUser, setUser } from './db';
import { NostrGenPubKey } from '../../Nostr/Nostr';

const handlers = [
  rest.get('/auth/me', (req, res, ctx) => {
    const user = getUser(req.headers.get('Authorization'));

    return res(ctx.delay(1000), ctx.json({ user }));
  }),
  rest.post('/auth/login', async (req, res, ctx) => {
    const parsedBody = (await req.json());
    const user = getUser(parsedBody.privkey);
    if ((user && (parsedBody.mode !== "nip07" && user.pubkey === parsedBody.pubkey && user.pubkey === NostrGenPubKey(parsedBody.privkey))) || 
          (user && parsedBody.mode === "nip07")) {
      return res(
        ctx.delay(1000),
        ctx.json({
          jwt: user.privkey,
          user,
        })
      );
    } else {
      return res(
        ctx.delay(1000),
        ctx.status(401),
        ctx.json({ message: 'Unauthorized' })
      );
    }
  }),
  rest.post('/auth/register', async (req, res, ctx) => {
    const parsedBody = (await req.json());
    const user = getUser(parsedBody?.privkey);
    if (!user && parsedBody) {
      const newUser = setUser(parsedBody);
      if (newUser) {
        return res(
          ctx.delay(1000),
          ctx.json({
            jwt: newUser.privkey,
            user: getUser(newUser.privkey),
          })
        );
      }
      return res(
        ctx.delay(1000),
        ctx.status(403),
        ctx.json({ message: 'Registration failed!' })
      );
    } else {
      return res(
        ctx.delay(1000),
        ctx.status(400),
        ctx.json({ message: 'The user already exists!' })
      );
    }
  }),
  rest.post('/auth/logout', (req, res, ctx) => {
    storage.clearToken();
    return res(ctx.delay(1000), ctx.json({ message: 'Logged out' }));
  }),
];

export const worker = setupWorker(...handlers);
