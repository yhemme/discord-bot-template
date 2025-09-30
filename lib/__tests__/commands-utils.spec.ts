import { describe, it, expect, beforeAll, afterAll, vi } from "vitest"
import { promises as fs } from "node:fs"
import path from "node:path"
import os from "node:os"
import { getCommandsFromPath } from "../commands-utils.ts"

async function write(file: string, content = "") {
  await fs.mkdir(path.dirname(file), { recursive: true })
  await fs.writeFile(file, content, "utf8")
}

describe("getCommandsFromPath", () => {
  let tmp: string
  let commandsDir: string

  beforeAll(async () => {
    tmp = await fs.mkdtemp(path.join(os.tmpdir(), "cmd-utils-"))
    commandsDir = path.join(tmp, "commands")
    await fs.mkdir(commandsDir)

    // Root-level valid command (js)
    await write(
      path.join(commandsDir, "rootcmd.js"),
      `export default { data: {}, execute: async () => {} }`
    )

    // Subfolder with valid command
    await fs.mkdir(path.join(commandsDir, "utility"))
    await write(
      path.join(commandsDir, "utility", "ping.js"),
      `export default { data: {}, execute: async () => {} }`
    )

    // Bad module missing properties -> should warn and skip
    await write(
      path.join(commandsDir, "utility", "bad.js"),
      `export default { foo: 1 }`
    )

    // Non-js/ts should be ignored
    await write(path.join(commandsDir, "README.md"), "# commands")
  })

  afterAll(async () => {
    try {
      await fs.rm(tmp, { recursive: true, force: true })
    } catch {}
  })

  it("loads commands from root and subfolders and warns on invalid modules", async () => {
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {})
    try {
      const commands = await getCommandsFromPath(commandsDir)
      expect(commands.length).toBe(2)
      // Ensure it logged the reading message
      const reading = logSpy.mock.calls.find((c) => String(c[0]).includes("Reading"))
      expect(reading).toBeTruthy()
      // Ensure warning for bad module
      const warned = logSpy.mock.calls.find((c) => String(c[0]).includes("[WARNING]"))
      expect(warned).toBeTruthy()
    } finally {
      logSpy.mockRestore()
    }
  })
})
