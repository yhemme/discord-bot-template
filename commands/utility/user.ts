import {
  ChatInputCommandInteraction,
  GuildMember,
  SlashCommandBuilder,
} from "discord.js"
import { Command } from "../../types/commands.ts"

const data = new SlashCommandBuilder()
  .setName("user")
  .setDescription("Provides information about the user.")

async function execute(interaction: ChatInputCommandInteraction) {
  // interaction.user is the object representing the User who ran the command
  // interaction.member is the GuildMember object, which represents the user in the specific guild
  await interaction.reply(
    `This command was run by ${interaction.user.username}, who joined on ${
      interaction.member instanceof GuildMember
        ? interaction.member.joinedAt
        : "No date"
    }.`
  )
}

export default {
  data,
  execute,
} as Command
