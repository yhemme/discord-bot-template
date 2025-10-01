import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js"

export interface Command {
  data: InstanceType<typeof SlashCommandBuilder>
  execute: (interaction: ChatInputCommandInteraction) => Promise<void>
  cooldown?: number
}
