import { REST, Routes } from "discord.js"

function parseArgs(): { mode: "global" | "test"; commandIds: string[] } {
  const args = process.argv.slice(2)

  if (args.includes("--help") || args.includes("-h")) {
    console.log(`
Usage: tsx scripts/unregister-commands.ts [--global|--test] <commandId1> [commandId2] ...

Options:
  --global    Delete global commands (available in all servers)
  --test      Delete test guild commands (requires GUILD_ID in env)
  --help, -h  Show this help message

Examples:
  tsx scripts/unregister-commands.ts --global 1234567890123456789
  tsx scripts/unregister-commands.ts --test 1234567890123456789 9876543210987654321
`)
    process.exit(0)
  }

  let mode: "global" | "test" | null = null
  const commandIds: string[] = []

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    if (arg === "--global") {
      mode = "global"
    } else if (arg === "--test") {
      mode = "test"
    } else if (!arg.startsWith("--")) {
      commandIds.push(arg)
    }
  }

  if (!mode) {
    console.error("Error: Must specify --global or --test")
    console.log("Use --help for usage information")
    process.exit(1)
  }

  if (commandIds.length === 0) {
    console.error("Error: Must provide at least one command ID to delete")
    console.log("Use --help for usage information")
    process.exit(1)
  }

  return { mode, commandIds }
}

async function run(): Promise<void> {
  await import("./load-env.ts")
  const { mode, commandIds } = parseArgs()
  await unregister(mode, commandIds)
}

async function unregister(
  mode: "global" | "test",
  commandIds: string[]
): Promise<void> {
  if (!process.env.TOKEN || !process.env.CLIENT_ID) {
    throw new Error("Missing TOKEN or CLIENT_ID in environment variables")
  }

  const rest = new REST().setToken(process.env.TOKEN)
  const clientId = process.env.CLIENT_ID
  const guildId = process.env.GUILD_ID

  if (mode === "test") {
    if (!guildId) {
      throw new Error("Missing GUILD_ID for test commands")
    }

    for (const commandId of commandIds) {
      try {
        await rest.delete(
          Routes.applicationGuildCommand(clientId, guildId, commandId)
        )
        console.log(`Successfully deleted guild command: ${commandId}`)
      } catch (error) {
        console.error(`Failed to delete guild command ${commandId}:`, error)
      }
    }
  } else if (mode === "global") {
    for (const commandId of commandIds) {
      try {
        await rest.delete(Routes.applicationCommand(clientId, commandId))
        console.log(`Successfully deleted global command: ${commandId}`)
      } catch (error) {
        console.error(`Failed to delete global command ${commandId}:`, error)
      }
    }
  }
}

run().catch(console.error)
