import { describe, it, expect, vi } from "vitest"
import server from "../server.ts"
import type { CommandInteraction, Guild } from "discord.js"

describe("commands/utility/server", () => {
  it("has correct data name and description", () => {
    const anyData: any = server.data as any
    const json =
      typeof anyData.toJSON === "function" ? anyData.toJSON() : anyData
    expect(json.name).toBe("server")
    expect(json.description).toBe("Provides information about the server.")
  })

  it("replies with server info when executed", async () => {
    const guild = { name: "MyGuild", memberCount: 42 } as unknown as Guild
    const interaction = {
      guild,
      reply: vi.fn(async (_: string) => {}),
    } as unknown as CommandInteraction

    await server.execute(interaction)

    expect((interaction as any).reply).toHaveBeenCalledTimes(1)
    expect((interaction as any).reply).toHaveBeenCalledWith(
      `This server is ${guild.name} and has ${guild.memberCount} members.`
    )
  })
})
