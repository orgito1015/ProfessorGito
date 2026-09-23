import test from 'node:test';
import assert from 'node:assert/strict';
import { freshState, execute, puzzleMatches, messagesFor } from '../src/engine/game.js';
import { parseSave, serializeSave } from '../src/storage/saves.js';
function run(s,...lines){return lines.reduce((s,line)=>execute(s,line).state,s);}

test('puzzleMatches supports text and order puzzle types', () => {
 const text = { answers: ['q17-b'] };
 assert.equal(puzzleMatches(text, 'Q17-B'), true);
 assert.equal(puzzleMatches(text, 'q17-c'), false);
 const order = { type: 'order', answers: ['task,manifest,traffic'] };
 assert.equal(puzzleMatches(order, 'task,manifest,traffic'), true);
 assert.equal(puzzleMatches(order, 'task, manifest, traffic'), true);
 assert.equal(puzzleMatches(order, 'manifest,task,traffic'), false);
});

test('messagesFor derives an in-game inbox from existing narrative fields, no new content required', () => {
 let s = freshState('halden');
 assert.equal(messagesFor(s).length, 1);
 s = run(s, 'scope', 'connect maintenance', 'cat /tasks/sync.task', 'collect task', 'request-scope');
 assert.equal(messagesFor(s).length, 2);
 s = run(s, 'respond isolate-host');
 assert.equal(messagesFor(s).length, 3);
 s = run(s, 'verify');
 assert.equal(messagesFor(s).length, 4);
});

test('save accepts evidence board notes and links, defaults them when absent, and rejects invalid ones', () => {
 const base = freshState();
 const withBoard = { ...base, board: { notes: { handover: 'Check the timestamp.' }, links: [['access', 'handover']] } };
 const saved = parseSave(JSON.stringify(withBoard));
 assert.deepEqual(saved.board.notes, { handover: 'Check the timestamp.' });
 assert.deepEqual(saved.board.links, [['access', 'handover']]);
 const legacy = structuredClone(base); delete legacy.board;
 assert.deepEqual(parseSave(JSON.stringify(legacy)).board, { notes: {}, links: [] });
 for (const bad of [
  { board: { notes: { unknown: 'x' }, links: [] } },
  { board: { notes: {}, links: [['handover', 'handover']] } },
  { board: { notes: {}, links: [['handover', 'access'], ['access', 'handover']] } },
  { board: { notes: { handover: 'x'.repeat(2001) }, links: [] } },
 ]) assert.throws(() => parseSave(JSON.stringify({ ...base, ...bad })));
});

test('save accepts difficulty and sound preferences, defaults them for legacy saves, and rejects invalid values', () => {
 const base = freshState();
 assert.equal(parseSave(serializeSave(base)).preferences.difficulty, 'standard');
 const legacy = structuredClone(base); delete legacy.preferences.difficulty; delete legacy.preferences.sound;
 const migrated = parseSave(JSON.stringify(legacy));
 assert.equal(migrated.preferences.difficulty, 'standard');
 assert.equal(migrated.preferences.sound, false);
 for (const bad of [
  { preferences: { ...base.preferences, difficulty: 'nightmare' } },
  { preferences: { ...base.preferences, sound: 'yes' } },
 ]) assert.throws(() => parseSave(JSON.stringify({ ...base, ...bad })));
});
