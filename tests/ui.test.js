import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';import {catalogue,createShell} from '../engine.js';import {runUiChecks} from './ui-harness.js';
test('Application state and event handlers',()=>runUiChecks(readFileSync(new URL('../app.js',import.meta.url),'utf8'),catalogue,createShell,(ok,label)=>assert.ok(ok,label)));
