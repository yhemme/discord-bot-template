import { describe, it, expect, vi } from "vitest"
import ping from "../ping.ts"
import type { CommandInteraction } from "discord.js"

describe("commands/utility/ping", () => {
  it("has correct data name and description", () => {
    // SlashCommandBuilder may not expose fields directly; fallback to toJSON
    const anyData: any = ping.data as any
    const json = typeof anyData.toJSON === "function" ? anyData.toJSON() : anyData
    expect(json.name).toBe("ping")
    expect(json.description).toBe("Replies with Pong!")
  })

  it("replies with Pong! when executed", async () => {
    const interaction = {
      reply: vi.fn(async (_: string) => {}),
    } as unknown as CommandInteraction

    await ping.execute(interaction)

    expect((interaction as any).reply).toHaveBeenCalledTimes(1)
    expect((interaction as any).reply).toHaveBeenCalledWith("Pong!")
  })
})
