import { onRequest } from '../functions/api/[[path]].js';
export default {
  async fetch(request, env, ctx) {
    const { pathname } = new URL(request.url);
    if (pathname.startsWith('/api/')) return onRequest({ request, env, ctx });
    if (pathname === '/store' || pathname.startsWith('/store/')) { const u = new URL(request.url); u.pathname = '/store/'; return env.ASSETS.fetch(new Request(u, request)); }
    return env.ASSETS.fetch(request);
  }
};
