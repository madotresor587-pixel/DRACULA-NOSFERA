import test from "node:test";
import assert from "node:assert/strict";
import { parseCommand } from "../commands.js";

test("parseCommand reads command and arguments", () => {
  assert.deepEqual(parseCommand(".choisir pizza | riz"), {
    command: "choisir",
    args: "pizza | riz"
  });
});

test("parseCommand ignores command case", () => {
  assert.deepEqual(parseCommand(".PING"), { command: "ping", args: "" });
});

test("parseCommand handles empty input", () => {
  assert.deepEqual(parseCommand("."), { command: "", args: "" });
  assert.deepEqual(parseCommand("hello"), { command: "", args: "" });
});
