import { Collection, ChatInputCommandInteraction } from "discord.js"

declare module "discord.js" {
  interface Client {
    commands: Collection<
      string,
      (interaction: ChatInputCommandInteraction) => any | Promise<any>
    >
  }
}
