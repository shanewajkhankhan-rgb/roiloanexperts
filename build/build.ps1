param(
  [string]$SiteName = "ROI Loan Experts",
  [string]$BaseUrl = "https://www.roiloanexperts.com"
)

$ErrorActionPreference = 'Stop'
$root      = Split-Path -Parent $PSScriptRoot
$partsDir  = Join-Path $PSScriptRoot 'parts'
$pagesDir  = Join-Path $PSScriptRoot 'pages'

function Read-Part([string]$name) {
  $p = Join-Path $partsDir $name
  if (-not (Test-Path $p)) { throw "Missing part: $p" }
  return [System.IO.File]::ReadAllText($p, [System.Text.Encoding]::UTF8)
}

$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
$head   = Read-Part 'head.html'
$icons  = Read-Part 'icons.html'
$header = Read-Part 'header.html'
$footer = Read-Part 'footer.html'

# Which nav item should be flagged aria-current for a given output file
function Get-NavState([string]$file) {
  $loanPages = @('personal-loan.html','business-loan.html','home-loan.html','vehicle-loan.html',
                 'education-loan.html','loan-against-property.html','gold-loan.html')
  if ($file -eq 'index.html')   { return @('home', $false) }
  if ($file -eq 'loans.html' -or $loanPages -contains $file) { return @('loans', $true) }
  if ($file -eq 'how-it-works.html' -or $file -eq 'documents.html') { return @('how', $false) }
  if ($file -eq 'about.html' -or $file -eq 'why-choose-us.html') { return @('about', $false) }
  if ($file -eq 'faq.html')     { return @('faq', $false) }
  if ($file -eq 'contact.html' -or $file -eq 'apply.html') { return @('contact', $false) }
  return @('', $false)
}

$built = @()

foreach ($file in (Get-ChildItem $pagesDir -Filter '*.html' | Sort-Object Name)) {
  $name   = $file.Name
  $source = [System.IO.File]::ReadAllText($file.FullName, [System.Text.Encoding]::UTF8)

  # ---- front matter -------------------------------------------------
  $meta = @{}
  $body = [regex]::Replace($source, '(?m)^@(\w+)\s*:\s*(.*)$', {
    param($m)
    $key = $m.Groups[1].Value.ToLower()
    if ($meta.ContainsKey($key)) { $meta[$key] += ' ' + $m.Groups[2].Value.Trim() }
    else { $meta[$key] = $m.Groups[2].Value.Trim() }
    return ''
  })
  $body = ($body -replace "^\s*[\r\n]+", '').Trim()

  # ---- page level defaults -----------------------------------------
  $title = $meta['title']
  if (-not $title) { throw "$name is missing @title" }
  $desc     = $meta['desc']
  $keywords = $meta['keywords']
  $bodyCls  = $meta['body']
  if (-not $desc)     { throw "$name is missing @desc" }
  if (-not $keywords) { $keywords = 'loan consultant, loan assistance, DSA, loan eligibility check, India' }
  if (-not $bodyCls)  { $bodyCls = 'page-default' }

  $canon = "$BaseUrl/$name"

  # ---- assemble ------------------------------------------------------
  $headOut = $head.Replace('{{TITLE}}', $title)
  $headOut = $headOut.Replace('{{DESC}}', $desc)
  $headOut = $headOut.Replace('{{KEYWORDS}}', $keywords)
  $headOut = $headOut.Replace('{{CANON}}', $canon)
  $headOut = $headOut.Replace('{{BODYCLASS}}', $bodyCls)

  $navState = Get-NavState $name
  $headerOut = $header.Replace('{{NAVSTATE}}', $navState[0])
  $headerOut = $headerOut.Replace('{{APPLYACTIVE}}', $(if ($navState[1]) { ' btn-active' } else { '' }))

  $page = $headOut + "`n" + $icons + "`n" + $headerOut + "`n" + $body + "`n" + $footer

  $outPath = Join-Path $root $name
  [System.IO.File]::WriteAllText($outPath, $page, $utf8NoBom)
  $built += [pscustomobject]@{ File = $name; KB = [math]::Round((Get-Item $outPath).Length / 1KB, 1) }
}

# ---- sitemap --------------------------------------------------------
$priority = @{
  'index.html' = '1.0'; 'loans.html' = '0.9'; 'apply.html' = '0.9'; 'contact.html' = '0.8'
  'personal-loan.html' = '0.9'; 'business-loan.html' = '0.9'; 'home-loan.html' = '0.9'
  'vehicle-loan.html' = '0.9'; 'education-loan.html' = '0.9'
  'loan-against-property.html' = '0.9'; 'gold-loan.html' = '0.9'
  'how-it-works.html' = '0.7'; 'about.html' = '0.7'; 'why-choose-us.html' = '0.7'
  'documents.html' = '0.7'; 'faq.html' = '0.7'; 'financial-services.html' = '0.7'
  'privacy-policy.html' = '0.3'; 'terms.html' = '0.3'; 'disclaimer.html' = '0.3'
}
$lastmod = (Get-Date).ToString('yyyy-MM-dd')
$sb = New-Object System.Text.StringBuilder
[void]$sb.AppendLine('<?xml version="1.0" encoding="UTF-8"?>')
[void]$sb.AppendLine('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')
foreach ($b in $built) {
  $p = $priority[$b.File]; if (-not $p) { $p = '0.5' }
  [void]$sb.AppendLine("  <url>")
  [void]$sb.AppendLine("    <loc>$BaseUrl/$($b.File)</loc>")
  [void]$sb.AppendLine("    <lastmod>$lastmod</lastmod>")
  [void]$sb.AppendLine("    <changefreq>monthly</changefreq>")
  [void]$sb.AppendLine("    <priority>$p</priority>")
  [void]$sb.AppendLine("  </url>")
}
[void]$sb.AppendLine('</urlset>')
[System.IO.File]::WriteAllText((Join-Path $root 'sitemap.xml'), $sb.ToString().TrimEnd(), $utf8NoBom)

Write-Host ""
Write-Host "  $SiteName - build complete" -ForegroundColor Green
Write-Host "  $($built.Count) pages generated + sitemap.xml" -ForegroundColor DarkGreen
Write-Host "  output: $root" -ForegroundColor DarkGray
Write-Host ""
$built | Format-Table -AutoSize
