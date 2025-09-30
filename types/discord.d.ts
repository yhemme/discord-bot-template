import { Collection } from "discord.js"
import type { Command } from "./commands"

declare module "discord.js" {
  interface Client {
    commands: Collection<string, Command>
    cooldowns: Collection<string, Collection<string, number>>
    getCommand(name: string): Command | undefined
    getCooldowns(name: string): Collection<string, number> | undefined
  }
}
