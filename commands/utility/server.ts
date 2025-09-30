import { CommandInteraction, SlashCommandBuilder } from "discord.js"
import { Command } from "../../types/commands.ts"

const data = new SlashCommandBuilder()
  .setName("server")
  .setDescription("Provides information about the server.")

async function execute(interaction: CommandInteraction) {
  // interaction.guild is the object representing the Guild in which the command was run
  await interaction.reply(
    `This server is ${interaction.guild?.name} and has ${interaction.guild?.memberCount} members.`
  )
}

export default {
  data,
  execute,
} as Command
