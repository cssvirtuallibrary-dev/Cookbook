import crypto from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { config } from './config';
import type { Role } from './types';
const COOKIE = 'family_cookbook_session';
type Session = { role: Role; exp: number; v: string };
const b64 = (s: string) => Buffer.from(s).toString('base64url');
const unb64 = (s: string) => Buffer.from(s, 'base64url').toString('utf8');
function sign(payload: string) { return crypto.createHmac('sha256', config.sessionSecret()).update(payload).digest('base64url'); }
function safeEqual(a: string, b: string) { const x=Buffer.from(a), y=Buffer.from(b); return x.length === y.length && crypto.timingSafeEqual(x,y); }
export function pinRole(pin: string): Role | null { if (safeEqual(pin, config.adminPin())) return 'admin'; if (safeEqual(pin, config.familyPin())) return 'family'; return null; }
export function issue(role: Role) { const payload=b64(JSON.stringify({role, exp:Date.now()+30*86400000, v:config.sessionVersion()})); return `${payload}.${sign(payload)}`; }
export function session(request: NextRequest): Session | null { const raw=request.cookies.get(COOKIE)?.value; if (!raw) return null; const [payload, signature]=raw.split('.'); if (!payload || !signature || !safeEqual(sign(payload),signature)) return null; try { const data=JSON.parse(unb64(payload)) as Session; return data.exp>Date.now() && data.v===config.sessionVersion() ? data : null; } catch { return null; } }
export function requireRole(request: NextRequest, admin=false): Session { const s=session(request); if (!s || (admin && s.role!=='admin')) throw new Error(admin ? 'Admin PIN required.' : 'Family PIN required.'); return s; }
export function setSession(response: NextResponse, role: Role) { response.cookies.set(COOKIE, issue(role), {httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'strict',path:'/',maxAge:30*86400}); }
export function clearSession(response: NextResponse) { response.cookies.set(COOKIE,'',{httpOnly:true,path:'/',maxAge:0}); }
