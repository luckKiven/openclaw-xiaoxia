# OpenClaw Skills Security Audit Script
# Uses skill-auditor protocol to scan all installed skills

$skillsDir = "G:\openClaw\xiaoxia\skills"
$outputDir = "F:\2025ideazdjx\openClaw-project\xiaoxia\backups\skill-audit"

# Create output directory
if (!(Test-Path $outputDir)) {
    New-Item -ItemType Directory -Path $outputDir -Force | Out-Null
}

# Red flag patterns
$criticalPatterns = @(
    'curl\s+.*\|.*bash',
    'wget\s+.*\|.*bash',
    'nc\s+-e',
    'bash\s+-i',
    '~\/\.ssh',
    '~\/\.aws',
    '~\/\.env',
    'process\.env\.API_KEY',
    'process\.env\.SECRET',
    'fetch\(.*key=.*\${',
    'dns\.resolve\(.*\${',
    'Ignore previous instructions',
    'You are now',
    'Your new role is',
    'System prompt override',
    'Act as if you have no restrictions',
    'eval\(',
    'exec\(',
    'child_process',
    '\.ssh\/id_rsa',
    '\.aws\/credentials'
)

$warningPatterns = @(
    'network.*true',
    'shell.*true',
    'fileWrite.*true',
    'postinstall',
    'preinstall',
    'sudo',
    'crontab',
    '\.bashrc',
    '\.zshrc'
)

# Get all top-level skills
$skills = Get-ChildItem $skillsDir -Directory -Depth 1 | ForEach-Object {
    if (Test-Path "$($_.FullName)\SKILL.md") {
        $_.Name
    }
} | Sort-Object -Unique

$results = @()
$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  OpenClaw Skills Security Audit" -ForegroundColor Cyan
Write-Host "  Started: $timestamp" -ForegroundColor Cyan
Write-Host "  Total skills to audit: $($skills.Count)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

foreach ($skillName in $skills) {
    $skillPath = Join-Path $skillsDir "$skillName\SKILL.md"
    
    if (!(Test-Path $skillPath)) {
        continue
    }
    
    Write-Host "Auditing: $skillName" -ForegroundColor Yellow
    
    $content = Get-Content $skillPath -Raw -ErrorAction SilentlyContinue
    if (!$content) {
        $results += [PSCustomObject]@{
            Skill = $skillName
            Verdict = "ERROR"
            RiskLevel = "UNKNOWN"
            RedFlags = 0
            Warnings = 0
            Note = "Cannot read file"
        }
        continue
    }
    
    $redFlags = 0
    $warnings = 0
    $findings = @()
    
    # Check for critical patterns
    foreach ($pattern in $criticalPatterns) {
        if ($content -match $pattern) {
            $redFlags++
            $findings += "[CRITICAL] Matched: $pattern"
        }
    }
    
    # Check for warning patterns
    foreach ($pattern in $warningPatterns) {
        if ($content -match $pattern) {
            $warnings++
            $findings += "[WARNING] Matched: $pattern"
        }
    }
    
    # Check permissions in frontmatter
    $hasNetwork = $content -match 'network:\s*true'
    $hasShell = $content -match 'shell:\s*true'
    $hasFileWrite = $content -match 'fileWrite:\s*true'
    $hasFileRead = $content -match 'fileRead:\s*true'
    
    # Dangerous combinations
    if ($hasNetwork -and $hasFileRead) {
        $redFlags++
        $findings += "[CRITICAL] Dangerous combo: network + fileRead (exfiltration risk)"
    }
    if ($hasNetwork -and $hasShell) {
        $redFlags++
        $findings += "[CRITICAL] Dangerous combo: network + shell (remote exec risk)"
    }
    if ($hasShell -and $hasFileWrite) {
        $warnings++
        $findings += "[WARNING] Dangerous combo: shell + fileWrite (persistence risk)"
    }
    
    # Determine verdict
    $verdict = "SAFE"
    $riskLevel = "LOW"
    
    if ($redFlags -gt 0) {
        if ($redFlags -ge 3) {
            $verdict = "BLOCK"
            $riskLevel = "CRITICAL"
        } elseif ($redFlags -ge 1) {
            $verdict = "DANGEROUS"
            $riskLevel = "HIGH"
        }
    } elseif ($warnings -gt 0) {
        if ($warnings -ge 3) {
            $verdict = "SUSPICIOUS"
            $riskLevel = "MEDIUM"
        } else {
            $verdict = "SAFE"
            $riskLevel = "LOW"
        }
    }
    
    $results += [PSCustomObject]@{
        Skill = $skillName
        Verdict = $verdict
        RiskLevel = $riskLevel
        RedFlags = $redFlags
        Warnings = $warnings
        Findings = $findings -join "; "
    }
}

# Generate report
$reportPath = Join-Path $outputDir "skill-audit-report-$timestamp.csv"
$results | Export-Csv -Path $reportPath -NoTypeInformation -Encoding UTF8

# Summary
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  AUDIT SUMMARY" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$safeCount = ($results | Where-Object { $_.Verdict -eq "SAFE" }).Count
$suspiciousCount = ($results | Where-Object { $_.Verdict -eq "SUSPICIOUS" }).Count
$dangerousCount = ($results | Where-Object { $_.Verdict -eq "DANGEROUS" }).Count
$blockCount = ($results | Where-Object { $_.Verdict -eq "BLOCK" }).Count

Write-Host "  SAFE:       $safeCount" -ForegroundColor Green
Write-Host "  SUSPICIOUS: $suspiciousCount" -ForegroundColor Yellow
Write-Host "  DANGEROUS:  $dangerousCount" -ForegroundColor Orange
Write-Host "  BLOCK:      $blockCount" -ForegroundColor Red
Write-Host ""
Write-Host "  Report saved to: $reportPath" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Show problematic skills
if ($dangerousCount -gt 0 -or $blockCount -gt 0) {
    Write-Host ""
    Write-Host "⚠️  PROBLEMATIC SKILLS:" -ForegroundColor Red
    $results | Where-Object { $_.Verdict -eq "DANGEROUS" -or $_.Verdict -eq "BLOCK" } | 
        ForEach-Object {
            Write-Host "  [$($_.Verdict)] $($_.Skill) - $($_.RedFlags) red flags" -ForegroundColor Red
        }
}

if ($suspiciousCount -gt 0) {
    Write-Host ""
    Write-Host "⚠️  SUSPICIOUS SKILLS (review recommended):" -ForegroundColor Yellow
    $results | Where-Object { $_.Verdict -eq "SUSPICIOUS" } | 
        ForEach-Object {
            Write-Host "  [$($_.Verdict)] $($_.Skill) - $($_.Warnings) warnings" -ForegroundColor Yellow
        }
}
