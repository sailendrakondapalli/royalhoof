# Fix UTF-8 encoding issues in all JSX files
$files = Get-ChildItem -Path "src" -Filter "*.jsx" -Recurse

foreach ($file in $files) {
    try {
        $content = Get-Content $file.FullName -Raw -Encoding UTF8
        
        # Replace common problematic characters
        $content = $content -replace '�', '-'  # En-dash/Em-dash
        $content = $content -replace '–', '-'  # En-dash
        $content = $content -replace '—', '-'  # Em-dash
        $content = $content -replace ''', "'"  # Smart quote
        $content = $content -replace ''', "'"  # Smart quote
        $content = $content -replace '"', '"'  # Smart quote
        $content = $content -replace '"', '"'  # Smart quote
        $content = $content -replace '…', '...' # Ellipsis
        
        # Save with UTF-8 encoding (no BOM)
        [System.IO.File]::WriteAllText($file.FullName, $content, (New-Object System.Text.UTF8Encoding($false)))
        
        Write-Host "Fixed: $($file.FullName)" -ForegroundColor Green
    }
    catch {
        Write-Host "Error fixing $($file.FullName): $_" -ForegroundColor Red
    }
}

Write-Host "`nDone! All files processed." -ForegroundColor Cyan
