import {test,expect} from '@playwright/test';
import {catalogue} from '../engine.js';
const base='/';
async function command(page,cmd){await page.locator('#command').fill(cmd);await page.locator('#command').press('Enter');}
test('full mission lifecycle, scoring, reload and reset',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base);await expect(page.locator('#solved')).toHaveText('0 / 10');
 await command(page,'submit incorrect');await expect(page.locator('#output')).toContainText('Flag rejected');
 await page.locator('#hint').click();await expect(page.locator('#output')).toContainText('HINT 1');
 for(const [i,m] of catalogue().entries()){
  await page.locator('.mission').nth(i).click();
  for(const c of m.route)await command(page,c);
  await expect(page.locator('#output')).toContainText(m.flag);
  await page.locator('#flag').fill(m.flag);await page.getByRole('button',{name:'Submit flag'}).click();
  await expect(page.locator('#solved')).toHaveText((i+1)+' / 10');
 }
 await expect(page.locator('#score')).toHaveText('2675');await expect(page.locator('#rank')).toHaveText('Elite investigator');
 await command(page,'submit T404{final_access}');await expect(page.locator('#score')).toHaveText('2675');
 await page.reload();await expect(page.locator('#solved')).toHaveText('10 / 10');
 await expect(page.locator('#mission-title')).toHaveText('Terminal 404');
 page.once('dialog',d=>d.dismiss());await page.locator('#reset').click();await expect(page.locator('#solved')).toHaveText('10 / 10');
 page.once('dialog',d=>d.accept());await page.locator('#reset').click();await expect(page.locator('#solved')).toHaveText('0 / 10');expect(errors).toEqual([]);
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
 await expect(page.locator('#solved')).toHaveText('0 / 10');await command(page,'pwd');await expect(page.locator('#output')).toContainText('/home/agent');
});
