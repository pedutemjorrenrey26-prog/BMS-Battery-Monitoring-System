
import { createFileRoute } from '@tanstack/react-router'
import { neon } from '@neondatabase/serverless'

export const Route = createFileRoute('/api/history')({
  server: {
    handlers: {
      GET: async () => {
        try {
          const databaseUrl = process.env.DATABASE_URL

          if (!databaseUrl) {
            return Response.json(
              { error: 'Database is not configured.' },
              { status: 500 },
            )
          }

          const sql = neon(databaseUrl)
          const rows = await sql`
            SELECT voltage, recorded_at
            FROM battery_history
            ORDER BY recorded_at DESC
            LIMIT 100
          `

          return Response.json({ history: rows.reverse() })
        } catch (error) {
          console.error('History GET error:', error)
          return Response.json(
            {
              error: 'Could not load battery history.',
              details: error instanceof Error ? error.message : String(error),
            },
            { status: 500 },
          )
        }
      },

      POST: async () => {
        try {
          const databaseUrl = process.env.DATABASE_URL
          const token = process.env.BLYNK_AUTH_TOKEN

          if (!databaseUrl || !token) {
            return Response.json(
              { error: 'Database or Blynk is not configured.' },
              { status: 500 },
            )
          }

          const url = new URL('get', 'https://blynk.cloud/external/api/')
          url.searchParams.set('token', token)
          url.searchParams.set('V0', '')

          const response = await fetch(url)

          if (!response.ok) {
            return Response.json(
              { error: 'Could not read voltage from Blynk.' },
              { status: 502 },
            )
          }

          const text = (await response.text()).trim()
          const voltage = Number(text)

          if (text === '' || !Number.isFinite(voltage) || voltage <= 0) {
            return Response.json(
              { error: 'Blynk returned an invalid voltage.' },
              { status: 502 },
            )
          }

          const sql = neon(databaseUrl)

          await sql`
            INSERT INTO battery_history (voltage)
            VALUES (${voltage})
          `

          return Response.json({ saved: true, voltage })
        } catch (error) {
          console.error('History POST error:', error)
          return Response.json(
            {
              error: 'Could not save battery history.',
              details: error instanceof Error ? error.message : String(error),
            },
            { status: 500 },
          )
        }
      },
    },
  },
})
