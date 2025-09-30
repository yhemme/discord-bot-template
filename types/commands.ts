import { CommandInteraction, SlashCommandBuilder } from "discord.js"

export interface Command {
  data: InstanceType<typeof SlashCommandBuilder>
  execute: (interaction: CommandInteraction) => Promise<void>
  cooldown?: number
}
