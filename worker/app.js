import { page } from './page.js';
import { artwork } from './artwork.js';
const seeds=[
['elden-ring','Elden Ring','RPG','PC · PlayStation · Xbox',2022,9.6,'Explora las Tierras Intermedias y forja tu camino en un mundo de fantasía donde cada victoria cuenta.','1245620'],
['hollow-knight','Hollow Knight','Indie','PC · Switch · PlayStation',2017,9.4,'Desciende a Hallownest, un reino dibujado a mano lleno de criaturas misteriosas, caminos secretos y combates precisos.','367520'],
['cyberpunk','Cyberpunk 2077','RPG','PC · PlayStation · Xbox',2020,9.0,'Entra en Night City como V, un mercenario que busca un implante capaz de abrir las puertas a la inmortalidad.','1091500'],
['hades','Hades','Acción','PC · Switch · PlayStation',2020,9.5,'Desafía al dios de los muertos y escapa del inframundo en una aventura donde cada intento cuenta una nueva historia.','1145360'],
['red-dead','Red Dead Redemption 2','Aventura','PC · PlayStation · Xbox',2019,9.7,'Vive los últimos días del salvaje oeste junto a Arthur Morgan y una banda que lucha por encontrar su lugar.','1174180'],
['stardew','Stardew Valley','Simulación','PC · Switch · Móvil',2016,9.3,'Transforma una granja olvidada en tu nuevo hogar: cultiva, explora minas y conoce a los vecinos de Pelican Town.','413150'],
['baldurs','Baldur’s Gate 3','RPG','PC · PlayStation · Xbox',2023,9.8,'Reúne a tu grupo y descubre una aventura de decisiones, amistad y magia inspirada en Dungeons & Dragons.','1086940'],
['portal','Portal 2','Puzles','PC · PlayStation · Xbox',2011,9.6,'Piensa con portales. Resuelve ingeniosos desafíos en las instalaciones de Aperture Science bajo la mirada de GLaDOS.','620']];
const json=(v,status=200,headers={})=>new Response(JSON.stringify(v),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store',...headers}});
const hash=async s=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s)))).map(x=>x.toString(16).padStart(2,'0')).join('');
const cookie=req=>req.headers.get('Cookie')?.match(/(?:^|; )pv_session=([^;]+)/)?.[1];
async function auth(req,db){const token=cookie(req);return token?!!await db.prepare('SELECT token FROM sessions WHERE token=? AND expires>?').bind(await hash(token),Date.now()).first():false;}
export default {async fetch(req,env){try{
 const u=new URL(req.url),p=u.pathname,db=env.DB;
 if(p==='/assets/worlds.png')return new Response(Uint8Array.from(atob(artwork),c=>c.charCodeAt(0)),{headers:{'Content-Type':'image/png','Cache-Control':'public, max-age=86400'}});
 if(p==='/api/login'&&req.method==='POST'){
  if((await req.clone().text()).length>4096)return json({error:'Petición demasiado grande'},413);
  const f=await req.formData();
  if(f.get('username')!=='alex'||await hash(String(f.get('password')||''))!=='a508320090f4420fb0a1be188be3b73193f42d42a9d0e613d2adc4e7ad305d62')return json({error:'Usuario o contraseña incorrectos'},401);
  const token=crypto.randomUUID()+crypto.randomUUID();await db.prepare('DELETE FROM sessions WHERE expires<?').bind(Date.now()).run();await db.prepare('INSERT INTO sessions(token,expires) VALUES (?,?)').bind(await hash(token),Date.now()+7200000).run();
  return json({ok:true,user:'Alex',redirect:'/'},200,{'Set-Cookie':'pv_session='+token+'; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=7200'});
 }
 if(p==='/api/session')return json({authenticated:await auth(req,db)});
 if(p==='/api/logout'&&req.method==='POST'){if(cookie(req))await db.prepare('DELETE FROM sessions WHERE token=?').bind(await hash(cookie(req))).run();return json({ok:true},200,{'Set-Cookie':'pv_session=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0'});}
 if(p==='/api/games'&&req.method==='GET'){
  if(!await db.prepare("SELECT value FROM app_state WHERE key='seeded'").first())await db.batch([...seeds.map(g=>db.prepare('INSERT OR IGNORE INTO games(id,title,genre,platform,year,rating,description,steam) VALUES (?,?,?,?,?,?,?,?)').bind(...g)),db.prepare("INSERT OR IGNORE INTO app_state(key,value) VALUES ('seeded','1')")]);
  return json({games:(await db.prepare('SELECT * FROM games ORDER BY rowid').all()).results});
 }
 if(/^\/api\/games(?:\/[^/]+)?$/.test(p)&&['POST','PUT','DELETE'].includes(req.method)){
  if(!await auth(req,db))return json({error:'Inicia sesión para gestionar el catálogo'},401);
  if(req.headers.get('Origin')!==u.origin)return json({error:'Origen no permitido'},403);
  const id=p.split('/')[3];
  if(req.method==='DELETE'){if(!id)return json({error:'Falta el identificador'},400);const r=await db.prepare('DELETE FROM games WHERE id=?').bind(id).run();return r.meta.changes?json({ok:true}):json({error:'Juego no encontrado'},404);}
  if((await req.clone().text()).length>8000)return json({error:'Petición demasiado grande'},413);
  let g;try{g=await req.json();}catch{return json({error:'JSON no válido'},400);}
  if(!g||typeof g.title!=='string'||g.title.trim().length<2||g.title.length>100||typeof g.description!=='string'||g.description.trim().length<10||g.description.length>2000||typeof g.platform!=='string'||!g.platform.trim()||g.platform.length>100||!['RPG','Indie','Acción','Aventura','Simulación','Puzles'].includes(g.genre)||!Number.isInteger(Number(g.year))||g.year<1970||g.year>2100||!Number.isFinite(Number(g.rating))||g.rating<0||g.rating>10||!/^\d{0,12}$/.test(g.steam||''))return json({error:'Revisa el título, descripción, año, género y puntuación (0–10).'},400);
  const vals=[g.title.trim(),g.genre,g.platform.trim(),Number(g.year),Number(g.rating),g.description.trim(),g.steam||''];
  if(req.method==='POST'){await db.prepare('INSERT INTO games(title,genre,platform,year,rating,description,steam,id) VALUES (?,?,?,?,?,?,?,?)').bind(...vals,crypto.randomUUID()).run();return json({ok:true},201);}
  const r=await db.prepare('UPDATE games SET title=?,genre=?,platform=?,year=?,rating=?,description=?,steam=? WHERE id=?').bind(...vals,id||'').run();return r.meta.changes?json({ok:true}):json({error:'Juego no encontrado'},404);
 }
 if(p.startsWith('/api/'))return json({error:'Ruta no encontrada'},404);
 if(!['/','/login'].includes(p))return new Response('Página no encontrada',{status:404});
 return new Response(page,{headers:{'Content-Type':'text/html; charset=utf-8','X-Content-Type-Options':'nosniff','Referrer-Policy':'strict-origin-when-cross-origin','Content-Security-Policy':"default-src 'self'; img-src 'self' https://cdn.akamai.steamstatic.com data:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; script-src 'self' 'unsafe-inline'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'"}});
 }catch(e){console.error(e.message);return json({error:'No se pudo completar la operación. Inténtalo de nuevo.'},500);}}};
