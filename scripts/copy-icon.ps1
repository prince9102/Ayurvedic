Add-Type -AssemblyName System.Drawing

$src = "C:\Users\Logelite\Downloads\Code_Generated_Image.png"
$destRoot = "C:\project\Archive"
$resRoot = Join-Path $destRoot "android\app\src\main\res"

$sizes = @{
    "mdpi" = 48
    "hdpi" = 72
    "xhdpi" = 96
    "xxhdpi" = 144
    "xxxhdpi" = 192
}

$img = [System.Drawing.Image]::FromFile($src)
Write-Host "Source image: $($img.Width)x$($img.Height)"

Copy-Item -LiteralPath $src -Destination (Join-Path $destRoot "icon.png") -Force
Write-Host "Copied icon.png"

foreach ($name in $sizes.Keys) {
    $size = $sizes[$name]
    $dir = Join-Path $resRoot "mipmap-$name"
    if (-not (Test-Path -LiteralPath $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
    }

    $bmp = New-Object System.Drawing.Bitmap($size, $size)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.DrawImage($img, 0, 0, $size, $size)
    $g.Dispose()

    $launcherPath = Join-Path $dir "ic_launcher.png"
    $roundPath = Join-Path $dir "ic_launcher_round.png"

    $bmp.Save($launcherPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Save($roundPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()

    Write-Host "Saved $name ($($size)x$($size))"
}

$img.Dispose()
Write-Host "Done."
