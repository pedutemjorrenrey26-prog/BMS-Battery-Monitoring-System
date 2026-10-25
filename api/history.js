
import { neon } from '@neondatabase/serverless'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const databaseUrl = process.env.DATABASE_URL

      if (!databaseUrl) {
        return res.status(500).json({
          error: 'Database is not configured.',
        })
      }

      const sql = neon(databaseUrl)
      const rows = await sql`
        SELECT voltage, recorded_at
        FROM battery_history
        ORDER BY recorded_at DESC
        LIMIT 100
      `

      return res.status(200).json({ history: rows.reverse() })
    } catch (error) {
      console.error('History GET error:', error)
      return res.status(500).json({
        error: 'Could not load battery history.',
      })
    }
  }

  if (req.method === 'POST') {
    try {
      const databaseUrl = process.env.DATABASE_URL
      const token = process.env.BLYNK_AUTH_TOKEN

      if (!databaseUrl || !token) {
        return res.status(500).json({
          error: 'Database or Blynk is not configured.',
        })
      }

      const url = new URL('get', 'https://blynk.cloud/external/api/')
      url.searchParams.set('token', token)
      url.searchParams.set('V0', '')

      const response = await fetch(url)

      if (!response.ok) {
        return res.status(502).json({
          error: 'Could not read voltage from Blynk.',
        })
      }

      const text = (await response.text()).trim()
      const voltage = Number(text)

      if (text === '' || !Number.isFinite(voltage) || voltage <= 0) {
        return res.status(502).json({
          error: 'Blynk returned an invalid voltage.',
        })
      }

      const sql = neon(databaseUrl)

      await sql`
        INSERT INTO battery_history (voltage)
        VALUES (${voltage})
      `

      return res.status(200).json({ saved: true, voltage })
    } catch (error) {
      console.error('History POST error:', error)
      return res.status(500).json({
        error: 'Could not save battery history.',
      })
    }
  }

  res.setHeader('Allow', ['GET', 'POST'])
  return res.status(405).json({ error: 'Method not allowed.' })
}
