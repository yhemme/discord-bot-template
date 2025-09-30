export interface DiscordEvent {
  name: string
  execute: (...args: any[]) => void
  once?: boolean
}
