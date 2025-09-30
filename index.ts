// Require the necessary discord.js classes
import { Client, Collection, Events, GatewayIntentBits } from "discord.js"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { getCommandsFromFolders } from "./lib/commands-utils.js"

// ESM-compatible __dirname
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] })

// In-memory command registry
const commandCollection = new Collection<string, any>()

const commands = await getCommandsFromFolders()

console.log(`Loading ${commands.length} commands`)
for (const command of commands) {
  commandCollection.set(command.data.name, command.execute)
}

// When the client is ready, run this code (only once).
// The distinction between `client: Client<boolean>` and `readyClient: Client<true>` is important for TypeScript developers.
// It makes some properties non-nullable.
client.once(Events.ClientReady, (readyClient) => {
  console.log(`Ready! Logged in as ${readyClient.user.tag}`)
})

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return
  const command = commandCollection.get(interaction.commandName)
  if (!command) {
    console.warn(`No command matching ${interaction.commandName} was found.`)
    return
  }

  try {
    await command(interaction)
  } catch (error) {
    console.error(error)
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: "There was an error while executing this command!",
        ephemeral: true,
      })
    } else {
      await interaction.reply({
        content: "There was an error while executing this command!",
        ephemeral: true,
      })
    }
  }
})

// Log in to Discord with your client's token
client.login(process.env.TOKEN)
