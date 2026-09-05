$bytes = [System.IO.File]::ReadAllBytes("src\pages\CheckoutPage.jsx")
$latin1 = [System.Text.Encoding]::GetEncoding("iso-8859-1").GetString($bytes)

$rupee_latin1 = [System.Text.Encoding]::GetEncoding("iso-8859-1").GetString([byte[]](0xE2, 0x82, 0xB9))
$rupee_utf8 = [char]0x20B9

$emdash_latin1 = [System.Text.Encoding]::GetEncoding("iso-8859-1").GetString([byte[]](0xE2, 0x80, 0x94))
$emdash_utf8 = [char]0x2014

$check_latin1 = [System.Text.Encoding]::GetEncoding("iso-8859-1").GetString([byte[]](0xE2, 0x9C, 0x93))
$check_utf8 = [char]0x2713

$repl_latin1 = [System.Text.Encoding]::GetEncoding("iso-8859-1").GetString([byte[]](0xEF, 0xBF, 0xBD))

$latin1 = $latin1.Replace($rupee_latin1, $rupee_utf8)
$latin1 = $latin1.Replace($emdash_latin1, $emdash_utf8)
$latin1 = $latin1.Replace($check_latin1, $check_utf8)
$latin1 = $latin1.Replace($repl_latin1, "-")

$utf8bytes = [System.Text.Encoding]::UTF8.GetBytes($latin1)
[System.IO.File]::WriteAllBytes("src\pages\CheckoutPage.jsx", $utf8bytes)
Write-Host "Done"
