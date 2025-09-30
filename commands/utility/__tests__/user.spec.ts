import { describe, it, expect, vi } from "vitest"
import userCmd from "../user.ts"
import { CommandInteraction, GuildMember } from "discord.js"

describe("commands/utility/user", () => {
  it("has correct data name and description", () => {
    const anyData: any = userCmd.data as any
    const json =
      typeof anyData.toJSON === "function" ? anyData.toJSON() : anyData
    expect(json.name).toBe("user")
    expect(json.description).toBe("Provides information about the user.")
  })

  it("replies with username and joined date when member is GuildMember", async () => {
    const joinedAt = new Date("2023-01-01T00:00:00Z")
    // Create a plain object whose prototype is GuildMember.prototype so instanceof passes
    const member = Object.create((GuildMember as unknown as any).prototype) as GuildMember
    Object.defineProperty(member as any, "joinedAt", { get: () => joinedAt })
    const interaction = {
      user: { username: "alice" },
      member,
      reply: vi.fn(async (_: string) => {}),
    } as unknown as CommandInteraction

    await userCmd.execute(interaction)

    expect((interaction as any).reply).toHaveBeenCalledTimes(1)
    const msg = (interaction as any).reply.mock.calls[0][0] as string
    expect(msg).toContain("alice")
    expect(msg).toContain(String(joinedAt))
  })

  it("replies with 'No date' when member is not a GuildMember", async () => {
    const interaction = {
      user: { username: "bob" },
      member: {},
      reply: vi.fn(async (_: string) => {}),
    } as unknown as CommandInteraction

    await userCmd.execute(interaction)

    expect((interaction as any).reply).toHaveBeenCalledTimes(1)
    const msg = (interaction as any).reply.mock.calls[0][0] as string
    expect(msg).toContain("bob")
    expect(msg).toContain("No date")
  })
})
