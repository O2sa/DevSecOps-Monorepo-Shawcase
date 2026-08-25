// ==============================================================================
// OWASP ZAP DAST Security Policy Evaluator
// ==============================================================================
// Parses structured JSON reports across all scanned microservices and frontends.
// Enforces security policy:
//   - CRITICAL / HIGH findings: HALT pipeline (exit code 1)
//   - MEDIUM / LOW / INFORMATIONAL: Log warnings/diagnostics (exit code 0)
// ==============================================================================

const fs = require('fs');
const path = require('path');

const SERVICES = ['web', 'dashboard', 'identity', 'orders', 'notification'];

function parseZapJsonReport(filePath) {
  try {
    const rawContent = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(rawContent);
    const sites = Array.isArray(data.site) ? data.site : data.site ? [data.site] : [];

    const findings = {
      critical: [],
      high: [],
      medium: [],
      low: [],
      info: [],
    };

    for (const site of sites) {
      const alerts = Array.isArray(site.alerts) ? site.alerts : site.alerts ? [site.alerts] : [];

      for (const alert of alerts) {
        const riskCode = String(alert.riskcode || alert.riskCode || '');
        const riskDesc = String(alert.riskdesc || alert.riskDesc || alert.risk || '').toLowerCase();
        const alertName = alert.alert || alert.name || 'Unknown Alert';
        const instances = Array.isArray(alert.instances)
          ? alert.instances
          : alert.instances
            ? [alert.instances]
            : [];

        const findingItem = {
          name: alertName,
          pluginId: alert.pluginid || alert.pluginId || 'N/A',
          riskCode,
          riskDesc: alert.riskdesc || alert.riskDesc || riskCode,
          confidence: alert.confidence || 'N/A',
          instancesCount: instances.length || parseInt(alert.count || '1', 10),
          instances: instances.slice(0, 3).map((inst) => ({
            uri: inst.uri || inst.url || '',
            method: inst.method || 'GET',
          })),
          solution: alert.solution || '',
          cweId: alert.cweid || '',
        };

        if (riskCode === '4' || riskDesc.startsWith('critical')) {
          findings.critical.push(findingItem);
        } else if (riskCode === '3' || riskDesc.startsWith('high')) {
          findings.high.push(findingItem);
        } else if (riskCode === '2' || riskDesc.startsWith('medium')) {
          findings.medium.push(findingItem);
        } else if (riskCode === '1' || riskDesc.startsWith('low')) {
          findings.low.push(findingItem);
        } else {
          findings.info.push(findingItem);
        }
      }
    }

    return findings;
  } catch (err) {
    console.error(`  ⚠️  Error parsing report at ${filePath}: ${err.message}`);
    return null;
  }
}

function findReportFile(baseDir, serviceName) {
  const serviceDir = path.join(baseDir, serviceName);
  const potentialPaths = [
    path.join(serviceDir, 'report_json.json'),
    path.join(serviceDir, 'report.json'),
    path.join(serviceDir, `${serviceName}-report.json`),
    path.join(baseDir, `${serviceName}-report.json`),
    path.join(baseDir, `${serviceName}_report.json`),
    path.join(baseDir, `${serviceName}.json`),
  ];

  for (const p of potentialPaths) {
    if (fs.existsSync(p)) {
      return p;
    }
  }

  if (fs.existsSync(serviceDir)) {
    const files = fs.readdirSync(serviceDir);
    const jsonFile = files.find((f) => f.endsWith('.json'));
    if (jsonFile) {
      return path.join(serviceDir, jsonFile);
    }
  }

  return null;
}

function evaluatePolicy() {
  const baseDir = path.resolve(process.cwd(), process.argv[2] || 'dast-reports');

  console.log('\n================================================================');
  console.log('🛡️  [DevSecOps Staging] OWASP ZAP DAST Security Policy Evaluator');
  console.log('================================================================');
  console.log(`📂 Report Directory: ${baseDir}\n`);

  const results = {};
  let totalCritical = 0;
  let totalHigh = 0;
  let totalMedium = 0;
  let totalLow = 0;
  let totalInfo = 0;
  let missingReportsCount = 0;

  for (const service of SERVICES) {
    const reportPath = findReportFile(baseDir, service);
    if (!reportPath) {
      console.log(`⚠️  [${service}] No structured JSON report found in ${baseDir}/${service}/`);
      results[service] = { status: 'MISSING', path: null, findings: null };
      missingReportsCount++;
      continue;
    }

    console.log(`🔍 [${service}] Evaluating report: ${path.relative(process.cwd(), reportPath)}`);
    const findings = parseZapJsonReport(reportPath);
    if (!findings) {
      results[service] = { status: 'INVALID', path: reportPath, findings: null };
      continue;
    }

    const c = findings.critical.length;
    const h = findings.high.length;
    const m = findings.medium.length;
    const l = findings.low.length;
    const i = findings.info.length;

    totalCritical += c;
    totalHigh += h;
    totalMedium += m;
    totalLow += l;
    totalInfo += i;

    const hasBlockers = c > 0 || h > 0;
    const status = hasBlockers ? 'FAILED' : 'PASSED';

    results[service] = {
      status,
      path: reportPath,
      findings,
      counts: { critical: c, high: h, medium: m, low: l, info: i },
    };

    console.log(
      `   Findings -> Critical: ${c} | High: ${h} | Medium: ${m} | Low: ${l} | Informational: ${i}`
    );

    if (hasBlockers) {
      console.error(
        `   ❌ [BLOCKER] Critical/High severity vulnerabilities detected in ${service}:`
      );
      [...findings.critical, ...findings.high].forEach((f) => {
        console.error(`      - [${f.riskDesc}] ${f.name} (Plugin ID: ${f.pluginId})`);
        f.instances.forEach((inst) => {
          console.error(`        URI: ${inst.method} ${inst.uri}`);
        });
      });
    } else if (m > 0) {
      console.log(`   ⚠️  [NON-BLOCKING] Medium severity alerts logged for remediation:`);
      findings.medium.forEach((f) => {
        console.log(`      - [${f.riskDesc}] ${f.name} (Plugin ID: ${f.pluginId})`);
      });
    }
  }

  // Summary Table Output
  console.log('\n================================================================');
  console.log('📊 DAST Security Policy Evaluation Summary');
  console.log('================================================================');
  console.log(
    'Service'.padEnd(22) +
      'Critical'.padEnd(10) +
      'High'.padEnd(8) +
      'Medium'.padEnd(10) +
      'Low'.padEnd(8) +
      'Info'.padEnd(8) +
      'Policy Result'
  );
  console.log('-'.repeat(74));

  for (const service of SERVICES) {
    const res = results[service];
    if (!res || res.status === 'MISSING') {
      console.log(
        service.padEnd(22) +
          '-'.padEnd(10) +
          '-'.padEnd(8) +
          '-'.padEnd(10) +
          '-'.padEnd(8) +
          '-'.padEnd(8) +
          '⚠️  REPORT MISSING'
      );
    } else if (res.status === 'INVALID') {
      console.log(
        service.padEnd(22) +
          '-'.padEnd(10) +
          '-'.padEnd(8) +
          '-'.padEnd(10) +
          '-'.padEnd(8) +
          '-'.padEnd(8) +
          '❌ INVALID JSON'
      );
    } else {
      const counts = res.counts;
      const statusIcon = res.status === 'PASSED' ? '✅ PASSED' : '❌ FAILED';
      console.log(
        service.padEnd(22) +
          String(counts.critical).padEnd(10) +
          String(counts.high).padEnd(8) +
          String(counts.medium).padEnd(10) +
          String(counts.low).padEnd(8) +
          String(counts.info).padEnd(8) +
          statusIcon
      );
    }
  }
  console.log('-'.repeat(74));
  console.log(
    'TOTAL'.padEnd(22) +
      String(totalCritical).padEnd(10) +
      String(totalHigh).padEnd(8) +
      String(totalMedium).padEnd(10) +
      String(totalLow).padEnd(8) +
      String(totalInfo).padEnd(8) +
      (totalCritical + totalHigh === 0 ? '✅ GATE PASS' : '❌ GATE FAIL')
  );
  console.log('================================================================\n');

  // GitHub Step Summary Generation
  if (process.env.GITHUB_STEP_SUMMARY) {
    try {
      let summaryMd = '## 🛡️ OWASP ZAP DAST Security Gate Summary\n\n';
      summaryMd += '| Service | Critical | High | Medium | Low | Informational | Gate Status |\n';
      summaryMd += '| :--- | :---: | :---: | :---: | :---: | :---: | :---: |\n';

      for (const service of SERVICES) {
        const res = results[service];
        if (!res || res.status === 'MISSING') {
          summaryMd += `| **${service}** | - | - | - | - | - | ⚠️ Missing Report |\n`;
        } else if (res.status === 'INVALID') {
          summaryMd += `| **${service}** | - | - | - | - | - | ❌ Invalid Report |\n`;
        } else {
          const c = res.counts;
          const statusBadge = res.status === 'PASSED' ? '✅ **PASSED**' : '❌ **BLOCKED**';
          summaryMd += `| **${service}** | ${c.critical} | ${c.high} | ${c.medium} | ${c.low} | ${c.info} | ${statusBadge} |\n`;
        }
      }

      summaryMd += `| **TOTAL** | **${totalCritical}** | **${totalHigh}** | **${totalMedium}** | **${totalLow}** | **${totalInfo}** | ${
        totalCritical + totalHigh === 0 ? '✅ **PASSED**' : '❌ **BLOCKED**'
      } |\n\n`;

      if (totalCritical + totalHigh > 0) {
        summaryMd +=
          '> ❌ **Security Policy Violation**: Staging deployment DAST scan detected High/Critical severity findings. Remediation is required before promotion.\n\n';
      } else {
        summaryMd +=
          '> ✅ **Security Policy Enforced**: Zero High or Critical severity vulnerabilities detected across all microservices and frontends.\n\n';
      }

      fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, summaryMd, 'utf8');
    } catch (summaryErr) {
      console.warn(`Could not write to GITHUB_STEP_SUMMARY: ${summaryErr.message}`);
    }
  }

  // Policy Enforcement Decision
  if (totalCritical > 0 || totalHigh > 0) {
    console.error(
      `❌ Policy Gate Blocked: ${totalCritical} Critical and ${totalHigh} High findings detected.`
    );
    console.error('   Fix the reported High/Critical vulnerabilities to pass the DAST gate.\n');
    process.exit(1);
  }

  if (missingReportsCount === SERVICES.length) {
    console.error('❌ Policy Gate Error: No DAST reports were found for any service.');
    process.exit(1);
  }

  console.log('✅ Policy Gate Passed: No Critical or High severity findings detected.');
  console.log(
    '   Medium, Low, and Informational findings are recorded for continuous improvement.\n'
  );
  process.exit(0);
}

evaluatePolicy();
