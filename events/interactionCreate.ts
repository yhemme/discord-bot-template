import { CacheType, Events, Interaction } from "discord.js"
import { DiscordEvent } from "../types/event.ts"

const interactionCreateEvent: DiscordEvent = {
  name: Events.InteractionCreate,
  async execute(interaction: Interaction<CacheType>) {
    if (!interaction.isChatInputCommand()) return
    const command = interaction.client.commands.get(interaction.commandName)
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
  },
}

export default interactionCreateEvent
