import { execFile } from 'child_process'
import { promisify } from 'util'

const BUSCTL_TIMEOUT_MS = 2000

const execFileAsync = promisify(execFile)

/**
 * Raw output of calling `method` on the system bus (read it with `parseBusctlValues`).
 * Rejects when busctl or the service is missing, fails or takes too long.
 */
export function callMethod(
  service: string,
  path: string,
  iface: string,
  method: string
): Promise<string> {
  return busctl(['call', service, path, iface, method])
}

/**
 * Raw output of reading `properties` from the system bus, one value per line in the same
 * order (read it with `parseBusctlValues`). Rejects like `callMethod`.
 */
export function getProperties(
  service: string,
  path: string,
  iface: string,
  properties: string[]
): Promise<string> {
  return busctl(['get-property', service, path, iface, ...properties])
}

async function busctl(args: string[]): Promise<string> {
  const { stdout } = await execFileAsync('busctl', ['--system', '--json=short', ...args], {
    timeout: BUSCTL_TIMEOUT_MS
  })
  return stdout
}
