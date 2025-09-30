import { CommandInteraction, SlashCommandBuilder } from "discord.js"
import path from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"
import fs from "fs"
import { Command } from "../types/commands.ts"

export async function getCommandsFromPath(
  foldersPath: string
): Promise<Array<Command>> {
  const commands: Array<Command> = []
  if (!fs.existsSync(foldersPath)) {
    // Nothing to load if the directory doesn't exist
    return commands
  }
  const commandFolders = fs
    .readdirSync(foldersPath, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
  const foldersIncludingRoot = [".", ...commandFolders]

  console.log(
    `Reading ${foldersIncludingRoot.length} commands folder${
      foldersIncludingRoot.length <= 1 ? "" : "s"
    } (including root) from folder: "${foldersPath}"`
  )

  for (const folder of foldersIncludingRoot) {
    const commandsPath = path.join(foldersPath, folder)
    const commandFiles = fs
      .readdirSync(commandsPath)
      .filter((file) => file.endsWith(".ts") || file.endsWith(".js"))
    for (const file of commandFiles) {
      const filePath = path.join(commandsPath, file)
      const mod = await import(pathToFileURL(filePath).href)
      const command = mod.default ?? mod
      // Register the command module in memory by its name
      if ("data" in command && "execute" in command) {
        commands.push(command)
      } else {
        console.log(
          `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
        )
      }
    }
  }

  return commands
}

export async function getCommandsFromFolders(): Promise<Array<Command>> {
  // ESM-compatible __dirname
  const __filename = fileURLToPath(import.meta.url)
  const __dirname = path.dirname(__filename)
  const commandsPath = path.join(__dirname, "../commands")

  return await getCommandsFromPath(commandsPath)
}
