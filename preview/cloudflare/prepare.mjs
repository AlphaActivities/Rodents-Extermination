import {readFileSync,mkdirSync,writeFileSync,renameSync,copyFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
if(createHash('sha256').update(readFileSync('baseline.tar.gz')).digest('hex') !== '716b1c39d4b9b4e77e1a2be3ede00e018fb821168e59a269d1bc99e5a202eefa') throw Error('Baseline checksum mismatch');
mkdirSync('baseline',{recursive:true});
execFileSync('tar',['-xzf','baseline.tar.gz','-C','baseline']);

const htmlEntries = ['index.html','admin/index.html','admin/login/index.html','admin/leads/index.html'];
const diagnostic = /<div role="note" style="[^"]*">Live data · Edits save<\/div>/g;
for (const path of htmlEntries) {
  const file = 'baseline/dist/' + path;
  const before = readFileSync(file, 'utf8');
  if ([...before.matchAll(diagnostic)].length !== 1) throw Error('Unexpected Juan diagnostic in ' + path);
  const after = before.replace(diagnostic, '');
  if (after.includes('Live data · Edits save')) throw Error('Juan diagnostic survived in ' + path);
  writeFileSync(file, after);
}

const bundle = 'baseline/dist/assets/index-8ELzBVeS.js';
const original = readFileSync(bundle,'utf8');
const settings = 'label:"Settings",to:"/admin/settings",icon:Ux,disabled:!0';
const nav = 'l.jsxs(nv,{to:n,title:e?r:void 0';
if (original.split(settings).length!==2 || original.split(nav).length!==2) throw Error('Unexpected Juan staging navigation');
const mobilePanel = 'relative z-10 flex flex-col w-60 h-full';
const mobileBrand = 'children:[l.jsx(gf,{}),l.jsx("nav"';
if (original.split(mobilePanel).length !== 2 || original.split(mobileBrand).length !== 2) throw Error('Unexpected Juan drawer');
const updated = original.replace(mobilePanel,'relative z-10 flex flex-col h-full db-mobile-panel')
  .replace(mobileBrand,'children:[l.jsx(gf,{}),l.jsx("button",{type:"button",className:"db-mobile-close","aria-label":"Close navigation",onClick:n,children:"×"}),l.jsx("nav"')
  .replace(settings,'label:"Settings",to:"/admin/settings/",icon:Ux,disabled:!1')
  .replace(nav,'l.jsxs(nv,{to:n,reloadDocument:n==="/admin/settings/",title:e?r:void 0');
const versioned = bundle.replace('.js','-' + createHash('sha256').update(updated).digest('hex').slice(0,12) + '.js');
writeFileSync(versioned,updated);
for (const path of ['admin/index.html','admin/login/index.html','admin/leads/index.html']) {
  const file='baseline/dist/'+path;
  writeFileSync(file,readFileSync(file,'utf8').replace(bundle.split('/').at(-1),versioned.split('/').at(-1)));
}
execFileSync('../../node_modules/.bin/vite',['build','--config','notifications.vite.mjs'],{stdio:'inherit'});
mkdirSync('baseline/dist/admin/settings',{recursive:true});
renameSync('baseline/dist/notifications.html','baseline/dist/admin/settings/index.html');
copyFileSync('notifications-sw.js','baseline/dist/notifications-sw.js');
const supplied = original;
const settingsPage = 'admin/settings/index.html';

const ref="nlqsvzbtbspflyozrvds";
const anon=[...supplied.matchAll(/eyJ[\w-]+\.eyJ[\w-]+\.[\w-]+/g)].map(x=>x[0]).find(key=>{
  try {const claims=JSON.parse(Buffer.from(key.split('.')[1],'base64url').toString());return claims.ref===ref&&claims.role==='anon';} catch {return false;}
});
if (!anon) throw Error('Missing staging project anon key');
writeFileSync('notification-project.mjs', [
  ['project',ref],['publicKey',anon],['origin',"https://rodents-admin-review.gta-alpha-activities.workers.dev"],['app',"juan"],['ownerId',"b3231644-e350-4087-a0a8-9ec011494182"],
].map(([k,v])=>'export const '+k+'='+JSON.stringify(v)+';').join('\n'));
copyFileSync('notification-badge.js','baseline/dist/notification-badge.js');
copyFileSync('notification-nav.css','baseline/dist/notification-nav.css');
copyFileSync('mobile-nav.js','baseline/dist/mobile-nav.js');
for (const path of ['admin/index.html','admin/login/index.html','admin/leads/index.html',settingsPage]) {
  const file='baseline/dist/'+path;
  const html=readFileSync(file,'utf8');
  writeFileSync(file,html.replace('</head>','<link rel="stylesheet" href="/notification-nav.css"></head>')
    .replace('</body>','<script defer src="/notification-badge.js"></script><script defer src="/mobile-nav.js"></script></body>'));
}

const manifestPath = 'baseline/dist/site.webmanifest';
const manifest=JSON.parse(readFileSync(manifestPath,'utf8'));
writeFileSync(manifestPath,JSON.stringify({...manifest,start_url:'/admin/',scope:'/admin/'}));
