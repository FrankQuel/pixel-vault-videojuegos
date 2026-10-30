import {DatabaseSync} from 'node:sqlite';
import {readFileSync} from 'node:fs';
export function localDB(file=':memory:'){
const sqlite=new DatabaseSync(file);sqlite.exec(readFileSync(new URL('../drizzle/0000_catalog.sql',import.meta.url),'utf8').replaceAll('--> statement-breakpoint',''));
return {prepare(sql){const statement=sqlite.prepare(sql);let params=[];return {bind(...p){params=p;return this;},async first(){return statement.get(...params)||null;},async all(){return {results:statement.all(...params)};},async run(){return {meta:{changes:statement.run(...params).changes}};}};},async batch(items){return Promise.all(items.map(s=>s.run()));}};
}
