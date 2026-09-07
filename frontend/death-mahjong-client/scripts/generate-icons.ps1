Add-Type -AssemblyName System.Drawing

$root = Split-Path -Parent $PSScriptRoot
$src = Join-Path $root "public\images\icon\Icon.png"
$outDir = Join-Path $root "public\icons"

if (-not (Test-Path $outDir)) {
    New-Item -ItemType Directory -Path $outDir | Out-Null
}

$bgColor = [System.Drawing.Color]::FromArgb(255, 10, 10, 10) # #0a0a0a

function Resize-Plain($srcImg, $size, $outPath) {
    $bmp = New-Object System.Drawing.Bitmap $size, $size
    $bmp.SetResolution($srcImg.HorizontalResolution, $srcImg.VerticalResolution)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.Clear([System.Drawing.Color]::Transparent)
    $g.DrawImage($srcImg, 0, 0, $size, $size)
    $g.Dispose()
    $bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
}

function Resize-Maskable($srcImg, $size, $outPath, $bg) {
    # Maskable safe zone: keep artwork within the centered ~80% to survive circle/rounded-square masks
    $bmp = New-Object System.Drawing.Bitmap $size, $size
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.Clear($bg)
    $inner = [int]($size * 0.7)
    $offset = [int](($size - $inner) / 2)
    $g.DrawImage($srcImg, $offset, $offset, $inner, $inner)
    $g.Dispose()
    $bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
}

function Resize-Solid($srcImg, $size, $outPath, $bg) {
    # Solid background version for contexts that don't handle transparency well (e.g. Apple touch icon)
    $bmp = New-Object System.Drawing.Bitmap $size, $size
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.Clear($bg)
    $inner = [int]($size * 0.82)
    $offset = [int](($size - $inner) / 2)
    $g.DrawImage($srcImg, $offset, $offset, $inner, $inner)
    $g.Dispose()
    $bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
}

$img = [System.Drawing.Image]::FromFile($src)

Resize-Plain $img 192 (Join-Path $outDir "icon-192.png")
Resize-Plain $img 512 (Join-Path $outDir "icon-512.png")
Resize-Maskable $img 192 (Join-Path $outDir "icon-maskable-192.png") $bgColor
Resize-Maskable $img 512 (Join-Path $outDir "icon-maskable-512.png") $bgColor
Resize-Solid $img 180 (Join-Path $outDir "apple-touch-icon.png") $bgColor

$img.Dispose()

Write-Output "Icons generated in $outDir"
