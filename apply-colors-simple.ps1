# Simple color replacement script
$colors = @{
    '#5C1D24' = '#5B1E28'
    '#F3E9D2' = '#F4EBDD'
    '#C8A165' = '#B8955A'
    '#7E2A33' = '#762B35'
    '#4A1720' = '#25211C'
    '#E8DCC4' = '#C9B79C'
    '#D9B77E' = '#D4B87A'
    '#8B3541' = '#762B35'
    '#B38F53' = '#8F7345'
    '#6D2430' = '#762B35'
}

$files = Get-ChildItem -Path "src" -Include "*.jsx","*.css","*.js" -Recurse

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $changed = $false
    
    foreach ($old in $colors.Keys) {
        if ($content -match [regex]::Escape($old)) {
            $content = $content -replace [regex]::Escape($old), $colors[$old]
            $changed = $true
        }
    }
    
    if ($changed) {
        Set-Content $file.FullName -Value $content -NoNewline
        Write-Host "Updated: $($file.Name)"
    }
}

Write-Host "Done!"
