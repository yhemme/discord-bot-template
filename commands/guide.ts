import {
  AutocompleteInteraction,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} from "discord.js"
import { Command } from "../types/commands.ts"

const data = new SlashCommandBuilder()
  .setName("guide")
  .setDescription("Search discord.js guide !")
  .addStringOption((option) =>
    option
      .setName("query")
      .setDescription("Phrase to search for")
      .setAutocomplete(true)
  )
  .addStringOption((option) =>
    option
      .setName("version")
      .setDescription("Version to search in")
      .setAutocomplete(true)
  )

async function execute(interaction: ChatInputCommandInteraction) {
  const query = interaction.options.getString("query")
  const version = interaction.options.getString("version")

  await interaction.reply(`Query: ${query}, Version: ${version}`)
}

async function autocomplete(interaction: AutocompleteInteraction) {
  const focusedOption = interaction.options.getFocused(true)
  let choices: Array<string> = []

  if (focusedOption.name === "query") {
    choices = [
      "Popular Topics: Threads",
      "Sharding: Getting started",
      "Library: Voice Connections",
      "Interactions: Replying to slash commands",
      "Popular Topics: Embed preview",
    ]
  }

  if (focusedOption.name === "version") {
    choices = ["v9", "v11", "v12", "v13", "v14"]
  }

  const filtered = choices.filter((choice) =>
    choice.startsWith(focusedOption.value)
  )
  await interaction.respond(
    filtered.map((choice) => ({ name: choice, value: choice }))
  )
}

export default {
  data,
  execute,
  autocomplete,
} as Command
