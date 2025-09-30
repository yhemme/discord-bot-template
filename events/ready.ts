import { Events } from "discord.js"
import { DiscordEvent } from "../types/event.ts"

const readyEvent: DiscordEvent = {
  name: Events.ClientReady,
  once: true,
  execute(client) {
    console.log(`Ready! Logged in as ${client.user.tag}`)
  },
}

export default readyEvent
