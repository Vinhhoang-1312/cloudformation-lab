export interface ParsedCidr {
  ip: number
  prefix: number
}

export function parseCidr(cidr: string): ParsedCidr | null {
  const m = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})\/(\d{1,2})$/.exec(cidr.trim())
  if (!m) return null
  const octets = [1, 2, 3, 4].map((i) => parseInt(m[i], 10))
  if (octets.some((o) => Number.isNaN(o) || o < 0 || o > 255)) return null
  const prefix = parseInt(m[5], 10)
  if (Number.isNaN(prefix) || prefix < 0 || prefix > 32) return null
  const ip = (((octets[0] << 24) | (octets[1] << 16) | (octets[2] << 8) | octets[3]) >>> 0)
  return { ip, prefix }
}

function networkRange({ ip, prefix }: ParsedCidr): [number, number] {
  const mask = prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0
  const network = (ip & mask) >>> 0
  const broadcast = (network | (~mask >>> 0)) >>> 0
  return [network, broadcast]
}

export function isValidCidr(cidr: string): boolean {
  return parseCidr(cidr) !== null
}

/** Real subnet-containment check: does `inner` CIDR fall entirely within `outer` CIDR's address range? */
export function isCidrWithin(outer: string, inner: string): boolean {
  const o = parseCidr(outer)
  const i = parseCidr(inner)
  if (!o || !i) return false
  if (i.prefix < o.prefix) return false
  const [oLo, oHi] = networkRange(o)
  const [iLo, iHi] = networkRange(i)
  return iLo >= oLo && iHi <= oHi
}
