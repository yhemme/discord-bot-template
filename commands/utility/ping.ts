import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js"
import { Command } from "../../types/commands.ts"

const data = new SlashCommandBuilder()
  .setName("ping")
  .setDescription("Replies with Pong!")

async function execute(interaction: ChatInputCommandInteraction) {
  await interaction.reply("Pong!")
  await new Promise((resolve) => setTimeout(resolve, 2000))
  await interaction.followUp("Pong again!")
}

export default {
  data,
  execute,
} as Command
