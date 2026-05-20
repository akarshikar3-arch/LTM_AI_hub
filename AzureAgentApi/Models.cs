namespace AzureAgentApi;

public record AgentRequest(string Text);

public class AgentResponse
{
    public string Agent { get; set; } = "CodeReviewAgent";
    public string Version { get; set; } = "1.0";
    public string LanguageDetected { get; set; } = "";
    public int LinesScanned { get; set; }
    public CodeScore Score { get; set; } = new();
    public ReviewSummary Summary { get; set; } = new();
    public List<Finding> Findings { get; set; } = new();
    public DateTimeOffset Timestamp { get; set; } = DateTimeOffset.UtcNow;
}

public class CodeScore
{
    public double Value { get; set; }
    public double MaxScore { get; set; } = 10;
    public string Label { get; set; } = "";
    public string Recommendation { get; set; } = "";
}

public class ReviewSummary
{
    public int TotalIssues { get; set; }
    public int Critical { get; set; }
    public int Warnings { get; set; }
    public int Info { get; set; }
}

public class Finding
{
    public string Category { get; set; } = "";
    public string CategoryIcon { get; set; } = "";
    public string Severity { get; set; } = "";
    public string Issue { get; set; } = "";
    public string Suggestion { get; set; } = "";
    public string PatternFound { get; set; } = "";
    public string FileName { get; set; } = "";
    public int LineNumber { get; set; }

}
