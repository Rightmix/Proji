// Fails if a production build contains E2E-only test auth or privileged Supabase keys.
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
const dir = 'dist/assets'
const bad = [/proji-test-session/, /TestProviders/, /service_role/, /SUPABASE_SERVICE/]
let failed = false
for (const f of readdirSync(dir)) {
  if (!f.endsWith('.js')) continue
  const src = readFileSync(join(dir, f), 'utf8')
  for (const re of bad)
    if (re.test(src)) {
      console.error(`✗ ${f} contains ${re}`)
      failed = true
    }
}
if (failed) process.exit(1)
console.log('✓ production bundle contains no test-auth code or privileged keys')
