export function buildCodeReviewUI(
  mergedFindings: any[],
  outbound: string,
  fileCount: number = 1
): string {

  const criticalCount = mergedFindings.filter(f => f.severity === 'critical').length;
  const warningCount = mergedFindings.filter(f => f.severity === 'warning').length;

  let score = 10;
  score -= criticalCount * 4;
  score -= warningCount * 2;
  if (score < 0) score = 0;

  let verdict = "✅ Ready for merge";
  if (criticalCount > 0) verdict = "🚫 Do not merge – critical issues found";
  else if (warningCount > 0) verdict = "⚠️ Merge with caution";

  const scoreClass =
    score >= 9 ? 'cr-excellent' :
    score >= 7 ? 'cr-good' :
    score >= 5 ? 'cr-mid' :
    score >= 3 ? 'cr-poor' : 'cr-fail';

  const lineCount = (outbound.match(/\n/g) || []).length + 1;

  let r = `<div class="cr-report">`;

  // ✅ SCORE CARD
  r += `
  <div class="cr-scorecard ${scoreClass}">
    <div class="cr-score-ring">
      <span class="cr-score-val">${score}</span>
      <span class="cr-score-of">/10</span>
    </div>

    <div class="cr-score-right">
      <div class="cr-badges">
        ${criticalCount > 0 ? `<span class="cr-b cr-b-c">${criticalCount} Critical</span>` : ''}
        ${warningCount > 0 ? `<span class="cr-b cr-b-w">${warningCount} Warning</span>` : ''}
      </div>

      <div class="cr-lang">
        <code>Code</code> · ${fileCount} file${fileCount > 1 ? 's' : ''} · ${lineCount} lines
      </div>

      <div class="cr-verdict">${verdict}</div>
    </div>
  </div>
  `;

  const buildBucket = (title: string, icon: string, items: any[], cls: string, cardCls: string, isOpen: boolean) => {
    let h = `<details class="cr-sec ${cls}"${isOpen ? ' open' : ''}><summary>`;
    h += `<span class="cr-sec-icon">${icon}</span>`;
    h += `<span style="flex:1">${title}</span>`;
    h += `<span class="cr-sec-count">${items.length}</span>`;
    h += `</summary><div class="cr-list">`;

    for (const f of items) {
      const si = f.severity === 'critical' ? '🔴' : f.severity === 'warning' ? '🟠' : '🔵';

      h += `<div class="cr-card ${cardCls}">
        <div class="cr-card-cat">${si} ${f.category}</div>
        ${f.file ? `<div style="font-size:0.75rem; opacity:0.6;">📄 ${f.file}</div>` : ''}
        <div class="cr-card-issue">${f.issue}</div>
      </div>`;
    }

    h += `</div></details>`;
    return h;
  };

  const criticals = mergedFindings.filter(f => f.severity === 'critical');
  const warnings = mergedFindings.filter(f => f.severity === 'warning');
  const infos = mergedFindings.filter(f => f.severity === 'info');

  if (criticals.length > 0)
    r += buildBucket('Critical Issues', '🔴', criticals, 'cr-sec-c', 'cr-card-c', true);

  if (warnings.length > 0)
    r += buildBucket('Warnings', '🟠', warnings, 'cr-sec-w', 'cr-card-w', false);

  if (infos.length > 0)
    r += buildBucket('Info', '🔵', infos, 'cr-sec-i', 'cr-card-i', false);

  r += buildBucket('Review Summary', '📋', mergedFindings, 'cr-sec-a', 'cr-card-c', false);

  return r + `</div>`;
}