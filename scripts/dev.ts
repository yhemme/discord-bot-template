process.env["NODE_ENV"] = process.env["NODE_ENV"] ?? "development"

async function run(): Promise<void> {
  await import("./load-env.ts")
  await import("../index.ts")
}

run()
