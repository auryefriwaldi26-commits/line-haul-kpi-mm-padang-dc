import NextLink from 'next/link'
import { Link, Stack, Text } from '@primer/react'
import { ArrowRightIcon } from '@primer/octicons-react'

export function LineHaulSummary({ routeCount }: { routeCount: number | null }) {
  const ready = routeCount !== null
  const subtitle = !ready
    ? 'Koneksi database rute belum tersedia di environment ini'
    : routeCount === 0
      ? 'Belum ada rute terimpor dari Google Sheets'
      : 'Rute terdaftar dari jadwal Google Sheets'

  return (
    <section aria-label="Ringkasan rute Line Haul">
      <div
        style={{
          backgroundColor: 'var(--bgColor-default)',
          border: 'var(--borderWidth-thin) solid var(--borderColor-default)',
          borderRadius: 'var(--borderRadius-large)',
          boxShadow: 'var(--shadow-resting-small)',
          padding: 'var(--base-size-16)',
        }}
      >
        <Stack
          direction="horizontal"
          align="center"
          justify="space-between"
          gap="normal"
          wrap="wrap"
        >
          <Stack direction="vertical" gap="condensed">
            <Text size="small" style={{ color: 'var(--fgColor-muted)' }}>
              Rute Line Haul · Padang DC
            </Text>
            <Text
              style={{
                fontSize: 'var(--text-title-size-large)',
                fontWeight: 'var(--base-text-weight-semibold)',
                lineHeight: 'var(--text-title-lineHeight-large)',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {ready ? routeCount : '—'}
            </Text>
            <Text size="small" style={{ color: 'var(--fgColor-muted)' }}>
              {subtitle}
            </Text>
          </Stack>
          <Link as={NextLink} href="/line-haul">
            Lihat semua rute <ArrowRightIcon size={12} aria-label="" />
          </Link>
        </Stack>
      </div>
    </section>
  )
}
