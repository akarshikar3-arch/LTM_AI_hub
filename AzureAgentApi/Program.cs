using AzureAgentApi;
var builder = WebApplication.CreateBuilder(args);
Console.WriteLine("✅ PROGRAM LOADED");
builder.Services.AddHttpClient();
builder.Services.AddControllers();

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader());
});

var app = builder.Build();

app.UseCors();

app.UseRouting();
app.MapControllers();

app.MapGet("/health", () => Results.Ok(new { status = "OK" }));

app.MapPost("/api/agent/execute", async (HttpRequest request) =>
{
    using var reader = new StreamReader(request.Body);
    var code = await reader.ReadToEndAsync();

    Console.WriteLine("🔧 RULE ENGINE HIT, code length: " + code.Length);

    // ✅ Detect file path from header (we will pass it from frontend)
var filePath = request.Headers["x-file-path"].ToString().ToLower();

// ✅ Skip useless files
if (!string.IsNullOrEmpty(filePath) &&
    (filePath.Contains("node_modules") ||
     filePath.Contains("/dist/") ||
     filePath.Contains("\\dist\\") ||
     filePath.Contains(".git") ||
     filePath.EndsWith(".min.js") ||
     filePath.EndsWith(".map")))
{
    return Results.Ok(new
    {
        skipped = true,
        reason = "Filtered non-source file"
    });
}

// ✅ Skip huge/minified content
if (code.Length > 200000)
{
    return Results.Ok(new
    {
        skipped = true,
        reason = "File too large (likely bundle)"
    });
}

// ✅ Only then analyze
var result = CodeReviewEngine.Analyze(code);


    Console.WriteLine("🔧 FINDINGS: " + result.Findings.Count);

    return Results.Ok(new
    {
        findings = result.Findings.Select(f => new
        {
            category = f.Category,
            issue = f.Issue,
            severity = f.Severity
        })
    });
});

app.MapPost("/api/ai/code-review", async (HttpClient http, HttpRequest request) =>
{
    using var reader = new StreamReader(request.Body);
    var code = await reader.ReadToEndAsync();

    if (code.Length > 6000)
    {
        var firstPart = code.Substring(0, 1500);
        var lastPart = code.Substring(code.Length - 1500);
        code = firstPart + "\n" + lastPart;
    }

    Console.WriteLine("🔥 AI ENDPOINT HIT");

    var apiKey = Environment.GetEnvironmentVariable("GROQ_API_KEY");
if (string.IsNullOrEmpty(apiKey))
{
    Console.WriteLine("❌ GROQ KEY MISSING");

    return Results.Ok(new
    {
        findings = new[]
        {
            new {
                category = "AI Error",
                issue = "AI disabled (missing key)",
                severity = "warning"
            }
        }
    });
}
    var prompt = $@"
You are a strict security code reviewer.
Analyse this code for REAL exploitable security vulnerabilities ONLY.

RULES:
- ONLY report vulnerabilities that can be ACTIVELY EXPLOITED by an attacker
- Examples of real vulnerabilities: SQL injection with user input, XSS with unsanitized output, eval() with dynamic input, hardcoded API keys/passwords, command injection with user-controlled input
- Do NOT flag: method names, variable names, aliases, exports, internal mappings, or code structure as vulnerabilities
- Do NOT flag code just because it contains words like 'path', 'exec', 'method', or 'key'
- Each finding must be ONE line: Title: Description
- If the code is secure, return ONLY: No vulnerabilities detected.

CODE:
{code}
";

    var reqBody = new
    {
        model = "llama-3.1-8b-instant",
        messages = new[]
        {
            new { role = "user", content = prompt }
        },
        max_tokens = 500,
        temperature = 0.2
    };

    var httpRequest = new HttpRequestMessage(
        HttpMethod.Post,
        "https://api.groq.com/openai/v1/chat/completions"
    );

    httpRequest.Headers.Add("Authorization", $"Bearer {apiKey}");

    httpRequest.Content = new StringContent(
        System.Text.Json.JsonSerializer.Serialize(reqBody),
        System.Text.Encoding.UTF8,
        "application/json"
    );

    var response = await http.SendAsync(httpRequest);

    if (!response.IsSuccessStatusCode)
    {
        Console.WriteLine("❌ API FAILED: " + response.StatusCode);

        return Results.Ok(new
        {
            findings = new[]
            {
                new {
                    category = "AI Error",
                    issue = "AI service failed (check API key or quota).",
                    severity = "warning"
                }
            }
        });
    }

    var result = await response.Content.ReadAsStringAsync();

    Console.WriteLine("🔥 RAW AI RESPONSE:");
    Console.WriteLine(result);

    List<object> findings = new();

    try
    {
        var parsed = System.Text.Json.JsonDocument.Parse(result);

        if (parsed.RootElement.TryGetProperty("choices", out var choices))
        {
            var reply = choices[0]
                .GetProperty("message")
                .GetProperty("content")
                .GetString() ?? "";

            var lines = reply
                .Replace("*", "")
                .Replace("+", "")
                .Replace("- ", "")
                .Replace("#", "")
                .Replace(">", "")
                .Split('\n')
                .Select(l => System.Text.RegularExpressions.Regex.Replace(l.Trim(), @"^\d+\.\s*", ""))
                .Where(l => l.Length > 0)
                .ToList();

            var findingsList = new List<object>();

            var mergedLines = new List<string>();
            foreach (var line in lines)
            {
                if (line.StartsWith(":") && mergedLines.Count > 0)
                {
                    mergedLines[mergedLines.Count - 1] += " " + line.Substring(1).Trim();
                }
                else
                {
                    mergedLines.Add(line);
                }
            }

            foreach (var line in mergedLines)
            {
                Console.WriteLine("📝 LINE: [" + line + "] LEN=" + line.Length);
                var lower = line.ToLower().Trim();

                if (lower.Length < 30) continue;

                if (lower.StartsWith("security") ||
                    lower.StartsWith("recommendation") ||
                    lower.StartsWith("review") ||
                    lower.StartsWith("overview") ||
                    lower.StartsWith("finding") ||
                    lower.StartsWith("summary") ||
                    lower.Contains("analysis report") ||
                    lower.Contains("code review") ||
                    lower.StartsWith("the provided code") ||
                    lower.StartsWith("the code appears") ||
                    lower.StartsWith("here are") ||
                    lower.StartsWith("below are") ||
                    lower.StartsWith("this code") ||
                    lower.StartsWith("note that") ||
                    lower.StartsWith("note:") ||
                    lower.StartsWith("disclaimer") ||
                    lower.Contains("concerns identified") ||
                    lower.Contains("issues identified") ||
                    lower.StartsWith("the code provided") ||
                    lower.StartsWith("the code contains") ||
                    lower.StartsWith("the following") ||
                    lower.StartsWith("this is the most critical") ||
                    lower.StartsWith("title:") ||
                    System.Text.RegularExpressions.Regex.IsMatch(lower, @"^vulnerability \d+"))
                    continue;

                if (lower.EndsWith(":") || !lower.Contains(":"))
                {
                    if (lower.Split(' ').Length <= 6)
                        continue;
                }

                if (lower.Contains("does not appear") ||
                    lower.Contains("none found") ||
                    lower.Contains("not vulnerable") ||
                    lower.Contains("no vulnerabilit") ||
                    lower.Contains("no issue") ||
                    lower.Contains("not a significant concern") ||
                    lower.Contains("not a concern") ||
                    lower.Contains("no evidence") ||
                    lower.Contains("not shown in the provided code") ||
                    lower.Contains("not shown in the code") ||
                    lower.Contains("not a significant vulnerability") ||
                    lower.Contains("do not appear to be user-controlled") ||
                    lower.Contains("are hardcoded and do not") ||
                    lower.StartsWith("no "))
                    continue;

                if (lower.Contains("could potentially") &&
                    lower.Contains("if not properly") &&
                    !lower.Contains("injection") &&
                    !lower.Contains("xss") &&
                    !lower.Contains("eval") &&
                    !lower.Contains("exec") &&
                    !lower.Contains("traversal"))
                    continue;

                if (lower.Contains("alias") ||
                    (lower.Contains("exports") && lower.Contains("method name")))
                    continue;

                if (lower.Contains("middleware is used without any input validation"))
                    continue;

                if (lower.StartsWith("potential unhandled"))
                    continue;

                if (lower.StartsWith("however") &&
                    !lower.Contains("injection") &&
                    !lower.Contains("xss") &&
                    !lower.Contains("eval") &&
                    !lower.Contains("exec") &&
                    !lower.Contains("traversal") &&
                    !lower.Contains("hardcoded"))
                    continue;

                if ((lower.Contains("would likely") ||
                    lower.Contains("in a real-world")) &&
                    !lower.Contains("injection") &&
                    !lower.Contains("xss") &&
                    !lower.Contains("eval") &&
                    !lower.Contains("exec") &&
                    !lower.Contains("traversal"))
                    continue;

                bool isActionable =
                    lower.Contains("potential") ||
                    lower.Contains("missing") ||
                    lower.Contains("risk") ||
                    lower.Contains("unsafe") ||
                    lower.Contains("vulnerab") ||
                    lower.Contains("sanitize") ||
                    lower.Contains("validate") ||
                    lower.Contains("injection") ||
                    lower.Contains("traversal") ||
                    lower.Contains("exploit") ||
                    lower.Contains("attack");

                if (!isActionable) continue;

                string cleaned = line;
                if (lower.Contains("however"))
                {
                    var idx = lower.IndexOf("however");
                    cleaned = line.Substring(idx).Trim();
                }

                string severity =
                    lower.Contains("unsafe") ||
                    lower.Contains("injection") ||
                    lower.Contains("traversal") ||
                    lower.Contains("exploit") ||
                    lower.Contains("attack") ||
                    lower.Contains("sqli") ||
                    lower.Contains("xss") ||
                    lower.Contains("crash")
                        ? "critical"
                        : "warning";

                findingsList.Add(new
                {
                    category = "AI Insight",
                    issue = cleaned,
                    severity = severity
                });
            }

            findings = findingsList
                .GroupBy(f => {
                    string issue = ((dynamic)f).issue;
                    return issue.Length > 50 ? issue.Substring(0, 50) : issue;
                })
                .Select(g => g.First())
                .Cast<object>()
                .ToList();
        }
    }
    catch (Exception ex)
    {
        Console.WriteLine("❌ PARSE ERROR: " + ex.Message);

        findings = new List<object>
        {
            new {
                category = "AI Error",
                issue = "AI response parsing failed.",
                severity = "warning"
            }
        };
    }

    return Results.Ok(new
    {
        findings = findings
    });
});

// ✅ GitHub Proxy — keeps token on server
app.MapGet("/api/github/proxy", async (HttpClient http, HttpRequest request) =>
{
    var url = request.Query["url"].ToString();
    if (string.IsNullOrEmpty(url) ||
        !(url.StartsWith("https://api.github.com") || url.StartsWith("https://raw.githubusercontent.com")))
    {
        return Results.BadRequest(new { error = "Invalid GitHub URL" });
    }

    var token = Environment.GetEnvironmentVariable("GITHUB_TOKEN");

    var req = new HttpRequestMessage(HttpMethod.Get, url);
    req.Headers.Add("Accept", "application/vnd.github.v3+json");
    req.Headers.Add("User-Agent", "AzureAgentApi");
    if (!string.IsNullOrEmpty(token))
    {
        req.Headers.Add("Authorization", $"token {token}");
    }

    var response = await http.SendAsync(req);
    var content = await response.Content.ReadAsStringAsync();

    return Results.Content(content, "application/json");
});

Console.WriteLine("✅ Program loaded");
app.Run();