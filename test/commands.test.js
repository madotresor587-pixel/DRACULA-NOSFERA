import test from "node:test";
import assert from "node:assert/strict";
import { calculate, parseCommand, getCommandReply } from "../commands.js";

test("parseCommand reads command and arguments", () => {
  assert.deepEqual(parseCommand(".choisir pizza | riz"), { command: "choisir", args: "pizza | riz" });
});
test("parseCommand ignores case and handles empty input", () => {
  assert.deepEqual(parseCommand(".PING"), { command: "ping", args: "" });
  assert.deepEqual(parseCommand("."), { command: "", args: "" });
  assert.deepEqual(parseCommand("hello"), { command: "", args: "" });
});
test("calculator respects precedence and parentheses", () => {
  assert.equal(calculate("12*(4+3)"), 84);
  assert.equal(calculate("10-2*3"), 4);
  assert.equal(calculate("-5+8/2"), -1);
  assert.equal(calculate("10%3"), 1);
});
test("calculator rejects invalid input and division by zero", () => {
  assert.throws(() => calculate("2/0"), /Division par zéro/);
  assert.throws(() => calculate("process.exit()"), /Utilise seulement/);
  assert.throws(() => calculate("(2+3"), /Parenthèses/);
});
test("basic commands return a response", async () => {
  const context = { botName: "DRACULA NOSFERA", isGroup: false };
  assert.match(await getCommandReply(parseCommand(".ping"), context), /Pong/);
  assert.match(await getCommandReply(parseCommand(".menu"), context), /DRACULA NOSFERA/);
  assert.match(await getCommandReply(parseCommand(".diagnostic"), context), /DIAGNOSTIC LOCAL/);
  assert.match(await getCommandReply(parseCommand(".correcteur"), context), /contrôles réussis/);
  assert.match(await getCommandReply(parseCommand(".calcul 2+2"), context), /4/);
});
