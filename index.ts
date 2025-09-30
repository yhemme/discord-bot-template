import { Client, Collection, GatewayIntentBits } from "discord.js"
import path from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"
import { getCommandsFromFolders } from "./lib/commands-utils.js"
import fs from "node:fs"

// ESM-compatible __dirname
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] })

async function registerCommands() {
  client.commands = new Collection<string, any>()
  client.getCommand = (name: string) => client.commands.get(name)
  const commands = await getCommandsFromFolders()
  console.log(`Loading ${commands.length} commands`)
  for (const command of commands) {
    client.commands.set(command.data.name, command)
  }
}

async function initializeCooldowns() {
  client.cooldowns = new Collection<string, Collection<string, number>>()
  client.getCooldowns = (name: string) => client.cooldowns.get(name)
}

async function registerEvents() {
  const eventsPath = path.join(__dirname, "events")
  const eventFiles = fs
    .readdirSync(eventsPath)
    .filter((file) => file.endsWith(".ts") || file.endsWith(".js"))

  for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file)
    const module = await import(pathToFileURL(filePath).href)
    const event = module.default ?? module
    if (event.once) {
      client.once(event.name, (...args) => event.execute(...args))
    } else {
      client.on(event.name, (...args) => event.execute(...args))
    }
  }
}

await registerCommands()
await initializeCooldowns()
await registerEvents()

// Log in to Discord with your client's token
client.login(process.env.TOKEN)
