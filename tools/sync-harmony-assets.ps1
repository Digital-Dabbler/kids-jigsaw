# 同步 www/ 到鸿蒙壳 rawfile（DevEco 构建前运行；rawfile/www 不入库）
# 用法（绕过执行策略）：
#   $L=[scriptblock]::Create((Get-Content -Raw -Encoding UTF8 'tools/sync-harmony-assets.ps1')); & $L
param(
  [string]$From = 'www',
  [string]$To = 'harmony/entry/src/main/resources/rawfile/www'
)
$root = Get-Location
$src = Join-Path $root $From
$dst = Join-Path $root $To
if (Test-Path $dst) { Remove-Item $dst -Recurse -Force }
New-Item -ItemType Directory -Force -Path $dst | Out-Null
Copy-Item -Path (Join-Path $src '*') -Destination $dst -Recurse -Force
"同步完成：{0} 个文件 -> {1}" -f (Get-ChildItem $dst -Recurse -File | Measure-Object).Count, $To
