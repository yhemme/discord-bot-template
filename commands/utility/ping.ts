import { CommandInteraction, SlashCommandBuilder } from "discord.js"
import { Command } from "../../lib/commands-utils.ts"

const data = new SlashCommandBuilder()
  .setName("ping")
  .setDescription("Replies with Pong!")

async function execute(interaction: CommandInteraction) {
  await interaction.reply("Pong!")
}

export default {
  data,
  execute,
} as Command
