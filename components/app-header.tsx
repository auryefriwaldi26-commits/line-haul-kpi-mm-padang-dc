'use client'

import { Label, Link, Stack, Text } from '@primer/react'
import { PackageIcon } from '@primer/octicons-react'
import NextLink from 'next/link'

export function AppHeader() {
  return (
    <header
      style={{
        backgroundColor: 'var(--bgColor-muted)',
        borderBottom:
          'var(--borderWidth-thin) solid var(--borderColor-default)',
      }}
    >
      <div
        style={{
          maxWidth: 1280,
          margin: '0 auto',
          paddingInline: 'var(--base-size-24)',
          paddingBlock: 'var(--base-size-12)',
        }}
      >
        <Stack direction="horizontal" align="center" justify="space-between">
          <NextLink
            href="/"
            style={{ color: 'var(--fgColor-default)', textDecoration: 'none' }}
          >
            <Stack direction="horizontal" align="center" gap="condensed">
              <span
                aria-hidden="true"
                style={{
                  display: 'inline-flex',
                  padding: 'var(--base-size-6)',
                  borderRadius: 'var(--borderRadius-medium)',
                  backgroundColor: 'var(--bgColor-severe-emphasis)',
                  color: 'var(--fgColor-onEmphasis)',
                }}
              >
                <PackageIcon size={16} />
              </span>
              <Text weight="semibold" size="medium">
                SPX Express
              </Text>
              <Text size="medium" style={{ color: 'var(--fgColor-muted)' }}>
                / Operasional
              </Text>
            </Stack>
          </NextLink>
          <Stack direction="horizontal" gap="normal" align="center">
            <Link
              as={NextLink}
              href="/line-haul"
              style={{ fontSize: 'var(--body-font-size)' }}
            >
              Line Haul
            </Link>
            <Label variant="secondary">Padang DC</Label>
          </Stack>
        </Stack>
      </div>
    </header>
  )
}
