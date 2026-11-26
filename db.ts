import 'server-only'
import { Pool } from 'pg'

const globalForPg = globalThis as unknown as { lineHaulPool?: Pool }
const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL

if (!connectionString) {
  throw new Error('DATABASE_URL atau POSTGRES_URL belum dikonfigurasi.')
}

export const pool = globalForPg.lineHaulPool ?? new Pool({
  connectionString,
  max: 5,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
})

if (process.env.NODE_ENV !== 'production') globalForPg.lineHaulPool = pool
