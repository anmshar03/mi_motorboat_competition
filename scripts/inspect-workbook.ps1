param([string]$WorkbookPath = 'reference/2025 Master Judging Rubric.xlsx')
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression.FileSystem
$resolved = (Resolve-Path -LiteralPath $WorkbookPath).Path
$archive = [IO.Compression.ZipFile]::OpenRead($resolved)
function Read-XmlEntry([string]$Path) {
  $entry = $archive.GetEntry($Path)
  if (-not $entry) { throw "Workbook entry not found: $Path" }
  $reader = [IO.StreamReader]::new($entry.Open())
  try { return [xml]$reader.ReadToEnd() } finally { $reader.Dispose() }
}
try {
  $strings = @()
  if ($archive.GetEntry('xl/sharedStrings.xml')) {
    $shared = Read-XmlEntry 'xl/sharedStrings.xml'
    $strings = @($shared.sst.si | ForEach-Object { $_.InnerText })
  }
  $book = Read-XmlEntry 'xl/workbook.xml'
  $rels = Read-XmlEntry 'xl/_rels/workbook.xml.rels'
  $sheets = foreach ($sheet in $book.workbook.sheets.sheet) {
    $rid = $sheet.GetAttribute('id', 'http://schemas.openxmlformats.org/officeDocument/2006/relationships')
    $target = ($rels.Relationships.Relationship | Where-Object Id -eq $rid).Target
    $path = if ($target.StartsWith('/')) { $target.TrimStart('/') } else { 'xl/' + $target }
    $xml = Read-XmlEntry $path
    $cells = @($xml.worksheet.sheetData.row.c | Where-Object { $null -ne $_ } | ForEach-Object {
      $value = [string]$_.v
      if ($_.t -eq 's') { $value = $strings[[int]$value] }
      if ($_.t -eq 'inlineStr') { $value = $_.is.InnerText }
      $formulaNode = $_.SelectSingleNode("*[local-name()='f']")
      if ($value -or $formulaNode) {
        [pscustomobject]@{ cell = $_.r; value = $value; type = $_.t; formula = if ($formulaNode) { $formulaNode.InnerText } else { $null }; formulaType = if ($formulaNode) { $formulaNode.GetAttribute('t') } else { $null }; formulaRange = if ($formulaNode) { $formulaNode.GetAttribute('ref') } else { $null } }
      }
    })
    [pscustomobject]@{ sheet = $sheet.name; state = if ($sheet.state) { $sheet.state } else { 'visible' }; dimension = $xml.worksheet.dimension.ref; cells = $cells }
  }
  New-Item -ItemType Directory -Path '.cache' -Force | Out-Null
  $sheets | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath '.cache/workbook-analysis.json' -Encoding UTF8
  $sheets | ForEach-Object { [pscustomobject]@{ sheet = $_.sheet; state = $_.state; cells = $_.cells.Count; formulas = @($_.cells | Where-Object formula).Count } } | Format-Table -AutoSize
  Write-Output 'Read-only extraction saved privately to .cache/workbook-analysis.json. Cached values were not recalculated.'
} finally { $archive.Dispose() }
