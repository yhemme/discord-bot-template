import { config } from "dotenv"

const NODE_ENV = process.env["NODE_ENV"] ?? "development"

const fileNames = [".env", ".env.local"]
fileNames.push(`.env.${NODE_ENV}`, `.env.${NODE_ENV}.local`)

config({
  path: fileNames,
  override: true,
  encoding: "UTF-8",
})

await import("../env.ts")
