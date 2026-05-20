import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AgentApiService } from './agent-api.service';
import { AiService } from './ai.service';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class CodeReviewService {

  constructor(
    private agentApi: AgentApiService,
    private aiService: AiService
  ) {}


  // ✅ CODE REVIEW (simple case)
  async reviewCode(code: string) {
    const ruleRes = await firstValueFrom(
      this.agentApi.executeCodeReview(code)
    );

    let aiFindings: any[] = [];
    try {
      const aiRes: any = await firstValueFrom(
        this.aiService.codeReview(code)
      );
      aiFindings = aiRes?.findings || [];
    } catch {}

    return [
      ...(ruleRes?.findings || []),
      ...aiFindings
    ].filter(f => f.category !== 'AI Error');
  }

  // ✅ REPO REVIEW (FIXED)
  async reviewRepo(repoUrl: string) {
console.log("📁 Fetching repo…", repoUrl); 

    try {
      const cleanUrl = repoUrl.replace('.git', '');
const parts = cleanUrl.split('/');
const owner = parts[3];
const repo = parts[4];


      let branch = 'main';

      // ✅ get repo metadata
      let apiUrl = `https://api.github.com/repos/${owner}/${repo}`;
      let repoMeta = await fetch(
        `${environment.apiUrl}/api/github/proxy?url=${encodeURIComponent(apiUrl)}`
      ).then(r => r.json());
      if (repoMeta?.message === "Not Found") {
  throw new Error("⚠️ Repository not found");
}
      console.log("📌 Repo meta:", repoMeta);

      branch = repoMeta.default_branch || 'main';

      // ✅ get file tree
      apiUrl = `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`;
      const response = await fetch(
        `${environment.apiUrl}/api/github/proxy?url=${encodeURIComponent(apiUrl)}`
      );

      if (!response.ok) throw new Error("Tree fetch failed");

      const tree = await response.json();
      if (!tree || !tree.tree) {
  throw new Error("⚠️ Invalid repo structure");
}
      console.log("🌳 Tree response:", tree);


      // ✅ filter files
      console.log("📦 Total files in repo:", tree.tree?.length);

      if (!tree?.tree) {
  throw new Error("Invalid repo structure (tree missing)");
}

let codeFiles = tree.tree
  .filter((f: any) => {
    // ✅ Handle submodules safely
    if (f.mode === '160000') {
      console.log("⚠️ Submodule detected:", f.path);
      return false;
    }
    return f.type === 'blob';
  })
  .filter((f: any) => {
    const p = f.path.toLowerCase();
    return (
      !p.includes('node_modules') &&
      !p.includes('dist') &&
      (p.endsWith('.ts') || p.endsWith('.js'))
    );
  })
  .slice(0, 8);
  if (codeFiles.length === 0) {
  return {
    findings: [],
    code: '',
    fileCount: 0
  };
}

        console.log("📂 Filtered files:", codeFiles.length);

      let allFindings: any[] = [];
      let combinedCode = "";
      let validFileCount = 0;

      for (const file of codeFiles) {
      

        try {
          const fileUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${file.path}`;
          
          const resFile = await fetch(
            `${environment.apiUrl}/api/github/proxy?url=${encodeURIComponent(fileUrl)}`
          );

          if (!resFile.ok) continue;

          const code = await resFile.text();

            if (code.length > 20000) {
  console.log("⚠️ Large file skipped:", file.path);
  continue;
}
          if (!code || code.length < 50) continue;

          combinedCode += code + "\n";
          validFileCount++;

          // ✅ rules
          const res = await firstValueFrom(
           this.agentApi.executeCodeReviewWithPath(
  code.slice(0, 2000),
  file.path   // ✅ PASS FILE PATH
)
          );

          const ruleFindings = res?.findings || [];
          allFindings.push(...ruleFindings);

          // ✅ AI
          try {
            const aiRes: any = await firstValueFrom(
              this.aiService.codeReview(code.slice(0, 3000))
            );
            allFindings.push(...(aiRes?.findings || []));
          } catch {}

        } catch {}
      }

      return {
        findings: allFindings.filter(f => f.category !== 'AI Error'),
        code: combinedCode,
        fileCount: validFileCount
      };

    } catch (e) {
      throw new Error('Repo review failed');
    }
  }
}