import {test,expect} from '@playwright/test';
import {catalogue} from '../engine.js';
const base='/';
async function command(page,cmd){await page.locator('#command').fill(cmd);await page.locator('#command').press('Enter');}
test('full mission lifecycle, scoring, reload and reset',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base);await expect(page.locator('#solved')).toHaveText('0 / '+catalogue().length);
 await command(page,'submit incorrect');await expect(page.locator('#output')).toContainText('Flag rejected');
 await page.locator('#hint').click();await expect(page.locator('#output')).toContainText('HINT 1');
 for(const [i,m] of catalogue().entries()){
  await page.locator('.mission').nth(i).click();
  for(const c of m.route)await command(page,c);
  await expect(page.locator('#output')).toContainText(m.flag);
  await page.locator('#flag').fill(m.flag);await page.getByRole('button',{name:'Submit flag'}).click();
  await expect(page.locator('#solved')).toHaveText((i+1)+' / '+catalogue().length);
 }
 await expect(page.locator('#score')).toHaveText(String(catalogue().reduce((s,m)=>s+m.points,0)-25));await expect(page.locator('#rank')).toHaveText('Elite investigator');
 await command(page,'submit '+catalogue().at(-1).flag);await expect(page.locator('#score')).toHaveText(String(catalogue().reduce((s,m)=>s+m.points,0)-25));
 await page.reload();await expect(page.locator('#solved')).toHaveText(catalogue().length+' / '+catalogue().length);
 await expect(page.locator('#mission-title')).toHaveText(catalogue().at(-1).name);
 page.once('dialog',d=>d.dismiss());await page.locator('#reset').click();await expect(page.locator('#solved')).toHaveText(catalogue().length+' / '+catalogue().length);
 page.once('dialog',d=>d.accept());await page.locator('#reset').click();await expect(page.locator('#solved')).toHaveText('0 / '+catalogue().length);expect(errors).toEqual([]);
});
test('keyboard, safe rendering, sandbox and responsive layout',async({page})=>{
 const external=[];page.on('request',r=>{if(!r.url().startsWith('http://127.0.0.1:8080/'))external.push(r.url());});
 await page.goto(base);await command(page,'echo <img src=x onerror=alert(1)>');await expect(page.locator('#output')).toContainText('<img src=x onerror=alert(1)>');await expect(page.locator('#output img')).toHaveCount(0);
 await command(page,'cat /etc/passwd');await expect(page.locator('#output')).toContainText('No such file');
 await command(page,'ls -a');await page.locator('#command').press('ArrowUp');await expect(page.locator('#command')).toHaveValue('ls -a');
 await page.locator('#command').fill('whoa');await page.locator('#command').press('Tab');await expect(page.locator('#command')).toHaveValue('whoami ');
 await page.locator('#command').press('Enter');await expect(page.locator('#output')).toContainText('agent');
 await page.locator('#clear').click();await expect(page.locator('#output')).toHaveText('');
 for(const width of [320,375,768,1024,1440]){await page.setViewportSize({width,height:800});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);}
 expect(external).toEqual([]);
});
test('corrupt local storage does not prevent play',async({page})=>{
 await page.addInitScript(()=>localStorage.setItem('terminal404.v1','{bad'));await page.goto(base);
 await expect(page.locator('#solved')).toHaveText('0 / '+catalogue().length);await command(page,'pwd');await expect(page.locator('#output')).toContainText('/home/agent');
});

test('mission search, filters, notes, bookmarks, preferences and stats',async({page})=>{
 await page.goto(base);await page.locator('#search').fill('Packet');await expect(page.locator('.mission')).toHaveCount(1);await page.locator('.mission').click();
 await page.locator('#bookmark').click();await page.locator('#search').clear();await page.locator('#mission-filter').selectOption('bookmarked');await expect(page.locator('.mission')).toHaveCount(1);
 await page.locator('#notes').fill('Evidence from ledger');await page.locator('#large-text').click();await expect(page.locator('#output')).toHaveClass('large-text');
 await page.locator('#dismiss-tutorial').click();await expect(page.locator('#tutorial')).toBeHidden();
 await page.locator('#hint').click();await page.locator('#clear').click();await page.locator('#repeat-hints').click();await expect(page.locator('#output')).toContainText('HINT 1');
 await command(page,'submit wrong');await expect(page.locator('#attempt-count')).toHaveText('1');
 await command(page,'grep ALERT ledger.csv | cut -d , -f 3');await expect(page.locator('#output')).toContainText('T404{packet_ledger}');
 await command(page,'submit T404{packet_ledger}');await expect(page.locator('#lesson')).not.toBeEmpty();await expect(page.locator('#achievements')).toContainText('First flag');
 await page.reload();await expect(page.locator('#notes')).toHaveValue('Evidence from ledger');await expect(page.locator('#output')).toHaveClass('large-text');await expect(page.locator('#tutorial')).toBeHidden();await expect(page.locator('#bookmark')).toHaveText('Remove bookmark');
 await page.locator('#difficulty').selectOption('Advanced');await expect(page.locator('.mission')).toHaveCount(catalogue().filter(m=>m.level==='Advanced').length);
 await page.locator('#search').fill('no matching case');await expect(page.locator('#empty-missions')).toBeVisible();await page.locator('#search').clear();await page.locator('#difficulty').selectOption('all');
 await page.locator('#next').click();await expect(page.locator('#mission-title')).toHaveText('Morse Dispatch');await page.locator('#previous').click();await expect(page.locator('#notes')).toHaveValue('Evidence from ledger');
 await page.locator('#next-unsolved').click();await expect(page.locator('#mission-title')).toHaveText('Morse Dispatch');await page.locator('#restart').click();await expect(page.locator('#output')).toContainText('Sandbox loaded');
 await page.locator('#show-tutorial').click();await expect(page.locator('#tutorial')).toBeVisible();
});