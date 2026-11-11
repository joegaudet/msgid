#!/usr/bin/env node
import { run } from './cli.js'

try {
  process.stdout.write(await run(process.argv.slice(2)))
} catch (error) {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
}
