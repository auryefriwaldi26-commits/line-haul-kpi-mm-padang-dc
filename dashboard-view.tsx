'use client'

import { useEffect, useState } from 'react'

type Summary = {
  trips: number
  stationRecords: number
  statuses: { fms_status: string; trips: number }[]
  latestImports: { source_type: string; source_file: string; rows_received: number; rows_processed: number; rows_rejected: number; completed_at: string | null }[]
  schedule: { row_count: number; imported_at: string; source_sheet_name: string } | null
}

const emptySummary: Summary = { trips: 0, stationRecords: 0, statuses: [], latestImports: [], schedule: null }

export function DashboardView() {
  const [summary, setSummary] = useState<Summary>(emptySummary)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [key, setKey] = useState('')
  const [files, setFiles] = useState<{ menunggu?: File; handover?: File; ended?: File }>({})
  const [message, setMessage] = useState('')

  async function refresh() {
    setLoading(true)
    try {
      const response = await fetch('/api/linehaul/summary', { cache: 'no-store' })
      if (!response.ok) throw new Error('Database belum dapat dibaca. Periksa DATABASE_URL di Vercel.')
      setSummary(await response.json())
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Gagal memuat ringkasan dashboard.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void refresh() }, [])

  async function runAction(path: string, body?: FormData) {
    setBusy(true)
    setMessage('')
    try {
      const response = await fetch(path, {
        method: 'POST',
        headers: { 'x-linehaul-import-key': key },
        body,
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Proses gagal.')
      setMessage(data.message || 'Proses berhasil.')
      await refresh()
      return true
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Proses gagal.')
      return false
    } finally {
      setBusy(false)
    }
  }

  async function importFiles(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!Object.values(files).some(Boolean)) {
      setMessage('Pilih minimal satu file CSV FMS.')
      return
    }
    const body = new FormData()
    if (files.menunggu) body.append('menunggu', files.menunggu)
    if (files.handover) body.append('handover', files.handover)
    if (files.ended) body.append('ended', files.ended)
    if (await runAction('/api/linehaul/import-fms', body)) setFiles({})
  }

  const cards = [
    ['LH TRIP', summary.trips.toLocaleString('id-ID'), 'Trip unik tersimpan'],
    ['STATION RECORD', summary.stationRecords.toLocaleString('id-ID'), 'Data per titik perjalanan'],
    ['OTD / OTA / OTT', 'Belum dihitung', 'Menunggu pemetaan jadwal dan aktual'],
    ['D5 UTILIZATION', 'Belum dihitung', 'Menunggu pemetaan Master Schedule'],
  ]

  return (
    <main className="lh-shell">
      <header className="lh-header">
        <div>
          <p className="lh-eyebrow">OPERATIONS CONTROL TOWER</p>
          <h1>LINE HAUL PERFORMANCE</h1>
          <p className="lh-subtitle">Padang DC · Monitoring perjalanan dan KPI operasional</p>
        </div>
        <button className="lh-secondary" onClick={() => void refresh()} disabled={loading}>↻ Refresh</button>
      </header>

      <section className="lh-grid" aria-label="Ringkasan operasional">
        {cards.map(([label, value, note]) => (
          <article className="lh-card" key={label}>
            <p>{label}</p>
            <strong>{loading && label !== 'OTD / OTA / OTT' && label !== 'D5 UTILIZATION' ? '…' : value}</strong>
            <small>{note}</small>
          </article>
        ))}
      </section>

      <section className="lh-panel">
        <div className="lh-panel-head">
          <div><h2>MASTER SCHEDULE</h2><p>Google Spreadsheet tetap menjadi sumber data utama dan hanya dibaca.</p></div>
          <span className="lh-tag">READ ONLY</span>
        </div>
        <div className="lh-schedule-row">
          <div>
            <strong>{summary.schedule ? `${summary.schedule.row_count.toLocaleString('id-ID')} baris tersinkron` : 'Belum tersinkron'}</strong>
            <small>{summary.schedule ? `${summary.schedule.source_sheet_name} · ${new Date(summary.schedule.imported_at).toLocaleString('id-ID')}` : 'Sinkronkan untuk menyimpan snapshot ke PostgreSQL.'}</small>
          </div>
          <button className="lh-primary" onClick={() => void runAction('/api/linehaul/sync-schedule')} disabled={busy || !key}>Sync Master Schedule</button>
        </div>
      </section>

      <section className="lh-panel">
        <div className="lh-panel-head">
          <div><h2>FMS DATA IMPORT</h2><p>Unggah ekspor FMS. Prioritas status: ENDED → HANDOVER → MENUNGGU.</p></div>
          <span className="lh-tag">CSV</span>
        </div>
        <form onSubmit={importFiles} className="lh-form">
          <label>MENUNGGU<input type="file" accept=".csv,text/csv" onChange={(event) => setFiles((current) => ({ ...current, menunggu: event.target.files?.[0] }))} /></label>
          <label>HANDOVER<input type="file" accept=".csv,text/csv" onChange={(event) => setFiles((current) => ({ ...current, handover: event.target.files?.[0] }))} /></label>
          <label>ENDED<input type="file" accept=".csv,text/csv" onChange={(event) => setFiles((current) => ({ ...current, ended: event.target.files?.[0] }))} /></label>
          <label className="lh-key">Kunci akses import dan sinkronisasi<input type="password" value={key} onChange={(event) => setKey(event.target.value)} placeholder="LINE_HAUL_IMPORT_KEY" autoComplete="off" /></label>
          <button className="lh-primary" type="submit" disabled={busy || !key}>{busy ? 'Memproses…' : 'Import FMS'}</button>
        </form>
        {message && <p className="lh-message" role="status">{message}</p>}
      </section>

      <section className="lh-panel">
        <div className="lh-panel-head"><div><h2>IMPORT HISTORY</h2><p>Riwayat pemrosesan dari PostgreSQL.</p></div></div>
        {summary.latestImports.length ? (
          <div className="lh-table-wrap"><table>
            <thead><tr><th>Sumber</th><th>File</th><th>Diterima</th><th>Diproses</th><th>Ditolak</th><th>Waktu</th></tr></thead>
            <tbody>{summary.latestImports.map((item, index) => <tr key={`${item.source_file}-${index}`}>
              <td>{item.source_type}</td><td>{item.source_file}</td><td>{item.rows_received}</td><td>{item.rows_processed}</td><td>{item.rows_rejected}</td>
              <td>{item.completed_at ? new Date(item.completed_at).toLocaleString('id-ID') : '—'}</td>
            </tr>)}</tbody>
          </table></div>
        ) : <p className="lh-empty">Belum ada data import FMS.</p>}
      </section>

      <footer className="lh-footer">Master Schedule tidak ditulis kembali ke Google Spreadsheet. KPI OTD, OTA, OTT, dan D5 akan diaktifkan setelah pemetaan kolom jadwal dan aktual divalidasi.</footer>
    </main>
  )
}
