import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/api/blynk')({
  server: {
    handlers: {
      GET: async () => {
        const token = process.env.BLYNK_AUTH_TOKEN

        if (!token) {
          return Response.json(
            {
              connected: false,
              error: 'BLYNK_AUTH_TOKEN is not configured.',
            },
            { status: 500 },
          )
        }

        const base = 'https://blynk.cloud/external/api/'

        try {
          const readPin = async (pin: string) => {
            const url = new URL('get', base)
            url.searchParams.set('token', token)
            url.searchParams.set(pin, '')

            const response = await fetch(url)

            if (!response.ok) {
              throw new Error('Blynk request failed')
            }

            return (await response.text()).trim()
          }

          const [voltage, temperature, soc, condition, onlineResponse] =
            await Promise.all([
              readPin('V0'),
              readPin('V1'),
              readPin('V2'),
              readPin('V3'),
              fetch(
                `${base}isHardwareConnected?token=${encodeURIComponent(token)}`,
              ),
            ])

          if (!onlineResponse.ok) {
            throw new Error('Could not check device connection')
          }

          const connected =
            (await onlineResponse.text()).trim().toLowerCase() === 'true'

          return Response.json({
            connected,
            voltage: Number(voltage),
            temperature: Number(temperature),
            soc: Number(soc),
            condition,
            updatedAt: new Date().toISOString(),
          })
        } catch {
          return Response.json(
            {
              connected: false,
              error: 'Could not retrieve live readings from Blynk.',
            },
            { status: 502 },
          )
        }
      },
    },
  },
})