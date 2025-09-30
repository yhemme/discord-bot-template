import { describe, it, expect, beforeAll, afterAll } from "vitest"
import { promises as fs } from "node:fs"
import path from "node:path"
import os from "node:os"
import {
  collectCommandNames,
  computeImportPath,
  validateCommandName,
  validateFolderName,
} from "../create-command-helpers.ts"

async function write(file: string, content = "") {
  await fs.mkdir(path.dirname(file), { recursive: true })
  await fs.writeFile(file, content, "utf8")
}

describe("create-command-helpers", () => {
  describe("validateFolderName", () => {
    it("accepts alnum, hyphen, underscore", () => {
      expect(validateFolderName("utility")).toBe(true)
      expect(validateFolderName("my-utils_1")).toBe(true)
    })
    it("rejects invalid characters", () => {
      expect(validateFolderName("bad name")).toBe(false)
      expect(validateFolderName("bad/name")).toBe(false)
      expect(validateFolderName("..")).toBe(false)
    })
  })

  describe("validateCommandName", () => {
    it("normalizes and accepts valid names", () => {
      const existing = new Set<string>()
      const r = validateCommandName("My Cmd", existing)
      expect(r.ok).toBe(true)
      if (r.ok) expect(r.value).toBe("my-cmd")
    })
    it("rejects invalid format", () => {
      const existing = new Set<string>()
      const r = validateCommandName("UPPER^&*", existing)
      expect(r.ok).toBe(false)
    })
    it("rejects duplicates", () => {
      const existing = new Set<string>(["ping"])
      const r = validateCommandName("ping", existing)
      expect(r.ok).toBe(false)
    })
    it("treats duplicates case/space-insensitively after normalization", () => {
      const existing = new Set<string>(["my-cmd"]) // existing normalized
      const r = validateCommandName("  My   Cmd  ", existing)
      expect(r.ok).toBe(false)
    })
    it("accepts underscores and dashes", () => {
      const existing = new Set<string>()
      const a = validateCommandName("foo_bar", existing)
      const b = validateCommandName("foo-bar", existing)
      expect(a.ok).toBe(true)
      expect(b.ok).toBe(true)
    })
    it("rejects length > 32", () => {
      const existing = new Set<string>()
      const long = "a".repeat(33)
      const r = validateCommandName(long, existing)
      expect(r.ok).toBe(false)
    })
    it("accepts length == 32", () => {
      const existing = new Set<string>()
      const exact = "a".repeat(32)
      const r = validateCommandName(exact, existing)
      expect(r.ok).toBe(true)
    })
  })

  describe("computeImportPath", () => {
    it("computes from root commands folder", () => {
      const root = "/project"
      const target = path.join(root, "commands")
      const p = computeImportPath(root, target)
      expect(p).toBe("../lib/commands-utils.ts")
    })
    it("computes from nested folder", () => {
      const root = "/project"
      const target = path.join(root, "commands", "utility")
      const p = computeImportPath(root, target)
      expect(p).toBe("../../lib/commands-utils.ts")
    })
    it("computes from deeper nested folder", () => {
      const root = "/project"
      const target = path.join(root, "commands", "a", "b")
      const p = computeImportPath(root, target)
      expect(p).toBe("../../../lib/commands-utils.ts")
    })
  })

  describe("collectCommandNames", () => {
    let tmp: string
    beforeAll(async () => {
      tmp = await fs.mkdtemp(path.join(os.tmpdir(), "cmd-helpers-"))
      const commands = path.join(tmp, "commands")
      await fs.mkdir(commands)
      await write(path.join(commands, "root-a.ts"), "export {}")
      await write(path.join(commands, "root-b.js"), "module.exports = {}")
      await write(path.join(commands, "ignore.txt"), "text")
      await write(path.join(commands, "types.d.ts"), "export type X = {}")
      await fs.mkdir(path.join(commands, "utility"))
      await write(path.join(commands, "utility", "ping.ts"), "export {}")
      await write(path.join(commands, "utility", "user.js"), "module.exports = {}")
      await fs.mkdir(path.join(commands, "misc"))
      await write(path.join(commands, "misc", "foo.ts"), "export {}")
    })

    afterAll(async () => {
      // Best-effort cleanup
      try {
        await fs.rm(tmp, { recursive: true, force: true })
      } catch {}
    })

    it("collects base names from root and subfolders", async () => {
      const names = await collectCommandNames(path.join(tmp, "commands"))
      expect(names.has("root-a")).toBe(true)
      expect(names.has("root-b")).toBe(true)
      // includes .d.ts base name as currently implemented
      expect(names.has("types.d")).toBe(true)
      // ignores non .ts/.js
      expect(names.has("ignore")).toBe(false)
      expect(names.has("ping")).toBe(true)
      expect(names.has("user")).toBe(true)
      expect(names.has("foo")).toBe(true)
    })
  })
})
