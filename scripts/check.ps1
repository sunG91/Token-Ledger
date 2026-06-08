# Token随手记 — 跨端代码检查脚本 (Windows PowerShell)
# 用法: .\scripts\check.ps1 [--fix]

param(
    [switch]$Fix
)

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot\..

Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Token随手记 — 代码规范检查" -ForegroundColor Cyan
Write-Host " 平台: Android / iOS / 小程序 / H5" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

if (-not (Test-Path "node_modules")) {
    Write-Host "未找到 node_modules，正在安装依赖..." -ForegroundColor Yellow
    npm install
}

if ($Fix) {
    Write-Host "`n[自动修复模式]" -ForegroundColor Green
    npm run check:fix
} else {
    npm run check
}

if ($LASTEXITCODE -ne 0) {
    Write-Host "`n检查未通过，请修复后重试。可加 -Fix 参数自动修复部分问题。" -ForegroundColor Red
    exit 1
}

Write-Host "`n全部检查通过!" -ForegroundColor Green
exit 0
