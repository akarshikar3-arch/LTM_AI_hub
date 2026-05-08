using System.Text.RegularExpressions;

namespace AzureAgentApi;

public static class CodeReviewEngine
{
    private const double CriticalPenalty = 2.0;
    private const double WarningPenalty  = 1.0;
    private const double InfoPenalty     = 0.5;

    public static AgentResponse Analyze(string sourceCode)
    {
        if (string.IsNullOrWhiteSpace(sourceCode))
            return EmptyResponse();

        // ✅ LIMIT ANALYSIS SIZE (VERY IMPORTANT)
 if (sourceCode.Length > 5000)
{
    var firstPart = sourceCode.Substring(0, 2500);
    var lastPart = sourceCode.Substring(sourceCode.Length - 2500);

    sourceCode = firstPart + "\n" + lastPart;
}


        var lines = sourceCode.Split(new[] { "\n", "\r\n" }, StringSplitOptions.None);
        var findings = new List<Finding>();

        CheckMemoryLifecycle(sourceCode, findings);
        CheckTypeSafety(sourceCode, findings);
        CheckPerformance(sourceCode, lines, findings);
        CheckBestPractices(sourceCode, lines, findings);
        CheckSecurity(sourceCode, findings);
        CheckAngularSpecific(sourceCode, findings);
        CheckTestingQuality(sourceCode, findings);
        CheckCodeStructure(sourceCode, lines, findings);

        int critical = findings.Count(f => f.Severity == "critical");
        int warnings = findings.Count(f => f.Severity == "warning");
        int info     = findings.Count(f => f.Severity == "info");

        double raw = 10.0
                     - (critical * CriticalPenalty)
                     - (warnings * WarningPenalty)
                     - (info * InfoPenalty);
        double score = Math.Clamp(Math.Round(raw, 1), 0, 10);

        return new AgentResponse
        {
            LanguageDetected = DetectLanguage(sourceCode),
            LinesScanned     = lines.Length,
            Score = new CodeScore
            {
                Value          = score,
                Label          = ScoreLabel(score),
                Recommendation = ScoreRecommendation(score)
            },
            Summary = new ReviewSummary
            {
                TotalIssues = findings.Count,
                Critical    = critical,
                Warnings    = warnings,
                Info        = info
            },
            Findings = findings
        };
    }

    private static void CheckMemoryLifecycle(string src, List<Finding> f)
    {
        // Rule 1
        if (src.Contains(".subscribe(") &&
            !src.Contains("unsubscribe") && !src.Contains("takeUntil") &&
            !src.Contains("take(1)") && !src.Contains("first()") && !src.Contains("async"))
            f.Add(MakeFinding("Memory & Lifecycle", "critical",
                ".subscribe() without unsubscribe -- potential memory leak",
                "Store subscription and call .unsubscribe() in ngOnDestroy(), or use takeUntil/async pipe",
                ".subscribe("));

        // Rule 2
        if (src.Contains(".subscribe(") && !src.Contains("ngOnDestroy"))
            f.Add(MakeFinding("Memory & Lifecycle", "critical",
                "No ngOnDestroy() found -- subscriptions will leak",
                "Implement OnDestroy interface and clean up subscriptions",
                "ngOnDestroy missing"));

        // Rule 3
        if (src.Contains("setInterval(") && !src.Contains("clearInterval"))
            f.Add(MakeFinding("Memory & Lifecycle", "critical",
                "setInterval() without clearInterval() -- timer will run forever",
                "Store interval ID and call clearInterval() in ngOnDestroy()",
                "setInterval("));

        // Rule 4
        if (src.Contains("setTimeout("))
            f.Add(MakeFinding("Memory & Lifecycle", "warning",
                "setTimeout() used in component -- may cause issues with change detection",
                "Consider using RxJS timer() or delay() operator instead",
                "setTimeout("));

        // Rule 5
        if (src.Contains("addEventListener(") && !src.Contains("removeEventListener"))
            f.Add(MakeFinding("Memory & Lifecycle", "critical",
                "addEventListener() without removeEventListener() -- event handler leak",
                "Remove event listener in ngOnDestroy()",
                "addEventListener("));

        // Rule 6
        int subCount = CountOccurrences(src, ".subscribe(");
        if (subCount >= 3 && !src.Contains("takeUntil"))
            f.Add(MakeFinding("Memory & Lifecycle", "critical",
                "Multiple subscriptions (3+) without takeUntil pattern",
                "Use a destroy$ Subject + takeUntil() pattern for centralized cleanup",
                "3+ .subscribe() calls"));

        // Rule 7
        if (src.Contains("new Subject") && !src.Contains(".complete()"))
            f.Add(MakeFinding("Memory & Lifecycle", "warning",
                "Subject created but .complete() is never called",
                "Call subject.complete() in ngOnDestroy()",
                "new Subject"));

        // Rule 8
        if (src.Contains("this.http.") && src.Contains(".subscribe(") &&
            !src.Contains("take(1)") && !src.Contains("first()"))
            f.Add(MakeFinding("Memory & Lifecycle", "info",
                "HTTP observable subscribed without take(1) or first()",
                "HTTP calls complete automatically, but take(1) makes intent explicit",
                "http + .subscribe"));
    }

    private static void CheckTypeSafety(string src, List<Finding> f)
    {
        // Rule 9
        int anyCount = CountOccurrences(src, ": any") + CountOccurrences(src, "<any>") + CountOccurrences(src, "as any");
        if (anyCount > 0)
            f.Add(MakeFinding("Type Safety", "warning",
                "any type used " + anyCount + " time(s) -- weakens type safety",
                "Replace with proper interfaces or generics",
                "any x " + anyCount));

        // Rule 10
        if (src.Contains(") {") && !src.Contains("): "))
            f.Add(MakeFinding("Type Safety", "warning",
                "Functions without explicit return types detected",
                "Add return types for better maintainability",
                "missing return type"));

        // Rule 11
        if (src.Contains(": Object") || src.Contains(": object"))
            f.Add(MakeFinding("Type Safety", "warning",
                "Object or object type used instead of a specific interface",
                "Define a typed interface that describes the shape",
                ": Object / : object"));

        // Rule 12
        int asCount = CountPattern(src, @"\bas\s+[A-Z]");
        if (asCount >= 3)
            f.Add(MakeFinding("Type Safety", "warning",
                "Type assertion as used " + asCount + " times -- may indicate design issue",
                "Prefer type guards or generics over type assertions",
                "as Type x " + asCount));

        // Rule 13
        int bangCount = CountOccurrences(src, "!.");
        if (bangCount >= 3)
            f.Add(MakeFinding("Type Safety", "warning",
                "Non-null assertion ! used " + bangCount + " times",
                "Use optional chaining (?.) or proper null checks instead",
                "variable!. x " + bangCount));

        // Rule 14
        if (src.Contains("=>") && !src.Contains(": ") && src.Contains("."))
            f.Add(MakeFinding("Type Safety", "info",
                "Callback parameters may have implicit any type",
                "Add explicit types to callback parameters",
                "=> without typed params"));

        // Rule 15
        if (src.Contains("@ts-ignore") || src.Contains("@ts-nocheck"))
            f.Add(MakeFinding("Type Safety", "warning",
                "@ts-ignore or @ts-nocheck found -- suppresses TypeScript safety",
                "Fix the underlying type error instead of suppressing it",
                "@ts-ignore / @ts-nocheck"));
    }

    private static void CheckPerformance(string src, string[] lines, List<Finding> f)
    {
        // Rule 16
        if (src.Contains("*ngFor") && !src.Contains("trackBy"))
            f.Add(MakeFinding("Performance", "warning",
                "*ngFor used without trackBy -- causes unnecessary DOM re-renders",
                "Add trackBy function to *ngFor directives",
                "*ngFor without trackBy"));

        // Rule 17
        if (src.Contains("@Component") && !src.Contains("ChangeDetectionStrategy.OnPush"))
            f.Add(MakeFinding("Performance", "warning",
                "Component not using OnPush change detection strategy",
                "Add changeDetection: ChangeDetectionStrategy.OnPush to @Component",
                "Default change detection"));

        // Rule 18
        if (src.Contains("{{") && src.Contains("(") && src.Contains("}}"))
            f.Add(MakeFinding("Performance", "warning",
                "Possible function call in template interpolation {{ fn() }}",
                "Use a computed property, getter, or pipe instead",
                "{{ functionName() }}"));

        // Rule 19
        if (lines.Length > 200)
            f.Add(MakeFinding("Performance", "warning",
                "Component file is " + lines.Length + " lines -- consider splitting",
                "Extract logic into services, pipes, or child components",
                lines.Length + " lines"));

        // Rule 20
        if (CountOccurrences(src, ".subscribe(") >= 2 && src.Contains(".subscribe(") && src.Contains("=> {"))
            if (src.IndexOf(".subscribe(", src.IndexOf(".subscribe(") + 1) > 0)
                f.Add(MakeFinding("Performance", "warning",
                    "Possible nested .subscribe() detected -- leads to callback hell",
                    "Use switchMap, mergeMap, or concatMap instead",
                    "subscribe inside subscribe"));

        // Rule 21
        if (src.Contains("import * as"))
            f.Add(MakeFinding("Performance", "warning",
                "Wildcard import (import * as) -- hurts tree-shaking",
                "Import only what you need",
                "import * as"));

        // Rule 22
        if (src.Contains("ngOnInit"))
        {
            int initStart = src.IndexOf("ngOnInit");
            int initEnd = FindClosingBrace(src, initStart);
            if (initEnd > initStart)
            {
                string initBody = src.Substring(initStart, initEnd - initStart);
                int initLines = initBody.Split(new[] { "\n" }, StringSplitOptions.None).Length;
                if (initLines > 20)
                    f.Add(MakeFinding("Performance", "warning",
                        "ngOnInit is " + initLines + " lines -- too much logic in lifecycle hook",
                        "Extract initialization logic into dedicated service methods",
                        "ngOnInit: " + initLines + " lines"));
            }
        }
    }

    private static void CheckBestPractices(string src, string[] lines, List<Finding> f)
    {
        // Rule 23
        int logCount = CountOccurrences(src, "console.log(") + CountOccurrences(src, "console.warn(") + CountOccurrences(src, "console.error(");
        if (logCount > 0)
            f.Add(MakeFinding("Best Practices", "info",
                "console.log/warn/error found (" + logCount + " instance(s))",
                "Remove console statements or replace with a logging service",
                "console x " + logCount));

        // Rule 24
        int magicCount = CountPattern(src, @"\b\d{3,}\b");
        if (magicCount >= 2)
            f.Add(MakeFinding("Best Practices", "info",
                "Magic numbers found (" + magicCount + " instances)",
                "Extract to named constants for readability",
                "bare numeric literals"));

        // Rule 25 (simplified - check for repeated common strings)
        if (CountOccurrences(src, "// this.") + CountOccurrences(src, "// const ") +
            CountOccurrences(src, "// let ") + CountOccurrences(src, "// var ") +
            CountOccurrences(src, "// import ") + CountOccurrences(src, "// return ") >= 2)
            f.Add(MakeFinding("Best Practices", "info",
                "Commented-out code detected",
                "Remove dead code -- use version control for history",
                "commented code"));

        // Rule 26 (placeholder for repeated strings - simplified)

        // Rule 27
        if (lines.Length > 30 && CountOccurrences(src, "function ") + CountOccurrences(src, "() {") <= 3)
            f.Add(MakeFinding("Best Practices", "info",
                "Possible long function(s) -- few function definitions for the file size",
                "Break into smaller, focused functions",
                "file size vs function count"));

        // Rule 28
        int maxIndent = 0;
        foreach (var line in lines)
        {
            int spaces = line.Length - line.TrimStart().Length;
            int indent = spaces / 2;
            if (indent > maxIndent) maxIndent = indent;
        }
        if (maxIndent > 6)
            f.Add(MakeFinding("Best Practices", "info",
                "Deeply nested code detected (indent level ~" + maxIndent + ")",
                "Refactor using early returns, guard clauses, or extract methods",
                "nesting depth ~" + maxIndent));

        // Rule 29
        if (src.Contains("catch") && src.Contains("{ }"))
            f.Add(MakeFinding("Best Practices", "info",
                "Empty catch block -- errors are being silently swallowed",
                "Log the error or handle it meaningfully",
                "catch (e) { }"));

        // Rule 30
        if ((src.Contains("http://") || src.Contains("https://") || src.Contains("/api/")) && !src.Contains("localhost"))
            f.Add(MakeFinding("Best Practices", "info",
                "Hardcoded URL(s) found",
                "Move API URLs to environment configuration files",
                "hardcoded URLs"));
    }

    private static void CheckSecurity(string src, List<Finding> f)
    {
        // Rule 31
        if (src.Contains("[innerHTML]"))
            f.Add(MakeFinding("Security", "critical",
                "[innerHTML] binding found -- XSS risk",
                "Use Angular DomSanitizer or avoid innerHTML entirely",
                "[innerHTML]"));

        // Rule 32
        if (src.Contains("bypassSecurityTrust"))
            f.Add(MakeFinding("Security", "critical",
                "bypassSecurityTrust used -- disables Angular XSS protection",
                "Avoid bypassing security; sanitize data properly instead",
                "bypassSecurityTrust"));

        // Rule 33
        if (src.Contains("apiKey") || src.Contains("secret") || src.Contains("password =") || src.Contains("token ="))
            if (src.Contains("= ") && !src.Contains("environment."))
                f.Add(MakeFinding("Security", "critical",
                    "Possible hardcoded secret/API key/password detected",
                    "Move secrets to environment variables or a secure vault",
                    "secret/apiKey/password in code"));

        // Rule 34
        if (src.Contains("eval("))
            f.Add(MakeFinding("Security", "critical",
                "eval() usage detected -- severe security vulnerability",
                "Never use eval(); find a safe alternative",
                "eval("));

        // Rule 35
        if (src.Contains("document.cookie"))
            f.Add(MakeFinding("Security", "critical",
                "Direct document.cookie access -- vulnerable to XSS cookie theft",
                "Use a secure cookie service with HttpOnly flag",
                "document.cookie"));

        // Rule 36
        if (src.Contains("http://") && !src.Contains("localhost") && !src.Contains("127.0.0.1"))
            f.Add(MakeFinding("Security", "critical",
                "HTTP (non-secure) URL found in code",
                "Always use HTTPS for API and external URLs",
                "http://"));
                // ✅ GENERIC SECURITY RULES (for PHP / backend code)

// SQL Injection
if (src.Contains("$_GET") || src.Contains("$_POST") || src.Contains("$_REQUEST"))
{
    if (!src.Contains("prepare") && !src.Contains("sanitize") && !src.Contains("escape"))
        f.Add(MakeFinding("Security", "critical",
            "User input used without sanitization -- SQL Injection risk",
            "Sanitize or validate all external inputs before using in queries",
            "$_GET / $_POST usage"));
}

// 🔴 Direct SQL query (your existing rule - keep it)
if (src.Contains("SELECT") && (src.Contains("+") || src.Contains(".")))
{
    f.Add(MakeFinding("Security", "critical",
        "Dynamic SQL query detected -- possible SQL injection",
        "Use parameterized queries or prepared statements",
        "SQL string concatenation"));
}

// 🔴 SQL Injection (stronger regex)
if (Regex.IsMatch(src, @"(SELECT|INSERT|UPDATE|DELETE).*\+\s*(req\.|id|user|name|pass)"))
{
    f.Add(MakeFinding("Security", "critical",
        "SQL Injection: User input is directly concatenated into SQL query",
        "Use parameterized queries instead",
        "SQL concatenation with user input"));
}

// 🔴 Hardcoded Secrets
if (Regex.IsMatch(src, @"(API_KEY|SECRET|PASSWORD|DB_PASS|TOKEN)\s*=\s*[""'][^""']{5,}[""']", RegexOptions.IgnoreCase))
{
    f.Add(MakeFinding("Security", "critical",
        "Hardcoded Secrets: API keys, passwords, or tokens found in source code",
        "Use environment variables instead",
        "Hardcoded credentials"));
}

// 🔴 Command Injection
if (src.Contains("exec(") && (src.Contains("req.") || src.Contains("+ ")))
{
    f.Add(MakeFinding("Security", "critical",
        "Command Injection: User input is passed to exec() without sanitization",
        "Use execFile() with validated arguments instead",
        "exec with user input"));
}

// 🔴 XSS (response injection)
if (src.Contains("res.send") && src.Contains("+ ") && src.Contains("req."))
{
    f.Add(MakeFinding("Security", "critical",
        "Cross-Site Scripting (XSS): User input is directly embedded in HTML response",
        "Sanitize output before rendering",
        "res.send with user input"));
}

// 🔴 XSS (echo/print - your existing rule - keep it)
if (src.Contains("echo") || src.Contains("print"))
{
    if (!src.Contains("htmlspecialchars") && !src.Contains("encode"))
        f.Add(MakeFinding("Security", "critical",
            "Output not escaped -- possible XSS vulnerability",
            "Use htmlspecialchars() or proper encoding",
            "echo/print"));
}


// XSS detection
if (src.Contains("echo") || src.Contains("print"))
{
    if (!src.Contains("htmlspecialchars") && !src.Contains("encode"))
        f.Add(MakeFinding("Security", "critical",
            "Output not escaped -- possible XSS vulnerability",
            "Use htmlspecialchars() or proper encoding",
            "echo/print"));
}
// 🔴 Hardcoded credentials in comparison
if (Regex.IsMatch(src, @"===?\s*[""'](admin|root|password|123|secret)", RegexOptions.IgnoreCase))
{
    f.Add(MakeFinding("Security", "critical",
        "Hardcoded credentials found in authentication logic",
        "Use secure credential storage and hashing",
        "Hardcoded auth comparison"));
}

// 🔴 innerHTML XSS
if (src.Contains("innerHTML") && !src.Contains("sanitize") && !src.Contains("encode"))
{
    f.Add(MakeFinding("Security", "critical",
        "DOM XSS: User input assigned to innerHTML without sanitization",
        "Use textContent or sanitize input before rendering",
        "innerHTML assignment"));
}
// 🔴 innerHTML XSS
if (src.Contains("innerHTML") && !src.Contains("sanitize") && !src.Contains("encode"))
{
    f.Add(MakeFinding("Security", "critical",
        "DOM XSS: User input assigned to innerHTML without sanitization",
        "Use textContent or sanitize input before rendering",
        "innerHTML assignment"));
}
// 🔴 SSRF (Server-Side Request Forgery)
if ((src.Contains("axios.get") || src.Contains("fetch(") || src.Contains("http.get")) &&
    (src.Contains("req.query") || src.Contains("req.body") || src.Contains("req.params")))
{
    f.Add(MakeFinding("Security", "critical",
        "SSRF: User-controlled input is used as a URL for server-side requests",
        "Validate and whitelist allowed URLs before making requests",
        "User input in HTTP request URL"));
}

// 🔴 Logging Sensitive Data
if (src.Contains("console.log") &&
    Regex.IsMatch(src, @"(card|cvv|ssn|password|secret|token|creditCard|credit_card)", RegexOptions.IgnoreCase))
{
    f.Add(MakeFinding("Security", "critical",
        "Sensitive data logged: Passwords, tokens, or financial data found in console.log",
        "Never log sensitive information. Use a secure logging framework with redaction",
        "console.log with sensitive data"));
}

// 🔴 Hardcoded API Keys (pattern-based)
if (Regex.IsMatch(src, @"(sk-|sk_live|sk_test|ghp_|gsk_|AKIA)[a-zA-Z0-9]{10,}"))
{
    f.Add(MakeFinding("Security", "critical",
        "Hardcoded API Key: Live API key pattern detected in source code",
        "Use environment variables or a secrets manager",
        "API key pattern detected"));
}

// 🔴 Insecure Cookie (no httpOnly/secure flags)
if (src.Contains("res.cookie") && !src.Contains("httpOnly") && !src.Contains("secure"))
{
    f.Add(MakeFinding("Security", "warning",
        "Insecure Cookie: Cookie set without httpOnly and secure flags",
        "Always set httpOnly: true and secure: true on sensitive cookies",
        "res.cookie without security flags"));
}

// 🔴 Prototype Pollution
if (src.Contains("for") && src.Contains("in") && src.Contains("source") &&
    !src.Contains("hasOwnProperty"))
{
    f.Add(MakeFinding("Security", "critical",
        "Prototype Pollution: Object merge without hasOwnProperty check",
        "Always check hasOwnProperty() when iterating object keys from user input",
        "Unsafe object merge"));
}

// 🟠 Empty catch block
if (Regex.IsMatch(src, @"catch\s*\([^)]*\)\s*\{\s*\}"))
{
    f.Add(MakeFinding("Code Quality", "warning",
        "Empty catch block: Errors are silently swallowed",
        "Log or handle errors properly in catch blocks",
        "Empty catch"));
}
// file include vulnerability
if (src.Contains("include(") || src.Contains("require("))
{
    f.Add(MakeFinding("Security", "warning",
        "Dynamic file include detected -- possible file inclusion vulnerability",
        "Validate file paths before including",
        "include()/require()"));
}
    }

    private static void CheckAngularSpecific(string src, List<Finding> f)
    {
        // Rule 37
        if (src.Contains("@Component") && !src.Contains("standalone: true"))
            f.Add(MakeFinding("Angular-Specific", "warning",
                "Component not using standalone: true (Angular 17+ recommended)",
                "Add standalone: true to @Component decorator",
                "standalone missing"));

        // Rule 38
        if (src.Contains("constructor(private") || src.Contains("constructor( private"))
            f.Add(MakeFinding("Angular-Specific", "info",
                "Using constructor injection -- modern Angular prefers inject()",
                "Consider using inject() function for dependency injection",
                "constructor(private ...)"));

        // Rule 39
        if (src.Contains("ngOnInit(") && !src.Contains("implements") && !src.Contains("OnInit"))
            f.Add(MakeFinding("Angular-Specific", "warning",
                "ngOnInit() defined but OnInit interface not declared",
                "Add implements OnInit to the class declaration",
                "ngOnInit without implements OnInit"));

        // Rule 40
        if (src.Contains("ngOnDestroy(") && !src.Contains("implements") && !src.Contains("OnDestroy"))
            f.Add(MakeFinding("Angular-Specific", "warning",
                "ngOnDestroy() defined but OnDestroy interface not declared",
                "Add implements OnDestroy to the class declaration",
                "ngOnDestroy without implements OnDestroy"));

        // Rule 41
        if (src.Contains("document.getElementById") || src.Contains("document.querySelector"))
            f.Add(MakeFinding("Angular-Specific", "warning",
                "Direct DOM manipulation detected -- breaks Angular abstraction",
                "Use @ViewChild / ElementRef / Renderer2 instead",
                "document.getElementById / querySelector"));

        // Rule 42
        int subs = CountOccurrences(src, ".subscribe(");
        if (subs >= 3 && !src.Contains("| async"))
            f.Add(MakeFinding("Angular-Specific", "warning",
                subs + " manual subscriptions -- consider using async pipe",
                "Async pipe auto-subscribes and auto-unsubscribes",
                ".subscribe() x " + subs));

        // Rule 43
        if (src.Contains("FormsModule") && !src.Contains("ngModel") && !src.Contains("formControl"))
            f.Add(MakeFinding("Angular-Specific", "info",
                "FormsModule imported but no form directives detected",
                "Remove unused module imports to reduce bundle size",
                "FormsModule without ngModel"));

        // Rule 44
        if (src.Contains("Module") && src.Contains("import") && src.Contains("from") && !src.Contains("loadChildren") && !src.Contains("loadComponent"))
            f.Add(MakeFinding("Angular-Specific", "info",
                "Eager module imports detected without lazy loading",
                "Use loadChildren or loadComponent in routes",
                "import Module without lazy loading"));
    }

    private static void CheckTestingQuality(string src, List<Finding> f)
    {
        // Rule 45
        if (src.Contains("should create") && CountOccurrences(src, "it(") <= 1)
            f.Add(MakeFinding("Testing & Quality", "info",
                "Test file has only should create -- minimal coverage",
                "Add meaningful test cases for inputs, outputs, edge cases",
                "only should create"));

        // Rule 46
        if (src.Contains("fdescribe(") || src.Contains("fit("))
            f.Add(MakeFinding("Testing & Quality", "warning",
                "Focused tests (fdescribe/fit) found -- will skip all other tests",
                "Remove fdescribe/fit before committing",
                "fdescribe/fit"));

        // Rule 47
        if (src.Contains("xdescribe(") || src.Contains("xit("))
            f.Add(MakeFinding("Testing & Quality", "info",
                "Skipped tests (xdescribe/xit) found",
                "Fix or remove skipped tests",
                "xdescribe/xit"));

        // Rule 48
        if ((src.Contains(".spec") || src.Contains("describe(") || src.Contains("it(")) &&
            !src.Contains("throwError") && !src.Contains(".error") && !src.Contains("toThrow"))
            f.Add(MakeFinding("Testing & Quality", "info",
                "No error scenario testing detected",
                "Add test cases for error/failure paths",
                "no error testing"));
    }

    private static void CheckCodeStructure(string src, string[] lines, List<Finding> f)
    {
        // Rule 49
        if (lines.Length > 300)
            f.Add(MakeFinding("Code Structure", "info",
                "File is " + lines.Length + " lines -- very large",
                "Split into multiple files by responsibility",
                lines.Length + " lines"));

        // Rule 50
        if (src.Contains("this.http.") && src.Contains("@Component") &&
            (src.Contains(".transform(") || src.Contains(".format(") || src.Contains(".parse(")))
            f.Add(MakeFinding("Code Structure", "warning",
                "Component contains HTTP calls AND data transformation logic",
                "Move HTTP to a service and transformation to a pipe or utility",
                "HTTP + transform in component"));

        // Rule 51
        int poorNames = CountOccurrences(src, "let data") + CountOccurrences(src, "let temp") +
            CountOccurrences(src, "const data") + CountOccurrences(src, "const temp") +
            CountOccurrences(src, "let val") + CountOccurrences(src, "let res") +
            CountOccurrences(src, "const val") + CountOccurrences(src, "const res") +
            CountOccurrences(src, "var data") + CountOccurrences(src, "var temp");
        if (poorNames >= 2)
            f.Add(MakeFinding("Code Structure", "info",
                "Generic variable names found (" + poorNames + " instances: data, temp, val, res)",
                "Use descriptive, meaningful variable names",
                "poor names x " + poorNames));

        // Rule 52
        if (src.Contains("_") && CountPattern(src, @"[a-z]+_[a-z]+") > 0 && CountPattern(src, @"[a-z]+[A-Z]") > 0)
            f.Add(MakeFinding("Code Structure", "info",
                "Mix of snake_case and camelCase naming detected",
                "Use consistent camelCase per Angular style guide",
                "mixed naming conventions"));

        // Rule 53
        if (src.Contains("private ") && src.Contains(":") && !src.Contains("private readonly"))
            f.Add(MakeFinding("Code Structure", "info",
                "Injected services not marked as readonly",
                "Use private readonly for injected dependencies",
                "private svc without readonly"));

        // Rule 54
        int exportCount = CountOccurrences(src, "export ");
        if (exportCount > 20)
            f.Add(MakeFinding("Code Structure", "info",
                "File has " + exportCount + " exports -- possible oversized barrel file",
                "Split barrel files by feature area",
                exportCount + " exports"));

        // Rule 55
        if (src.Contains("@Component") && src.Contains("this.http.") && src.Contains(".subscribe(") &&
            (src.Contains("*ngFor") || src.Contains("*ngIf")))
            f.Add(MakeFinding("Code Structure", "warning",
                "Component handles HTTP, subscriptions, AND template logic",
                "Separate concerns: service for HTTP, component for presentation",
                "mixed responsibilities"));
    }

    private static Finding MakeFinding(string category, string severity, string issue, string suggestion, string pattern)
    {
        string icon = severity switch
        {
            "critical" => "[CRITICAL]",
            "warning" => "[WARNING]",
            "info" => "[INFO]",
            _ => ""
        };
        return new Finding
        {
            Category = category,
            CategoryIcon = icon,
            Severity = severity,
            Issue = issue,
            Suggestion = suggestion,
            PatternFound = pattern
        };
    }

    private static int CountOccurrences(string text, string search)
    {
        int count = 0;
        int idx = 0;
        while ((idx = text.IndexOf(search, idx, StringComparison.Ordinal)) != -1)
        {
            count++;
            idx += search.Length;
        }
        return count;
    }

    private static int CountPattern(string text, string pattern)
    {
        return Regex.Matches(text, pattern).Count;
    }

    private static int FindClosingBrace(string src, int startIndex)
    {
        int braceStart = src.IndexOf("{", startIndex);
        if (braceStart == -1) return -1;
        int depth = 0;
        for (int i = braceStart; i < src.Length; i++)
        {
            if (src[i] == '{') depth++;
            if (src[i] == '}') depth--;
            if (depth == 0) return i;
        }
        return -1;
    }

    private static string DetectLanguage(string src)
    {
        if (src.Contains("@Component") || src.Contains("@Injectable") ||
            src.Contains("@NgModule") || src.Contains("@Directive") || src.Contains("@Pipe"))
            return "TypeScript / Angular";
        if (src.Contains("import {") && src.Contains("from ") || src.Contains("export class") || src.Contains("export interface"))
            return "TypeScript";
        if (src.Contains("function ") || src.Contains("const ") || src.Contains("var "))
            return "JavaScript";
        return "Unknown";
    }

    private static string ScoreLabel(double s)
    {
        if (s >= 9) return "[EXCELLENT]";
        if (s >= 7) return "[GOOD]";
        if (s >= 5) return "[NEEDS WORK]";
        if (s >= 3) return "[POOR]";
        return "[FAIL]";
    }

    private static string ScoreRecommendation(double s)
    {
        if (s >= 9) return "Ready for merge";
        if (s >= 7) return "Minor improvements recommended";
        if (s >= 5) return "Fix warnings before merge";
        if (s >= 3) return "Critical issues must be resolved";
        return "Do not merge -- major rework needed";
    }

    private static AgentResponse EmptyResponse()
    {
        return new AgentResponse
        {
            LanguageDetected = "No code detected",
            LinesScanned = 0,
            Score = new CodeScore { Value = 10, Label = "[EXCELLENT]", Recommendation = "No code to review" },
            Summary = new ReviewSummary(),
            Findings = new List<Finding>()
        };
    }
}