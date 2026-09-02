# PowerShell script to update all color codes to Burgundy theme
# Run this from the project root directory

$oldColors = @{
    '#242120' = '#5C1D24'  # Old card background -> Burgundy
    '#171614' = '#5C1D24'  # Old main background -> Burgundy
    '#8B4513' = '#5C1D24'  # Old brown -> Burgundy
    '#22201D' = '#5C1D24'  # Old dark surface -> Burgundy
    '#0D0C0B' = '#5C1D24'  # Old very dark -> Burgundy
    '#2A2826' = '#6D2430'  # Old lighter surface -> Slightly lighter Burgundy
    '#3A3836' = '#6D2430'  # Old hover surface -> Slightly lighter Burgundy
}

$files = Get-ChildItem -Path "src" -Filter "*.jsx" -Recurse

$totalReplacements = 0

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $originalContent = $content
    $fileReplacements = 0
    
    foreach ($old in $oldColors.Keys) {
        $new = $oldColors[$old]
        if ($content -match [regex]::Escape($old)) {
            $content = $content -replace [regex]::Escape($old), $new
            $count = ([regex]::Matches($originalContent, [regex]::Escape($old))).Count
            $fileReplacements += $count
            Write-Host "  Replaced $count occurrences of $old with $new"
        }
    }
    
    if ($content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "Updated: $($file.Name) - $fileReplacements replacements" -ForegroundColor Green
        $totalReplacements += $fileReplacements
    }
}

Write-Host "`n==================================" -ForegroundColor Cyan
Write-Host "Total replacements: $totalReplacements" -ForegroundColor Cyan
Write-Host "Color update complete!" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
