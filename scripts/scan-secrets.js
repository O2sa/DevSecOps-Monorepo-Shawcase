#!/usr/bin/env node

/**
 * DevSecOps Secret Scanner
 * Fast, local secret scanner for pre-commit hooks and repository validation.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ALLOWLIST_PATH = path.join(__dirname, '..', 'security', 'policies', 'secrets-allowlist.json');

// Load allowlist
let allowlist = { allowedFiles: [], allowedPatterns: [] };
if (fs.existsSync(ALLOWLIST_PATH)) {
  try {
    allowlist = JSON.parse(fs.readFileSync(ALLOWLIST_PATH, 'utf8'));
  } catch (err) {
    console.error(`[WARN] Failed to parse allowlist: ${err.message}`);
  }
}

// Rules definitions
const RULES = [
  {
    name: 'AWS Access Key ID',
    regex: /\b(AKIA|ASIA|AROA|AIPA|ANPA|ANVA)[A-Z0-9]{16}\b/g,
  },
  {
    name: 'AWS Secret Key',
    regex:
      /(?:aws_secret_access_key|aws_secret_key|secret_key)\s*[:=]\s*['"][0-9a-zA-Z\/+=]{40}['"]/gi,
  },
  {
    name: 'Private Key',
    regex: /-----BEGIN (?:RSA |EC |OPENSSH |DSA |PGP )?PRIVATE KEY(?: BLOCK)?-----/g,
  },
  {
    name: 'GitHub Personal Access Token',
    regex: /\bgh[pousr]_[A-Za-z0-9_]{36,255}\b/g,
  },
  {
    name: 'Slack Token',
    regex: /\bxox[baprs]-[0-9a-zA-Z]{10,48}\b/g,
  },
  {
    name: 'Slack Webhook URL',
    regex: /https:\/\/hooks\.slack\.com\/services\/T[a-zA-Z0-9_]+\/B[a-zA-Z0-9_]+\/[a-zA-Z0-9_]+/g,
  },
  {
    name: 'Google API Key',
    regex: /\bAIza[0-9A-Za-z-_]{35}\b/g,
  },
  {
    name: 'Generic API Key / Secret',
    regex:
      /(?:api_key|apikey|secret_key|api_secret|auth_token|access_token)\s*[:=]\s*['"]([0-9a-zA-Z_\-]{20,})['"]/gi,
  },
  {
    name: 'High-Entropy JWT Token',
    regex: /\beyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/g,
  },
  {
    name: 'Hardcoded Password Assignment',
    regex: /(?:password|passwd|pwd|db_password)\s*[:=]\s*['"]([^'"]{8,})['"]/gi,
  },
];

const IGNORE_DIRS = [
  'node_modules',
  '.git',
  '.next',
  '.angular',
  'dist',
  'target',
  '.venv',
  'venv',
  '__pycache__',
  'coverage',
  '.idea',
  '.vscode',
];

const IGNORE_EXTENSIONS = [
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.ico',
  '.svg',
  '.woff',
  '.woff2',
  '.ttf',
  '.eot',
  '.jar',
  '.sqlite3',
];

function isIgnoredPath(filePath) {
  const norm = filePath.replace(/\\/g, '/');
  for (const dir of IGNORE_DIRS) {
    if (norm.startsWith(`${dir}/`) || norm.includes(`/${dir}/`) || norm === dir) {
      return true;
    }
  }
  const ext = path.extname(filePath).toLowerCase();
  if (IGNORE_EXTENSIONS.includes(ext)) {
    return true;
  }
  for (const allowed of allowlist.allowedFiles) {
    if (norm === allowed || norm.endsWith(`/${allowed}`)) {
      return true;
    }
  }
  return false;
}

function isAllowedMatch(matchedText, lineContent) {
  for (const allowed of allowlist.allowedPatterns) {
    if (matchedText.includes(allowed) || lineContent.includes(allowed)) {
      return true;
    }
  }
  // Ignore dynamic reading from environment variables
  if (
    /process\.env\.[A-Z0-9_]+|os\.environ\.get\(['"][A-Z0-9_]+['"]\)|System\.getenv\(['"][A-Z0-9_]+['"]\)/.test(
      lineContent
    )
  ) {
    return true;
  }
  return false;
}

function scanFile(filePath, content) {
  const findings = [];
  const lines = content.split(/\r?\n/);

  lines.forEach((line, lineIndex) => {
    // Skip scanner script itself or comments with rules definition
    if (filePath.endsWith('scan-secrets.js')) return;

    for (const rule of RULES) {
      const regex = new RegExp(rule.regex);
      let match;
      while ((match = regex.exec(line)) !== null) {
        const matchedText = match[0];
        if (!isAllowedMatch(matchedText, line)) {
          findings.push({
            file: filePath,
            line: lineIndex + 1,
            rule: rule.name,
            snippet: line.trim(),
            match:
              matchedText.length > 8
                ? `${matchedText.slice(0, 4)}...${matchedText.slice(-4)}`
                : '****',
          });
        }
      }
    }
  });

  return findings;
}

function getFilesToScan(isStaged) {
  if (isStaged) {
    try {
      const output = execSync('git diff --cached --name-only --diff-filter=ACM', {
        encoding: 'utf8',
      });
      return output
        .split(/\r?\n/)
        .map((f) => f.trim())
        .filter((f) => f.length > 0 && !isIgnoredPath(f) && fs.existsSync(f));
    } catch (err) {
      console.error(`[ERROR] Failed to get staged files: ${err.message}`);
      return [];
    }
  }

  // Full repository scan
  const allFiles = [];
  function walk(currentDir) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      const relPath = path.relative(path.join(__dirname, '..'), fullPath);
      if (isIgnoredPath(relPath)) continue;

      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.isFile()) {
        allFiles.push(relPath);
      }
    }
  }

  walk(path.join(__dirname, '..'));
  return allFiles;
}

function main() {
  const args = process.argv.slice(2);
  const isStaged = args.includes('--staged');

  console.log(`🔒 [DevSecOps] Scanning ${isStaged ? 'staged files' : 'workspace'} for secrets...`);

  const files = getFilesToScan(isStaged);
  if (files.length === 0) {
    console.log('✅ No files to scan.');
    process.exit(0);
  }

  let totalFindings = [];

  for (const file of files) {
    try {
      const content = fs.readFileSync(file, 'utf8');
      const findings = scanFile(file, content);
      if (findings.length > 0) {
        totalFindings = totalFindings.concat(findings);
      }
    } catch (err) {
      // Ignore binary / unreadable files
    }
  }

  if (totalFindings.length > 0) {
    console.error('\n🚨 [SECURITY ALERT] Potential secret(s) detected in source code:\n');
    totalFindings.forEach((finding) => {
      console.error(`  - ${finding.file}:${finding.line} [${finding.rule}]`);
      console.error(`    Found: ${finding.match}`);
      console.error(`    Line:  ${finding.snippet}\n`);
    });
    console.error('❌ Commit blocked! Please remove hardcoded credentials before committing.');
    console.error(
      '   If this is a legitimate false positive, update security/policies/secrets-allowlist.json.\n'
    );
    process.exit(1);
  }

  console.log(
    `✅ [DevSecOps] Secret scan passed! (${files.length} files scanned, 0 secrets detected)`
  );
  process.exit(0);
}

main();
