import { describe, it, expect, vi, beforeAll, afterAll } from "vitest"
import { promises as fs } from "node:fs"
import path from "node:path"
import os from "node:os"
import { runCreateCommand } from "../create-command.ts"
import type { Interface } from "node:readline/promises"

function mockRl(answers: string[]): Interface {
  const q = vi.fn(async (prompt: string) => {
    if (answers.length === 0) throw new Error(`No more answers for prompt: ${prompt}`)
    return answers.shift() as string
  })
  return { question: q } as unknown as Interface
}

describe("scripts/create-command CLI", () => {
  let tmp: string
  let projectRoot: string

  beforeAll(async () => {
    tmp = await fs.mkdtemp(path.join(os.tmpdir(), "create-cmd-"))
    projectRoot = tmp
    // prepare project structure
    await fs.mkdir(path.join(projectRoot, "commands"))
    await fs.mkdir(path.join(projectRoot, "lib"))
    await fs.writeFile(
      path.join(projectRoot, "lib", "commands-utils.ts"),
      "export const x = 1\n",
      "utf8"
    )
    // prepare an existing subfolder for selection tests
    await fs.mkdir(path.join(projectRoot, "commands", "existing"))
  })

  afterAll(async () => {
    try {
      await fs.rm(tmp, { recursive: true, force: true })
    } catch {}
  })

  it("creates a command in root with valid inputs", async () => {
    const rl = mockRl([
      "sample-cmd", // name
      "A description", // description
      "0", // choose root
    ])

    await runCreateCommand(rl, projectRoot)

    const target = path.join(projectRoot, "commands", "sample-cmd.ts")
    const exists = await fs.readFile(target, "utf8").then(() => true, () => false)
    expect(exists).toBe(true)

    const content = await fs.readFile(target, "utf8")
    expect(content).toContain('.setName("sample-cmd")')
    expect(content).toContain('.setDescription("A description")')
    expect(content).toContain('import { Command } from "../lib/commands-utils.ts"')
  })

  it("creates a command in a new subfolder and prevents duplicates", async () => {
    // Pre-create a command to trigger duplicate check
    await fs.writeFile(
      path.join(projectRoot, "commands", "dup.ts"),
      "export {}\n",
      "utf8"
    )

    const rl = mockRl([
      "dup", // duplicate name -> will reprompt
      "new-name", // second attempt
      "Some description", // description
      "2", // create a new folder (0=root; 1=existing; 2=create new)
      "custom-folder", // new folder name
    ])

    await runCreateCommand(rl, projectRoot)

    const target = path.join(projectRoot, "commands", "custom-folder", "new-name.ts")
    const exists = await fs.readFile(target, "utf8").then(() => true, () => false)
    expect(exists).toBe(true)

    const content = await fs.readFile(target, "utf8")
    expect(content).toContain('import { Command } from "../../lib/commands-utils.ts"')
  })

  it("reprompts on invalid name then succeeds", async () => {
    const rl = mockRl([
      "INVALID NAME ^&*", // invalid
      "ok-name", // valid
      "Some description", // description
      "0", // root
    ])

    await runCreateCommand(rl, projectRoot)

    const target = path.join(projectRoot, "commands", "ok-name.ts")
    const exists = await fs.readFile(target, "utf8").then(() => true, () => false)
    expect(exists).toBe(true)
  })

  it("reprompts description when empty then succeeds", async () => {
    const rl = mockRl([
      "desc-test", // name
      "", // empty description -> reprompt
      "Filled description", // valid
      "0", // root
    ])

    await runCreateCommand(rl, projectRoot)

    const content = await fs.readFile(
      path.join(projectRoot, "commands", "desc-test.ts"),
      "utf8"
    )
    expect(content).toContain('.setDescription("Filled description")')
  })

  it("places command into an existing subfolder when selected", async () => {
    const rl = mockRl([
      "in-existing", // name
      "Put into existing", // description
      "2", // choose existing when folders are [custom-folder, existing]
    ])

    await runCreateCommand(rl, projectRoot)

    const target = path.join(projectRoot, "commands", "existing", "in-existing.ts")
    const exists = await fs.readFile(target, "utf8").then(() => true, () => false)
    expect(exists).toBe(true)
  })

  it("reprompts on invalid new folder name then creates with valid", async () => {
    const rl = mockRl([
      "folder-name-test", // name
      "Some desc", // description
      "3", // choose create new (menu: 0=root, 1=custom-folder, 2=existing, 3=create new)
      "bad name", // invalid folder name -> reprompt
      "good_name-1", // valid folder name
    ])

    await runCreateCommand(rl, projectRoot)

    const target = path.join(
      projectRoot,
      "commands",
      "good_name-1",
      "folder-name-test.ts"
    )
    const exists = await fs.readFile(target, "utf8").then(() => true, () => false)
    expect(exists).toBe(true)
  })

  it("cancels when user presses Esc at name prompt", async () => {
    const rl = mockRl(["\u001b"]) // Esc
    await expect(runCreateCommand(rl, projectRoot)).rejects.toThrow("CANCEL")
  })
})
