import {
  AutocompleteInteraction,
  CacheType,
  ChatInputCommandInteraction,
  Collection,
  Events,
  Interaction,
  MessageFlags,
} from "discord.js"
import { DiscordEvent } from "../types/event.ts"
import { Command } from "../types/commands.ts"

const interactionCreateEvent: DiscordEvent = {
  name: Events.InteractionCreate,
  async execute(interaction: Interaction<CacheType>) {
    if (interaction.isChatInputCommand()) {
      chatInputCommandCreateHandler(interaction)
    } else if (interaction.isAutocomplete()) {
      autocompleteHandler(interaction)
    }
  },
}

const autocompleteHandler = async (interaction: AutocompleteInteraction) => {
  const command = interaction.client.commands.get(interaction.commandName)

  if (!command) {
    console.error(`No command matching ${interaction.commandName} was found.`)
    return
  }

  try {
    await command.autocomplete(interaction)
  } catch (error) {
    console.error(error)
  }
}

const chatInputCommandCreateHandler = async (
  interaction: ChatInputCommandInteraction
) => {
  const command: Command | undefined = interaction.client.getCommand(
    interaction.commandName
  )
  if (!command) {
    console.warn(`No command matching ${interaction.commandName} was found.`)
    return
  }

  const { cooldowns } = interaction.client

  if (!cooldowns.has(interaction.commandName)) {
    cooldowns.set(interaction.commandName, new Collection())
  }

  const now = Date.now()
  const timestamps = interaction.client.getCooldowns(interaction.commandName)!
  const defaultCooldownDuration = 3
  const cooldownAmount = (command.cooldown ?? defaultCooldownDuration) * 1000

  if (timestamps && timestamps.has(interaction.user.id)) {
    const expirationTime =
      (timestamps.get(interaction.user.id) as number) + cooldownAmount

    if (now < expirationTime) {
      const expiredTimestamp = Math.round(expirationTime / 1000)
      return interaction.reply({
        content: `Please wait, you are on a cooldown for \`${command.data.name}\`. You can use it again <t:${expiredTimestamp}:R>.`,
        flags: MessageFlags.Ephemeral,
      })
    }
  }

  timestamps.set(interaction.user.id, now)
  setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount)

  try {
    await command.execute(interaction)
  } catch (error) {
    console.error(error)

    // Check if we can still respond to the interaction
    if (!interaction.replied && !interaction.deferred) {
      try {
        await interaction.reply({
          content: "There was an error while executing this command!",
          flags: MessageFlags.Ephemeral,
        })
      } catch (replyError) {
        console.error("Failed to send error reply:", replyError)
      }
    } else if (interaction.deferred && !interaction.replied) {
      try {
        await interaction.editReply({
          content: "There was an error while executing this command!",
        })
      } catch (editError) {
        console.error("Failed to edit error reply:", editError)
      }
    } else {
      try {
        await interaction.followUp({
          content: "There was an error while executing this command!",
          flags: MessageFlags.Ephemeral,
        })
      } catch (followUpError) {
        console.error("Failed to send error follow-up:", followUpError)
      }
    }
  }
}

export default interactionCreateEvent
