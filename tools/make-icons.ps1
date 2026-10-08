# 从方形源图生成 PWA/鸿蒙应用图标（512/192/180 PNG）。
# 用法（绕过执行策略）：
#   $L=[scriptblock]::Create((Get-Content -Raw -Encoding UTF8 'tools/make-icons.ps1')); & $L
param(
  [string]$Source = 'www/assets/raw/icon.png',
  [string]$OutDir = 'www/assets/icons'
)
Add-Type -AssemblyName System.Drawing
New-Item -ItemType Directory -Force -Path $OutDir | Out-Null
$src = [System.Drawing.Image]::FromFile((Resolve-Path $Source).Path)
foreach ($size in 512, 192, 180) {
  $bmp = New-Object System.Drawing.Bitmap $size, $size
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.DrawImage($src, 0, 0, $size, $size)
  $g.Dispose()
  $bmp.Save((Join-Path $OutDir "icon-$size.png"), [System.Drawing.Imaging.ImageFormat]::Png)
  $bmp.Dispose()
}
$src.Dispose()
Get-ChildItem $OutDir | Select-Object Name, Length | Format-Table -AutoSize | Out-String
