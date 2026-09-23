import http from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import path from 'node:path';
const root=path.resolve(process.argv[2]||'.'),port=Number(process.env.PORT||4173);
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.svg':'image/svg+xml'};
const server=http.createServer(async(req,res)=>{
 try{
 if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);res.end();return;}
 const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
 if(pathname.includes('\0'))throw Error();
 const file=path.resolve(root,'.'+pathname+(pathname.endsWith('/')?'index.html':''));
 if(!file.startsWith(root+path.sep))throw Error();
 // Expose runtime files only, never developer scripts or tests.
 const rel=path.relative(root,file).replaceAll('\\','/');
 if(!(rel==='index.html'||rel.startsWith('src/')||rel.startsWith('public/')))throw Error();
 if(!(await stat(file)).isFile())throw Error();
 res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','X-Content-Type-Options':'nosniff','Cache-Control':'no-store','Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'"});
 res.end(req.method==='HEAD'?undefined:await readFile(file));
 }catch{res.writeHead(404,{'Content-Type':'text/plain'});res.end('Not found');}
});
server.on('error',e=>{console.error(e.message);process.exitCode=1;});
server.listen(port,'127.0.0.1',()=>console.log(`ProfessorGito: http://127.0.0.1:${port} (${root})`));
