import { REST, Routes } from "discord.js"
import { getCommandsFromFolders } from "../lib/commands-utils.js"

function parseArgs(): { mode: "global" | "test" } {
  const args = process.argv.slice(2)

  if (args.includes("--test")) {
    return { mode: "test" }
  }

  if (args.includes("--global")) {
    return { mode: "global" }
  }

  // Show help if no valid args or help requested
  if (args.includes("--help") || args.includes("-h") || args.length === 0) {
    console.log(`
Usage: npm run deploy [--global|--test]

Options:
  --global    Deploy commands globally (available in all servers, takes up to 1 hour)
  --test      Deploy commands to test guild (instant updates, requires GUILD_ID in env)
  --help, -h  Show this help message

Examples:
  npm run deploy --global
  npm run deploy --test
`)
    process.exit(0)
  }

  console.error("Invalid argument. Use --global or --test")
  process.exit(1)
}

async function run(): Promise<void> {
  await import("./load-env.ts")
  const { mode } = parseArgs()
  await deploy(mode)
}

// and deploy your commands!
async function deploy(mode: "global" | "test"): Promise<void> {
  try {
    if (!process.env.TOKEN || !process.env.CLIENT_ID) {
      throw new Error("Missing TOKEN or CLIENT_ID in environment variables")
    }

    const rest = new REST().setToken(process.env.TOKEN)

    const commands = await getCommandsFromFolders()
    const formattedCommands = commands.map((c) => c.data.toJSON())

    console.log(
      `Started refreshing ${formattedCommands.length} application (/) commands.`
    )

    if (mode === "test") {
      if (!process.env.GUILD_ID) {
        throw new Error("GUILD_ID is required for test deployment")
      }
      const data = (await rest.put(
        Routes.applicationGuildCommands(
          process.env.CLIENT_ID!,
          process.env.GUILD_ID!
        ),
        { body: formattedCommands }
      )) as unknown[]
      console.log(
        `Successfully reloaded ${data.length} guild application (/) commands for guild ${process.env.GUILD_ID}.`
      )
    } else {
      const data = (await rest.put(
        Routes.applicationCommands(process.env.CLIENT_ID!),
        { body: formattedCommands }
      )) as unknown[]
      console.log(
        `Successfully reloaded ${data.length} global application (/) commands.`
      )
    }
  } catch (error) {
    console.error(error)
  }
}

run()
