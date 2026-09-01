# Apply exact color scheme as specified
$colorMappings = @{
    '#5C1D24' = '#5B1E28'  # Deep Burgundy
    '#F3E9D2' = '#F4EBDD'  # Warm Ivory
    '#C8A165' = '#B8955A'  # Champagne Gold
    '#7E2A33' = '#762B35'  # Rich Burgundy (cards)
    '#4A1720' = '#25211C'  # Espresso Brown
    '#E8DCC4' = '#C9B79C'  # Soft Beige
    '#D9B77E' = '#D4B87A'  # Lighter gold
    '#8B3541' = '#762B35'  # Hover state -> Rich Burgundy
    '#B38F53' = '#8F7345'  # Muted Gold
    '#6D2430' = '#762B35'  # Map to Rich Burgundy
}

$files = Get-ChildItem -Path "src" -Filter "*.jsx" -Recurse
$files += Get-ChildItem -Path "src" -Filter "*.css" -Recurse

$totalReplacements = 0

foreach ($file in $files) {
    try {
        $content = Get-Content $file.FullName -Raw -ErrorAction Stop
        $originalContent = $content
        $fileReplacements = 0
        
        foreach ($old in $colorMappings.Keys) {
            $new = $colorMappings[$old]
            if ($content -match [regex]::Escape($old)) {
                $matches = ([regex]::Matches($content, [regex]::Escape($old))).Count
                $content = $content -replace [regex]::Escape($old), $new
                $fileReplacements += $matches
                if ($matches -gt 0) {
                    Write-Host "  $old -> $new ($matches occurrences)" -ForegroundColor Yellow
                }
            }
        }
        
        if ($content -ne $originalContent) {
            Set-Content -Path $file.FullName -Value $content -NoNewline -ErrorAction Stop
            Write-Host "✓ Updated: $($file.Name) - $fileReplacements replacements" -ForegroundColor Green
            $totalReplacements += $fileReplacements
        }
    }
    catch {
        Write-Host "✗ Error updating $($file.Name): $_" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Total color replacements: $totalReplacements" -ForegroundColor Cyan
Write-Host "Exact color scheme applied successfully!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
