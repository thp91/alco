import { json } from '../server/http.js';
import { cookieExpire } from '../server/session.js';

export function POST() {
  return json({ ok: true }, 200, { 'Set-Cookie': cookieExpire() });
}
