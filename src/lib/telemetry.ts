/** Display-only fixtures. Never use these as a fallback for failed live requests. */
export type BatteryCondition = 'Normal' | 'Warning' | 'Critical'
export type Telemetry = {
  source: 'sample' | 'live'
  voltage: number
  temperature: number
  soc: number
  condition: BatteryCondition
  measuredAt: string | null
}
export const sampleTelemetry: Telemetry = {
  source: 'sample', voltage: 12.68, temperature: 28.4, soc: 92,
  condition: 'Normal', measuredAt: null,
}
export const sampleHistory = {
  '1H': [12.57,12.59,12.58,12.62,12.61,12.64,12.63,12.65,12.64,12.67,12.65,12.66,12.68],
  '6H': [12.48,12.51,12.49,12.57,12.55,12.58,12.62,12.59,12.64,12.61,12.65,12.66,12.68],
  '24H': [12.62,12.58,12.52,12.49,12.53,12.57,12.55,12.59,12.62,12.60,12.65,12.64,12.68],
}
/** Future integration boundary: GET a same-origin server endpoint, never Blynk directly.
 * Validate finite values, units, measurement timestamp, and connection/freshness separately.
 * A missing or stale reading must display unavailable, never be replaced by sample values.
 */
export interface LiveTelemetryResponse {
  deviceConnected: boolean
  blynkConnected: boolean
  reading: Telemetry | null
}
