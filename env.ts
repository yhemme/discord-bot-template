import { createEnv } from "@t3-oss/env-core"
import { z } from "zod"

/*
 * All variables starting with `PUBLIC_` will be defined in the build output.
 * Be aware that t3 doesn't transform the env variables, it just validates them. cf : https://env.t3.gg/docs/introduction#transforms-and-default-values
 */
export const ENV = createEnv({
  server: {
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .prefault("development"),
    HOST:
      process.env["NODE_ENV"] === "production"
        ? z.union([z.union([z.ipv4(), z.ipv6()]), z.url()]).prefault("0.0.0.0")
        : z.string().optional().prefault("localhost"),
    TOKEN: z.string(),
    CLIENT_ID: z.string(),
    GUILD_ID: z.string(),
    // PORT: z.coerce
    //   .number()
    //   .optional()
    //   .prefault(3000)
    //   .refine((port) => port > 0 && port < 65536, "Invalid port number"),
  },
  runtimeEnvStrict: {
    NODE_ENV: process.env["NODE_ENV"],
    HOST: process.env["HOST"],
    TOKEN: process.env["TOKEN"],
    CLIENT_ID: process.env["CLIENT_ID"],
    GUILD_ID: process.env["GUILD_ID"],
  },
  emptyStringAsUndefined: true,
  skipValidation:
    process.env["SKIP_CLIENT_ENV_VALIDATION"] !== undefined ||
    process.env["SKIP_SERVER_ENV_VALIDATION"] !== undefined,
})
