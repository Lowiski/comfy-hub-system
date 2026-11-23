import { networkInterfaces, type NetworkInterfaceInfo } from 'node:os'
import { app } from './app'
import { env } from './config/env'
import { ensureDatabase } from './db'

function lanAddresses(): string[] {
  return Object.values(networkInterfaces())
    .flat()
    .filter((details): details is NetworkInterfaceInfo => Boolean(details))
    .filter(
      (details) =>
        details.family === 'IPv4' &&
        !details.internal &&
        !details.address.startsWith('169.254.'),
    )
    .map((details) => details.address)
}

await ensureDatabase()

const server = app.listen(env.PORT, '0.0.0.0', () => {
  console.log(`ComfyHub running at http://localhost:${env.PORT}`)
  for (const address of lanAddresses()) {
    console.log(`LAN: http://${address}:${env.PORT}`)
  }
})

function shutdown() {
  server.close(() => process.exit(0))
  setTimeout(() => process.exit(1), 10_000).unref()
}

process.on('SIGTERM', shutdown)
process.on('SIGINT', shutdown)
