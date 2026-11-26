export function parseCsv(input: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let cell = ''
  let quoted = false

  for (let i = 0; i < input.length; i += 1) {
    const char = input[i]
    if (quoted) {
      if (char === '"' && input[i + 1] === '"') {
        cell += '"'
        i += 1
      } else if (char === '"') {
        quoted = false
      } else {
        cell += char
      }
    } else if (char === '"') {
      quoted = true
    } else if (char === ',') {
      row.push(cell)
      cell = ''
    } else if (char === '\n') {
      row.push(cell.replace(/\r$/, ''))
      rows.push(row)
      row = []
      cell = ''
    } else {
      cell += char
    }
  }

  if (cell.length || row.length) {
    row.push(cell.replace(/\r$/, ''))
    rows.push(row)
  }

  return rows.filter((values) => values.some((value) => value.trim() !== ''))
}

export function recordsFromCsv(input: string): Record<string, string>[] {
  const [header = [], ...dataRows] = parseCsv(input)
  const keys = header.map((value) => value.trim().replace(/^\uFEFF/, ''))
  return dataRows.map((values) => Object.fromEntries(
    keys.map((key, index) => [key, (values[index] ?? '').trim()]),
  ))
}

export function findColumn(row: Record<string, string>, expected: string): string | undefined {
  return Object.keys(row).find((key) => key.trim().toLowerCase() === expected.toLowerCase())
}
