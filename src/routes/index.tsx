import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { Activity, ArrowDownToLine, ArrowRight, Battery, BatteryCharging, CarFront, Check, CheckCheck, ChevronRight, CircleHelp, Cpu, FlaskConical, Gauge, Info, LayoutDashboard, Menu, Radio, ShieldCheck, Thermometer, Unplug, WifiOff, X, Zap } from 'lucide-react'


export const Route = createFileRoute('/')({ component: App })
type Page = 'dashboard' | 'test-results' | 'system-information'
const pages = [{ id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard }, { id: 'test-results', label: 'Test Results', icon: FlaskConical }, { id: 'system-information', label: 'System Information', icon: Cpu }] as const
const findings = [ ['Average system voltage', '13.92', 'V'], ['Average reference voltage', '13.32', 'V'], ['Average absolute error', '0.628', 'V'], ['Average voltage percentage error', '4.66', '%'] ]
const hardware = [{ icon: Cpu, name: 'LILYGO TTGO T-SIM A7670E R2', role: 'Microcontroller & cellular module', detail: 'Collects sensor readings and transmits battery telemetry.' }, { icon: Zap, name: 'INA219', role: 'Voltage / current sensor', detail: 'Measures electrical parameters from the battery monitoring circuit.' }, { icon: Thermometer, name: 'DS18B20', role: 'Temperature sensor', detail: 'Measures battery temperature in degrees Celsius.' }, { icon: Radio, name: 'GSM communication', role: 'Device connectivity', detail: 'Provides the cellular connection between the device and cloud.' }, { icon: Activity, name: 'Blynk IoT platform', role: 'Cloud telemetry platform', detail: 'Receives device data for monitoring and future dashboard integration.' }]
 type LiveReading = {
  connected: boolean
  voltage?: number
  temperature?: number
  soc?: number
  condition?: string
  updatedAt?: string
  error?: string
}
function App() {

 const [page, setPage] = useState<Page>('dashboard')
 const [menu, setMenu] = useState(false)
 const [help, setHelp] = useState(false)
 const [liveReading, setLiveReading] = useState<LiveReading | null>(null)
const [connectionError, setConnectionError] = useState('')
 useEffect(() => { const sync = () => { const hash = window.location.hash.slice(1); setPage(pages.some(p => p.id === hash) ? hash as Page : 'dashboard') }; sync(); window.addEventListener('hashchange', sync); return () => window.removeEventListener('hashchange', sync) }, [])
useEffect(() => {
  let active = true


  const fetchReading = async () => {
    try {
      const response = await fetch('/api/blynk')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Could not load Blynk readings.')
      }

      if (active) {
        setLiveReading(data)
        setConnectionError(
          data.connected ? '' : 'Your Blynk device is offline.'
        )

        if (
          data.connected &&
          Number.isFinite(Number(data.voltage)) &&
          Number(data.voltage) > 0
        ) {
          const now = Date.now()
          const lastSaved = Number(sessionStorage.getItem('lastVoltageSavedAt') || 0)

          if (now - lastSaved >= 60000) {
            const saveResponse = await fetch('/api/history', {
              method: 'POST',
            })

            if (saveResponse.ok) {
              sessionStorage.setItem('lastVoltageSavedAt', String(now))
            }
          }
        }
      }
    } catch {
      if (active) {
        setLiveReading((previous) =>
          previous ? { ...previous, connected: false } : null
        )
        setConnectionError('Could not connect to the Blynk service.')
      }
    }
  }

  fetchReading()
  const timer = window.setInterval(fetchReading, 10000)

  return () => {
    active = false
    window.clearInterval(timer)
  }
}, [])
 return <div className="app-shell">
  <aside id="primary-sidebar" className={`sidebar ${menu ? 'open' : ''}`}>
<a href="#dashboard" className="brand"><span className="brand-symbol"><Zap size={24} fill="currentColor" /></span><span>Battery<span className="brand-sub">MONITORING SYSTEM</span></span></a>
   <div className="workspace-label">WORKSPACE</div>
   <nav aria-label="Main navigation">{pages.map(p => <a key={p.id} href={`#${p.id}`} onClick={() => setMenu(false)} className={page === p.id ? 'nav-item active' : 'nav-item'} aria-current={page === p.id ? 'page' : undefined}><p.icon size={19}/>{p.label}{page === p.id && <span className="nav-dot"/>}</a>)}</nav>
   <div className="sidebar-project"><div className="small-icon"><CarFront size={20}/></div><strong>Built for the road.</strong><p>Designed for a smarter look<br/>at your battery’s health.</p><span className="tag">12V AUTOMOTIVE SYSTEM</span></div>
   <button className="help-button" onClick={() => setHelp(true)}><CircleHelp size={18}/> About this project <ChevronRight size={16}/></button>
<div className="sidebar-footer"><span className="avatar">BM</span><div>Thesis Project<small>Battery Monitoring System</small></div><span className="version">v1.0</span></div>
  </aside>
  <div className="main-shell">
   <header className="topbar"><div className="breadcrumb"><button className="mobile-menu icon-button" onClick={() => setMenu(!menu)} aria-label="Toggle navigation" aria-expanded={menu} aria-controls="primary-sidebar">{menu ? <X/> : <Menu/>}</button><span>Workspace</span><ChevronRight size={14}/><strong>{pages.find(p => p.id === page)?.label}</strong></div><span className={`top-status ${liveReading?.connected ? 'online' : 'offline'}`}><span className={`status-dot ${liveReading?.connected ? 'green' : 'red'}`}/>{liveReading?.connected ? 'Live environment' : 'Offline environment'}</span></header>
   <main id="main-content">
    <div className="page-heading"><div><div className="eyebrow">AUTOMOTIVE BATTERY MONITORING</div><h1>{page === 'dashboard' ? 'Battery overview' : page === 'test-results' ? 'Test results' : 'System information'}</h1><p>{page === 'dashboard' ? 'Your battery’s vital signs. All in one place.' : page === 'test-results' ? 'A closer look at the findings behind the system.' : 'The hardware and connectivity behind Battery Monitoring System.'}</p></div><span className="outline-pill"><CarFront size={17}/> Conventional 12V battery</span></div>
    <div className="demo-banner"><div className="banner-icon">{liveReading?.connected ? <Radio size={21} /> : <Unplug size={21} />}</div><div><strong>{liveReading?.connected ? 'Blynk Connected' : 'Waiting for Device Connection'}</strong><p>{liveReading?.connected ? 'Battery readings are being retrieved from Blynk.' : connectionError || 'Checking your device connection...'}</p></div><span className="sample-pill">{liveReading?.connected ? 'LIVE DATA' : 'NOT CONNECTED'}</span></div>
   {page === 'dashboard' ? <Dashboard liveReading={liveReading}/> : page === 'test-results' ? <Results/> : <SystemInfo/>}
    <footer className="page-footer"><span><ShieldCheck size={14}/> Developed for academic research</span><span>Battery Monitoring System <b>·</b> IoT-Based Battery Monitoring System</span></footer>
   </main>
  </div>
  {help && <div className="modal-backdrop" onClick={() => setHelp(false)}><section role="dialog" aria-modal="true" aria-labelledby="about-title" className="modal" onClick={event => event.stopPropagation()} onKeyDown={event => {
    if (event.key === 'Escape') setHelp(false)
    if (event.key === 'Tab') {
      const controls = event.currentTarget.querySelectorAll<HTMLElement>('button, a[href]')
      const first = controls[0], last = controls[controls.length - 1]
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus() }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus() }
    }
   }}><button autoFocus className="icon-button close-button" onClick={() => setHelp(false)} aria-label="Close about dialog"><X/></button><span className="eyebrow">THE THESIS PROJECT</span><h2 id="about-title">Battery Monitoring System</h2><p>Development of IoT-Based Battery Monitoring System for Conventional 12V Automotive Battery.</p><p>This demonstration uses static sample telemetry. The test results are the supplied thesis findings. Device and Blynk connections are not configured.</p><a className="primary-button" href="#system-information" onClick={() => setHelp(false)}>Explore the system <ArrowRight size={16}/></a></section></div>}
 </div>
}
function Dashboard({
  liveReading,
}: {
  liveReading: LiveReading | null
}) {
const [range, setRange] = useState<'1H' | '6H' | '24H'>('1H')
const [table, setTable] = useState(false)
const [history, setHistory] = useState<{ voltage: number; recorded_at: string }[]>([])
useEffect(() => {
  const loadHistory = async () => {
    try {
      const response = await fetch('/api/history')
      if (!response.ok) return

      const data = await response.json()
      if (!Array.isArray(data.history)) return

      const readings = data.history
        .map((item: { voltage: unknown; recorded_at: unknown }) => ({
          voltage: Number(item.voltage),
          recorded_at: String(item.recorded_at),
        }))
        .filter((item: { voltage: number; recorded_at: string }) =>
          Number.isFinite(item.voltage) &&
          item.recorded_at !== 'undefined' &&
          !Number.isNaN(Date.parse(item.recorded_at))
        )

      setHistory(readings)
    } catch (error) {
      console.error('Failed to load voltage history:', error)
    }
  }

  loadHistory()
  const interval = setInterval(loadHistory, 60000)

  return () => clearInterval(interval)
}, [])
 const voltage = liveReading?.voltage
const temperature = liveReading?.temperature
const soc = liveReading?.soc
const condition = liveReading?.condition
const values = history
  .filter(item => {
    const age = Date.now() - new Date(item.recorded_at).getTime()
    const limit = range === '1H' ? 3600000 : range === '6H' ? 21600000 : 86400000
    return age >= 0 && age <= limit
  })
  .map(item => item.voltage)

const minVoltage = values.length ? Math.min(...values) : 0
const maxVoltage = values.length ? Math.max(...values) : 1
const voltageRange = Math.max(maxVoltage - minVoltage, 0.2)

const points = values
  .map((v, i) => {
    const x = 52 + i * (655 / Math.max(values.length - 1, 1))
    const y = 185 - ((v - minVoltage) / voltageRange) * 140
    return `${x},${y}`
  })
  .join(' ')
 return <>
 <div className="section-label"><span><span className="status-dot blue"/> BATTERY TELEMETRY</span><span>Illustrative readings · Not live</span></div>
 <div className="metrics-grid">
 <Metric title="Battery voltage" icon={Zap} value={typeof voltage === 'number' ? voltage.toFixed(2) : '--'} unit="V" description={typeof voltage === 'number' ? 'Live Blynk reading' : 'Waiting for live reading'} accent="blue"><div className="mini-bars">{[25,32,27,42,35,48,44,53].map((h,i)=><span key={i} style={{height:`${h}%`}} />)}</div></Metric>

<Metric title="Battery temperature" icon={Thermometer} value={typeof temperature === 'number' ? temperature.toFixed(1) : '--'} unit="°C" description={typeof temperature === 'number' ? 'Live Blynk reading' : 'Waiting for live reading'} accent="orange"><div className="temp-track"><span style={{width:`${Math.min(100,Math.max(0,((temperature ?? 0)/100)*100))}%`}} /></div></Metric>

<Metric title="State of charge" icon={BatteryCharging} value={typeof soc === 'number' ? String(soc) : '--'} unit="%" description={typeof soc === 'number' ? 'Live Blynk reading' : 'Waiting for live reading'} accent="cyan"><div className="charge-track"><span style={{width:`${Math.min(100,Math.max(0,soc ?? 0))}%`}} /></div></Metric>

<Metric title="Battery condition" icon={ShieldCheck} value={condition ?? '--'} unit="" description={condition ? 'Reported by Blynk' : 'Waiting for live reading'} accent="green"><span className="condition-caption">{condition ? 'Device-reported status' : 'No status received'}</span></Metric>
 </div>
 <div className="dashboard-middle">
  <section className="panel history-panel"><div className="panel-heading"><div><h2>Voltage history <span className="tiny-tag">DATABASE</span></h2><p>A snapshot of battery voltage over time</p></div><div className="segmented" aria-label="History period">{(['1H','6H','24H'] as const).map(r=><button key={r} onClick={()=>setRange(r)} className={r===range?'selected':''} aria-pressed={r===range}>{r}</button>)}</div></div>
   <div className="chart-legend"><span><span className="status-dot blue"/> Battery voltage</span><span>Saved readings: {values.length}</span></div>
   <svg className="voltage-chart" viewBox="0 0 730 235" role="img" aria-label={`Saved ${range} voltage history with ${values.length} readings.`}><defs><linearGradient id="area" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#438bff" stopOpacity=".22"/><stop offset="1" stopColor="#438bff" stopOpacity="0"/></linearGradient></defs>{Array.from({ length: 5 }, (_, i) => minVoltage + voltageRange - (i * voltageRange / 4)).map((v, i) => (
  <g key={i}>
    <line x1="52" x2="707" y1={17 + i * 42} y2={17 + i * 42} stroke="#293344" strokeDasharray="3 5" />
    <text x="0" y={21 + i * 42} fill="#8491a7" fontSize="11">{v.toFixed(2)} V</text>
  </g>
))}<polygon points={`52,191 ${points} 700,191`} fill="url(#area)"/><polyline points={points} fill="none" stroke="#4c96ff" strokeWidth="3" strokeLinejoin="round"/>
{values.length === 1 && (
  <circle cx="52" cy="185" r="5" fill="#4c96ff" stroke="#ffffff" strokeWidth="2" />
)}{['Start','¼ window','½ window','¾ window','End'].map((t,i)=><text key={t} x={52+i*162} y="223" fill="#8491a7" fontSize="11" textAnchor={i===0?'start':i===4?'end':'middle'}>{t}</text>)}</svg>
   <div className="chart-footer"><span><Info size={13}/> Showing saved database readings for the selected period.</span><button className="text-button" onClick={()=>setTable(!table)}>{table?'Hide data':'View data'} <ChevronRight size={14}/></button></div>
   {table && <div className="table-scroll"><table><caption>Saved {range} history</caption><thead><tr><th>Record</th><th>Voltage (V)</th></tr></thead><tbody>{values.map((v,i)=><tr key={i}><td>{i+1}</td><td>{v.toFixed(2)}</td></tr>)}</tbody></table></div>}
  </section>
<section className="panel connection-panel">
  <div className="panel-heading">
    <div><h2>System connection</h2><p>Your device-to-dashboard link</p></div>
    <Radio size={19} className="muted"/>
  </div>
 <Connection icon={Cpu} title="IoT device" subtitle="LILYGO TTGO T-SIM A7670E R2" connected={Boolean(liveReading?.connected)}/>
<Connection icon={Activity} title="Blynk IoT" subtitle="Cloud platform" connected={liveReading?.connected === true}/>
  <div className="connection-note">
    {liveReading?.connected ? <Activity size={18}/> : <WifiOff size={18}/>}
    <p>
      {liveReading?.connected ? 'Blynk device connected.' : 'No live connection established.'}
      <br/>
      <span>
        {liveReading?.connected
          ? 'Live telemetry is being retrieved.'
          : 'Waiting for Blynk connection status.'}
      </span>
    </p>
  </div>
  <a href="#system-information" className="connection-link">View system information <ArrowRight size={16}/></a>
</section>
 </div>
 <div className="dashboard-bottom"><section className="panel condition-panel"><div className="panel-heading"><div><h2>Understanding battery status</h2><p>A clear indicator for every condition</p></div><CircleHelp size={18} className="muted"/></div><div className="condition-grid"><div><span className="status-name green-text"><span className="status-dot green"/>Normal</span><p>Readings within your<br/>validated operating limits.</p></div><div><span className="status-name amber-text"><span className="status-dot amber"/>Warning</span><p>Readings need attention.<br/>Inspect the battery.</p></div><div><span className="status-name red-text"><span className="status-dot red"/>Critical</span><p>Readings outside safe limits.<br/>Prompt inspection needed.</p></div></div><p className="threshold-note">Live status rules require validated thresholds for battery type and engine state.</p></section><a href="#test-results" className="research-card"><span className="research-icon"><FlaskConical size={23}/></span><span className="eyebrow">FROM THE RESEARCH</span><h2>Built on testing.<br/>Backed by data.</h2><p>Explore the system’s measured<br/>performance in our thesis study.</p><span className="research-link">View test results <ArrowRight size={17}/></span></a></div>
 </>
}
function Metric({title,icon:Icon,value,unit,description,accent,children}: {title:string;icon:typeof Zap;value:string;unit:string;description:string;accent:string;children:React.ReactNode}) {return <section className={`panel metric ${accent}`}><div className="metric-top"><span>{title}</span><span className="metric-icon"><Icon size={18}/></span></div><div className={`metric-value ${value==='Normal'?'text-value':''}`}>{value}<span>{unit}</span></div><p>{description}</p><div className="metric-visual">{children}</div></section>}
function Connection({icon:Icon,title,subtitle,connected}: {icon:typeof Cpu;title:string;subtitle:string;connected:boolean}) {return <div className="connection-row"><span className="connection-icon"><Icon size={19}/></span><div><strong>{title}</strong><small>{subtitle}</small></div><span className={connected ? 'connected' : 'disconnected'}><span className="status-dot"/>{connected ? 'Connected' : 'Disconnected'}</span></div>}
function Results() {
 const download = () => { const csv = 'Metric,Value,Unit\n'+findings.map(r=>r.join(',')).join('\n'); const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8;'})); const a=document.createElement('a'); a.href=url; a.download='autovolt-thesis-results.csv'; a.click(); URL.revokeObjectURL(url) }
 return <><div className="section-label"><span><FlaskConical size={15}/> THESIS FINDINGS</span><span>Reported study averages · Not live telemetry</span></div><div className="metrics-grid results-metrics">{findings.map(([title,value,unit])=><Metric key={title} title={title} icon={Gauge} value={value} unit={unit} description="Reported thesis finding" accent="blue"><span className="result-caption"><CheckCheck size={16}/> Study average</span></Metric>)}</div><section className="panel results-panel"><div className="panel-heading"><div><h2>System performance summary</h2><p>Reported results from the automotive battery monitoring study</p></div><button className="secondary-button" onClick={download}><ArrowDownToLine size={16}/> Export CSV</button></div><div className="table-scroll"><table><thead><tr><th>Measurement</th><th>Reported average</th><th>Source</th></tr></thead><tbody>{findings.map(([name,value,unit])=><tr key={name}><td>{name}</td><td className="table-value">{value} {unit}</td><td><span className="tiny-tag">THESIS FINDING</span></td></tr>)}</tbody></table></div><div className="results-note"><Info size={19}/><p>These are the supplied thesis averages, not readings from a connected device. Absolute and percentage errors are reported study statistics; they are not recalculated from the two average voltages. Raw trial data and the study methodology are not included in this interface.</p></div></section><section className="thesis-strip"><FlaskConical size={26}/><div><span className="eyebrow">RESEARCH TITLE</span><h2>Development of IoT-Based Battery Monitoring System for Conventional 12V Automotive Battery</h2></div></section></>
}
function SystemInfo() {return <><div className="section-label"><span><Cpu size={15}/> SYSTEM ARCHITECTURE</span><span>12V automotive battery · IoT monitoring</span></div><section className="architecture panel"><div><span className="architecture-node"><Battery size={25}/></span><strong>12V battery</strong><small>Voltage & temperature</small></div><ArrowRight className="flow-arrow"/><div><span className="architecture-node"><Cpu size={25}/></span><strong>IoT device</strong><small>INA219 + DS18B20</small></div><ArrowRight className="flow-arrow"/><div><span className="architecture-node"><Radio size={25}/></span><strong>GSM → Blynk</strong><small>Cloud telemetry</small></div><ArrowRight className="flow-arrow"/><div><span className="architecture-node"><LayoutDashboard size={25}/></span><strong>Battery Monitoring System</strong><small>Future secure connection</small></div></section><div className="system-grid"><section className="panel"><div className="panel-heading"><div><h2>Hardware & platform</h2><p>The components in the proposed system</p></div></div>{hardware.map(({icon:Icon,name,role,detail})=><div className="hardware-row" key={name}><span className="connection-icon"><Icon size={21}/></span><div><h3>{name}</h3><span className="hardware-role">{role}</span><p>{detail}</p></div></div>)}</section><div className="system-side"><section className="panel connection-panel"><div className="panel-heading"><div><h2>Connection status</h2><p>No credentials configured in this app</p></div></div><Connection icon={Cpu} title="IoT device" subtitle="GSM communication" connected={false}/><Connection icon={Activity} title="Blynk IoT" subtitle="Cloud platform" connected={false}/><div className="connection-note"><Unplug size={18}/><p>Demo Mode — Not Connected</p></div></section><section className="panel security-panel"><ShieldCheck size={26}/><h2>Ready for a secure connection</h2><p>The future integration runs through a server endpoint. Your Blynk authentication token stays on the server and is never shipped to a browser.</p><ul><li><Check size={15}/> Separate sample and live telemetry</li><li><Check size={15}/> Validate readings and freshness</li><li><Check size={15}/> Show disconnected and stale states</li></ul><p className="muted">Deployment and Blynk setup instructions are included in the project README.</p></section></div></div></>}
