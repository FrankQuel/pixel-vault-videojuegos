import {mkdirSync,copyFileSync,readFileSync,writeFileSync} from 'node:fs';
mkdirSync('dist/server',{recursive:true});mkdirSync('dist/.openai',{recursive:true});
writeFileSync('dist/server/index.js',"const artwork='"+readFileSync('assets/worlds.png').toString('base64')+"';\n"+readFileSync('worker/page.js','utf8').replace('export const page','const page')+'\n'+readFileSync('worker/app.js','utf8').replace("import { page } from './page.js';",'').replace("import { artwork } from './artwork.js';",''));copyFileSync('.openai/hosting.json','dist/.openai/hosting.json');
console.log('Pixel Vault build complete');
