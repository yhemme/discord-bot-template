import { CommandInteraction, SlashCommandBuilder } from "discord.js"
import { Command } from "../../types/commands.ts"

const data = new SlashCommandBuilder()
  .setName("server")
  .setDescription("Provides information about the server.")

async function execute(interaction: CommandInteraction) {
  await interaction.deferReply()
  await new Promise((resolve) => setTimeout(resolve, 3000))
  // interaction.guild is the object representing the Guild in which the command was run
  await interaction.editReply(
    `This server is ${interaction.guild?.name} and has ${interaction.guild?.memberCount} members.`
  )
}

export default {
  data,
  execute,
} as Command
