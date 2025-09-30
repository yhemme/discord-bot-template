import { promises as fs } from "node:fs"
import path from "node:path"

// Recursively collect command base names (without extension) from commands/ root and subfolders
export async function collectCommandNames(dir: string): Promise<Set<string>> {
  const names = new Set<string>()
  const stack: string[] = [dir]
  while (stack.length) {
    const current = stack.pop() as string
    const entries = await fs.readdir(current, { withFileTypes: true })
    for (const ent of entries) {
      const full = path.join(current, ent.name)
      if (ent.isDirectory()) {
        stack.push(full)
      } else if (
        ent.isFile() &&
        (ent.name.endsWith(".ts") || ent.name.endsWith(".js"))
      ) {
        names.add(path.parse(ent.name).name)
      }
    }
  }
  return names
}

// Validate and normalize a command name against Discord constraints and duplicates
export function validateCommandName(
  input: string,
  existingNames: Set<string>
): { ok: true; value: string } | { ok: false; reason: string } {
  const normalized = input.toLowerCase().trim().replace(/\s+/g, "-")
  if (!/^[a-z0-9_-]{1,32}$/.test(normalized)) {
    return {
      ok: false,
      reason:
        "Invalid command name. Use 1-32 chars: a-z, 0-9, hyphen (-), underscore (_).",
    }
  }
  if (existingNames.has(normalized)) {
    return {
      ok: false,
      reason: `A command named "${normalized}" already exists. Choose a different name.`,
    }
  }
  return { ok: true, value: normalized }
}

// Validate subfolder name under commands/
export function validateFolderName(name: string): boolean {
  return /^[A-Za-z0-9_-]+$/.test(name)
}

// Compute relative import path from targetDir to lib/commands-utils.ts (posix normalized)
export function computeImportPath(
  projectRoot: string,
  targetDir: string
): string {
  const raw = path.relative(
    targetDir,
    path.join(projectRoot, "lib", "commands-utils.ts")
  )
  const normalized =
    raw.startsWith(".") || raw.startsWith("/") ? raw : `./${raw}`
  return normalized.replace(/\\/g, "/")
}
