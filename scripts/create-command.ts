#!/usr/bin/env node
/*
 Cross-platform command generator for Discord slash commands.
 - Prompts for command name and description
 - Places file under commands/ or commands/utility/
 - Populates setName and setDescription
 - Creates an empty execute() function

 Run with:
   node scripts/create-command.ts
 or (recommended if you have tsx):
   npx tsx scripts/create-command.ts
*/

import { createInterface, Interface } from "node:readline/promises"
import { stdin as input, stdout as output } from "node:process"
import { promises as fs } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import {
  collectCommandNames,
  computeImportPath,
  validateCommandName,
  validateFolderName,
} from "./create-command-helpers.ts"

// Prompt for command name with validation and duplication check.
async function promptCommandName(
  rl: Interface,
  existingNames: Set<string>
): Promise<string> {
  while (true) {
    const rawName = (
      await rl.question(
        "Command name (lowercase, letters/numbers/-_) [Esc + Enter to cancel]: "
      )
    ).trim()
    // ESC (\x1b) if user presses Esc then Enter
    if (rawName === "\u001b" || rawName === "\x1b") {
      console.log("Canceled by user.")
      throw new Error("CANCEL")
    }

    const result = validateCommandName(rawName, existingNames)
    if (!result.ok) {
      console.log(result.reason)
      continue
    }
    return result.value
  }
}

// Prompt for non-empty description with reprompt and Esc cancel
async function promptDescription(rl: Interface): Promise<string> {
  while (true) {
    const raw = (
      await rl.question("Command description [Esc + Enter to cancel]: ")
    ).trim()
    if (raw === "\u001b" || raw === "\x1b") {
      console.log("Canceled by user.")
      throw new Error("CANCEL")
    }
    if (!raw) {
      console.log(
        "Description cannot be empty. Please enter a description or press Esc to cancel."
      )
      continue
    }
    return raw
  }
}



// Let user pick target folder (root, existing subfolder, or create new)
async function chooseTargetFolder(
  rl: Interface,
  commandsDir: string
): Promise<string> {
  const entries = await fs.readdir(commandsDir, { withFileTypes: true })
  const folders = entries
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort()

  console.log("\nSelect target folder for the command:")
  console.log("0) root (commands/)")
  folders.forEach((f, i) => console.log(`${i + 1}) ${f}/`))
  console.log(`${folders.length + 1}) create a new folder`)

  let choiceIdx = -1
  while (true) {
    const choice = (await rl.question("Enter choice number: ")).trim()
    const n = Number.parseInt(choice, 10)
    if (!Number.isNaN(n) && n >= 0 && n <= folders.length + 1) {
      choiceIdx = n
      break
    }
    console.log("Invalid choice. Please enter a number in range.")
  }

  if (choiceIdx === 0) return commandsDir
  if (choiceIdx === folders.length + 1) {
    // Create new folder
    while (true) {
      const newName = (
        await rl.question("New folder name (letters/numbers/-_): ")
      ).trim()
      if (!newName) {
        console.log("Folder name cannot be empty.")
        continue
      }
      if (!validateFolderName(newName)) {
        console.log("Use only letters, numbers, hyphen (-) and underscore (_).")
        continue
      }
      const dir = path.join(commandsDir, newName)
      await fs.mkdir(dir, { recursive: true })
      return dir
    }
  }
  return path.join(commandsDir, folders[choiceIdx - 1])
}

async function writeCommandFile(
  projectRoot: string,
  targetDir: string,
  cmdName: string,
  description: string,
  importPath: string
) {
  await fs.mkdir(targetDir, { recursive: true })
  const targetFile = path.join(targetDir, `${cmdName}.ts`)
  try {
    await fs.access(targetFile)
    throw new Error(
      `File already exists: ${path.relative(projectRoot, targetFile)}`
    )
  } catch (e: any) {
    if (e && e.code !== "ENOENT") throw e
  }

  const content = `import { CommandInteraction, SlashCommandBuilder } from "discord.js"
import { Command } from "${importPath}"

const data = new SlashCommandBuilder()
  .setName("${cmdName}")
  .setDescription("${description}")

async function execute(interaction: CommandInteraction) {
  // TODO: implement command logic
   await interaction.reply("Empty command")
}

export default {
  data,
  execute,
} as Command
`

  await fs.writeFile(targetFile, content, { encoding: "utf8" })
  const rel = path.relative(projectRoot, targetFile)
  console.log(`Created command: ${rel}`)
}

export async function runCreateCommand(rl: Interface, projectRoot: string) {
  const commandsDir = path.join(projectRoot, "commands")
  const existingNames = await collectCommandNames(commandsDir)

  const cmdName = await promptCommandName(rl, existingNames)
  const description = await promptDescription(rl)
  const targetDir = await chooseTargetFolder(rl, commandsDir)
  const importPath = computeImportPath(projectRoot, targetDir)
  await writeCommandFile(
    projectRoot,
    targetDir,
    cmdName,
    description,
    importPath
  )
}

async function main() {
  const rl = createInterface({ input, output })
  try {
    const __filename = fileURLToPath(import.meta.url)
    const __dirname = path.dirname(__filename)
    const projectRoot = path.resolve(__dirname, "..")
    await runCreateCommand(rl, projectRoot)
  } finally {
    rl.close()
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main().catch((err) => {
    console.error(err.message || err)
    process.exit(1)
  })
}
