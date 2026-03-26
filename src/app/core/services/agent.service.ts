import { Injectable, signal, computed } from '@angular/core';
import { Agent, Message, ThreadType } from '../models/agent.model';

@Injectable({ providedIn: 'root' })
export class AgentService {

  private readonly _agents = signal<Agent[]>([
    {
      id: 1,
      name: 'ServiceNow Assistant',
      team: 'Enterprise',
      category: 'Enterprise',
      icon: '🔧',
      colorClass: 'ic-blue',
      status: 'live',
      model: 'Claude API',
      tagline: 'Your intelligent IT service desk',
      description: 'Raise, track and resolve IT tickets instantly. Get answers on IT policies, software requests, and outages without waiting on hold.',
      fullDescription: 'Raise incidents, check ticket status, request software access, track approvals, and get answers to IT policy questions — all without leaving the Hub. Integrates directly with Chevron\'s ServiceNow instance. Supports P1–P4 classification, auto-routing, and SLA tracking.',
      runsPerMonth: 2340,
      hoursSaved: 280,
      activityPct: 92,
      isFavorite: true,
      lastUsed: '1h ago',
      samplePrompts: [
        'Raise an incident — my laptop won\'t connect to VPN',
        'What\'s the status of my ticket INC0042891?',
        'Request Power BI Premium access for my team',
        'Who do I contact for a hardware replacement?'
      ],
      chatHistory: {
        personal: [
          { role: 'user', content: 'Raise an incident — my laptop won\'t connect to VPN', time: '9:41 AM' },
          { role: 'ai', content: 'I\'ve raised **INC0048231** for your VPN connectivity issue.\n\n**Priority:** P2 — High\n**Assigned to:** Mark Chen, Network Operations\n**Expected resolution:** 2–4 hours\n\nA confirmation has been sent to your email. Shall I add any additional context to the ticket?', time: '9:41 AM' }
        ],
        shared: [
          { role: 'user', content: 'Team: Houston office VPN is down — anyone else affected?', time: 'Yesterday', author: 'Sarah K.' },
          { role: 'ai', content: 'I found **12 open VPN tickets** from the Houston office in the last 24 hours. Root cause identified: firmware update on the firewall cluster at 03:00 CST. Network Ops is rolling back — ETA **45 minutes**. I\'ll post an update here when resolved.', time: 'Yesterday' },
          { role: 'user', content: 'Thanks, letting the team know now.', time: 'Yesterday', author: 'Mike T.' }
        ]
      },
      chatHistory_history: [
        { id: 'h1', title: 'VPN connectivity incident', preview: 'Raise an incident — laptop won\'t connect...', time: 'Today, 9:41 AM', isShared: false },
        { id: 'h2', title: 'Power BI access request', preview: 'Request access to Power BI Premium...', time: 'Yesterday', isShared: false },
        { id: 'h3', title: 'Houston office VPN outage', preview: 'Team thread: Houston office VPN is down...', time: 'Monday', isShared: true }
      ],
       // ... all existing fields stay ...
  createdBy: {
    initials: 'JM',
    name: 'James Mitchell',
    role: 'IT Platform Lead · Enterprise Automation'
  },
  downloadAssets: [
    { name: 'servicenow-agent-v1.2.zip', meta: 'Deployment package · 4.2 MB · Updated 3 days ago', type: '.zip' },
    { name: 'agent-spec-sheet.pdf', meta: 'Technical specification · 820 KB', type: 'PDF' }
  ],
  supportContacts: [
    { initials: 'SK', name: 'Sarah Khan', title: 'Senior Support Engineer', email: 's.khan@chevron.com', teamsHandle: 's.khan', avatarColor: 'teal' as const },
    { initials: 'RT', name: 'Raj Thanki', title: 'Platform Engineer · ServiceNow', email: 'r.thanki@chevron.com', teamsHandle: 'r.thanki', avatarColor: 'amber' as const }
  ]
  },
    {
      id: 2,
      name: 'Data Marketplace',
      team: 'Business Usecase',
      category: 'Business Usecase',
      icon: '📊',
      colorClass: 'ic-amber',
      status: 'live',
      model: 'Azure OpenAI',
      tagline: 'Your gateway to Chevron\'s data catalogue',
      description: 'Discover, access and query Chevron\'s internal data assets. Find datasets, understand schemas, and extract insights using natural language.',
      fullDescription: 'Search and discover internal datasets, understand data schemas and lineage, request data access, and run natural-language queries against approved datasets. Covers production, drilling, refinery, financial, and ESG data across all Chevron assets.',
      runsPerMonth: 1890,
      hoursSaved: 245,
      activityPct: 78,
      isFavorite: true,
      lastUsed: 'Yesterday',
      samplePrompts: [
        'Find all production datasets for Permian Basin wells',
        'What columns are in the drilling_performance table?',
        'Show daily oil production for asset A-14 last quarter',
        'Who owns the refinery KPI dataset?'
      ],
      chatHistory: {
        personal: [
          { role: 'user', content: 'Find all production datasets for Permian Basin wells', time: '2:15 PM' },
          { role: 'ai', content: 'Found **14 datasets** matching Permian Basin production data:\n\n**Top result:** `permian_well_production_daily`\n- Owner: Upstream Analytics team\n- Last updated: Yesterday\n- Rows: 847,000 (2018–present)\n- Access level: Restricted — you have read access\n\nWould you like me to show the schema or run a sample query?', time: '2:15 PM' }
        ],
        shared: [
          { role: 'user', content: 'Team: Looking for Q3 production data across all Permian assets', time: '2 days ago', author: 'Priya R.' },
          { role: 'ai', content: 'I found the authoritative Q3 dataset: `permian_q3_2024_production_consolidated`. It covers all 247 operated wells, updated daily. I\'ve requested shared team access — you\'ll get a confirmation within 2 hours.', time: '2 days ago' }
        ]
      },
      chatHistory_history: [
        { id: 'h4', title: 'Permian Basin dataset search', preview: 'Find all production datasets...', time: 'Yesterday', isShared: false },
        { id: 'h5', title: 'Q3 production data request', preview: 'Team thread: Looking for Q3 production...', time: '2 days ago', isShared: true }
      ],
      createdBy: {
    initials: 'PR',
    name: 'Priya Rajan',
    role: 'Data Platform Lead · Upstream Analytics'
  },
  downloadAssets: [
    { name: 'data-marketplace-agent-v2.0.zip', meta: 'Deployment package · 3.8 MB · Updated 1 week ago', type: '.zip' },
    { name: 'data-marketplace-spec.pdf', meta: 'Technical specification · 640 KB', type: 'PDF' }
  ],
  supportContacts: [
    { initials: 'PR', name: 'Priya Rajan', title: 'Data Platform Lead', email: 'p.rajan@chevron.com', teamsHandle: 'p.rajan', avatarColor: 'blue' as const },
    { initials: 'MT', name: 'Mike Torres', title: 'Data Engineer · Marketplace', email: 'm.torres@chevron.com', teamsHandle: 'm.torres', avatarColor: 'teal' as const }
  ]
    },
    {
      id: 3,
      name: 'SharePoint Assistant',
      team: 'IT & Platforms',
      category: 'Business Usecase',
      icon: '📁',
      colorClass: 'ic-teal',
      status: 'beta',
      model: 'Claude API',
      tagline: 'Search and summarise Chevron\'s knowledge base',
      description: 'Find documents, policies, and team resources instantly. Summarise long documents and navigate SharePoint without manual searching.',
      fullDescription: 'Intelligently search across all Chevron SharePoint sites you have access to. Summarise long documents, find the latest version of policies, locate team sites, compare versions, and get answers from internal knowledge bases — all with a single question.',
      runsPerMonth: 980,
      hoursSaved: 87,
      activityPct: 45,
      isFavorite: false,
      lastUsed: '3 days ago',
      samplePrompts: [
        'Find the latest HSE policy for offshore operations',
        'Summarise the Q3 board report on SharePoint',
        'Where is the Upstream team\'s project tracker?',
        'What changed in the travel expense policy last update?'
      ],
      chatHistory: {
        personal: [],
        shared: []
      },
      chatHistory_history: [
        { id: 'h6', title: 'HSE offshore policy search', preview: 'Find the latest HSE policy...', time: '3 days ago', isShared: false }
      ],
      createdBy: {
    initials: 'AT',
    name: 'Alex Thompson',
    role: 'IT Platform Engineer · Knowledge Management'
  },
  downloadAssets: [
    { name: 'sharepoint-agent-v0.8.zip', meta: 'Deployment package · 2.1 MB · Beta release', type: '.zip' },
    { name: 'sharepoint-agent-spec.pdf', meta: 'Technical specification · 510 KB', type: 'PDF' }
  ],
  supportContacts: [
    { initials: 'AT', name: 'Alex Thompson', title: 'IT Platform Engineer', email: 'a.thompson@chevron.com', teamsHandle: 'a.thompson', avatarColor: 'blue' as const },
    { initials: 'LM', name: 'Lisa Martinez', title: 'SharePoint Administrator', email: 'l.martinez@chevron.com', teamsHandle: 'l.martinez', avatarColor: 'teal' as const }
  ]
    },
    {
      id: 4,
      name: 'Requirements Intelligence Agent',
      team: 'Business Usecase',
      category: 'Business Usecase',
      icon: '📋',
      colorClass: 'ic-blue',
      status: 'coming-soon',
      model: 'Azure OpenAI',
      tagline: 'Auto-generate intelligent requirements from raw inputs',
      description: 'Transform raw business inputs, meeting notes and briefs into structured, traceable requirements documents automatically.',
      fullDescription: 'Analyzes unstructured business inputs including meeting transcripts, emails, and briefs to automatically generate well-formed functional and non-functional requirements with full traceability.',
      runsPerMonth: 0,
      hoursSaved: 0,
      activityPct: 0,
      isFavorite: false,
      lastUsed: undefined,
      samplePrompts: [
        'Generate requirements from this meeting transcript',
        'Convert this business brief into user stories',
        'Identify missing requirements in this document',
        'Create acceptance criteria for these features'
      ],
      chatHistory: { personal: [], shared: [] },
      chatHistory_history: []
    },
    {
      id: 5,
      name: 'Design Doc Generator Agent',
      team: 'Business Usecase',
      category: 'Business Usecase',
      icon: '📐',
      colorClass: 'ic-teal',
      status: 'coming-soon',
      model: 'Azure OpenAI',
      tagline: 'Generate technical design documents instantly',
      description: 'Convert requirements and architecture decisions into comprehensive technical design documents ready for review.',
      fullDescription: 'Takes requirements, architecture diagrams and decisions as input and produces detailed technical design documents including component diagrams, data flows, API contracts and implementation guidance.',
      runsPerMonth: 0,
      hoursSaved: 0,
      activityPct: 0,
      isFavorite: false,
      lastUsed: undefined,
      samplePrompts: [
        'Generate a design doc from these requirements',
        'Create an API contract for this service',
        'Document the architecture for this system',
        'Draft a data flow diagram description'
      ],
      chatHistory: { personal: [], shared: [] },
      chatHistory_history: []
    },
    {
      id: 6,
      name: 'Data Model Synthesizer',
      team: 'Business Usecase',
      category: 'Business Usecase',
      icon: '🗄️',
      colorClass: 'ic-amber',
      status: 'coming-soon',
      model: 'Azure OpenAI',
      tagline: 'Synthesize data models from business rules',
      description: 'Automatically generate entity-relationship models, schemas and data dictionaries from business rules and domain descriptions.',
      fullDescription: 'Converts natural language business rules and domain descriptions into normalized data models, ER diagrams, database schemas and comprehensive data dictionaries with field-level documentation.',
      runsPerMonth: 0,
      hoursSaved: 0,
      activityPct: 0,
      isFavorite: false,
      lastUsed: undefined,
      samplePrompts: [
        'Create a data model for this business domain',
        'Normalize this flat data structure',
        'Generate a schema from these business rules',
        'Build a data dictionary for this system'
      ],
      chatHistory: { personal: [], shared: [] },
      chatHistory_history: []
    },
    {
      id: 7,
      name: 'Coding Copilot Agent',
      team: 'Business Usecase',
      category: 'Business Usecase',
      icon: '💻',
      colorClass: 'ic-blue',
      status: 'coming-soon',
      model: 'Azure OpenAI',
      tagline: 'AI-powered coding assistant for Chevron developers',
      description: 'Write, review, refactor and debug code across languages with context-aware suggestions aligned to Chevron coding standards.',
      fullDescription: 'An enterprise-grade coding assistant trained on Chevron coding standards, architecture patterns and internal libraries. Generates, reviews, refactors and debugs code while enforcing best practices and security guidelines.',
      runsPerMonth: 0,
      hoursSaved: 0,
      activityPct: 0,
      isFavorite: false,
      lastUsed: undefined,
      samplePrompts: [
        'Write a REST API endpoint for this use case',
        'Review this code for security vulnerabilities',
        'Refactor this function to improve performance',
        'Debug this error and suggest a fix'
      ],
      chatHistory: { personal: [], shared: [] },
      chatHistory_history: []
    },
    {
      id: 8,
      name: 'Testing Plan Agent',
      team: 'Business Usecase',
      category: 'Business Usecase',
      icon: '🧪',
      colorClass: 'ic-teal',
      status: 'coming-soon',
      model: 'Azure OpenAI',
      tagline: 'Generate comprehensive test plans automatically',
      description: 'Create structured test plans from requirements and design documents covering all test types and scenarios.',
      fullDescription: 'Analyzes requirements and design documents to generate comprehensive test plans including test strategy, scope, test types (unit, integration, UAT, performance), entry/exit criteria and resource planning.',
      runsPerMonth: 0,
      hoursSaved: 0,
      activityPct: 0,
      isFavorite: false,
      lastUsed: undefined,
      samplePrompts: [
        'Create a test plan for this feature',
        'Generate a UAT strategy from these requirements',
        'Define test scope for this release',
        'Create entry and exit criteria for this project'
      ],
      chatHistory: { personal: [], shared: [] },
      chatHistory_history: []
    },
    {
      id: 9,
      name: 'Test Cases Agent',
      team: 'Business Usecase',
      category: 'Business Usecase',
      icon: '✅',
      colorClass: 'ic-amber',
      status: 'coming-soon',
      model: 'Azure OpenAI',
      tagline: 'Auto-generate test cases from requirements',
      description: 'Instantly generate detailed test cases with steps, expected results and test data from user stories and requirements.',
      fullDescription: 'Converts user stories, requirements and acceptance criteria into detailed test cases with step-by-step instructions, expected results, test data specifications and traceability to requirements.',
      runsPerMonth: 0,
      hoursSaved: 0,
      activityPct: 0,
      isFavorite: false,
      lastUsed: undefined,
      samplePrompts: [
        'Generate test cases for this user story',
        'Create negative test scenarios for this feature',
        'Build edge case tests for this requirement',
        'Generate boundary value test cases'
      ],
      chatHistory: { personal: [], shared: [] },
      chatHistory_history: []
    },
    {
      id: 10,
      name: 'Unit Test Cases Generator',
      team: 'Business Usecase',
      category: 'Business Usecase',
      icon: '🔬',
      colorClass: 'ic-blue',
      status: 'coming-soon',
      model: 'Azure OpenAI',
      tagline: 'Generate unit tests for any code automatically',
      description: 'Paste your code and get comprehensive unit tests generated instantly with mocks, stubs and full coverage.',
      fullDescription: 'Analyzes source code to generate comprehensive unit tests with proper mocking, stubbing and coverage. Supports multiple frameworks including Jest, JUnit, NUnit, pytest and xUnit. Ensures edge cases and error paths are covered.',
      runsPerMonth: 0,
      hoursSaved: 0,
      activityPct: 0,
      isFavorite: false,
      lastUsed: undefined,
      samplePrompts: [
        'Generate unit tests for this function',
        'Create mocks for these dependencies',
        'Write tests to achieve 80% coverage',
        'Generate edge case tests for this class'
      ],
      chatHistory: { personal: [], shared: [] },
      chatHistory_history: []
    },
    {
      id: 11,
      name: 'Test Scripts Generator',
      team: 'Business Usecase',
      category: 'Business Usecase',
      icon: '📝',
      colorClass: 'ic-teal',
      status: 'coming-soon',
      model: 'Azure OpenAI',
      tagline: 'Generate automation test scripts instantly',
      description: 'Convert test cases into ready-to-run automation scripts for Selenium, Playwright, Cypress and other frameworks.',
      fullDescription: 'Transforms manual test cases into executable automation scripts for popular frameworks. Supports Selenium, Playwright, Cypress, Robot Framework and Postman. Generates maintainable page object models and reusable components.',
      runsPerMonth: 0,
      hoursSaved: 0,
      activityPct: 0,
      isFavorite: false,
      lastUsed: undefined,
      samplePrompts: [
        'Convert these test cases to Playwright scripts',
        'Generate a Selenium script for this test',
        'Create a Postman collection for this API',
        'Build a Robot Framework test suite'
      ],
      chatHistory: { personal: [], shared: [] },
      chatHistory_history: []
    },
    {
      id: 12,
      name: 'Test Report Agent',
      team: 'Business Usecase',
      category: 'Business Usecase',
      icon: '📊',
      colorClass: 'ic-amber',
      status: 'coming-soon',
      model: 'Azure OpenAI',
      tagline: 'Generate clear test reports from raw results',
      description: 'Transform raw test execution results into executive-ready reports with insights, defect summaries and quality metrics.',
      fullDescription: 'Processes raw test results from any framework and generates comprehensive test reports with pass/fail summaries, defect analysis, quality metrics, trend analysis and executive summaries suitable for stakeholder communication.',
      runsPerMonth: 0,
      hoursSaved: 0,
      activityPct: 0,
      isFavorite: false,
      lastUsed: undefined,
      samplePrompts: [
        'Generate a test summary report from these results',
        'Create an executive test status report',
        'Analyse defect trends from this sprint',
        'Build a quality metrics dashboard summary'
      ],
      chatHistory: { personal: [], shared: [] },
      chatHistory_history: []
    },
    {
      id: 13,
      name: 'Release Orchestrator Agent',
      team: 'Business Usecase',
      category: 'Business Usecase',
      icon: '🚀',
      colorClass: 'ic-blue',
      status: 'coming-soon',
      model: 'Azure OpenAI',
      tagline: 'Orchestrate and manage software releases intelligently',
      description: 'Plan, coordinate and track software releases with automated release notes, deployment checklists and rollback plans.',
      fullDescription: 'Manages the full release lifecycle including release planning, deployment coordination, automated release note generation, go/no-go checklists, rollback procedures and post-release monitoring summaries.',
      runsPerMonth: 0,
      hoursSaved: 0,
      activityPct: 0,
      isFavorite: false,
      lastUsed: undefined,
      samplePrompts: [
        'Generate release notes for this sprint',
        'Create a deployment checklist for this release',
        'Build a rollback plan for this deployment',
        'Draft a go/no-go criteria document'
      ],
      chatHistory: { personal: [], shared: [] },
      chatHistory_history: []
    },
    {
      id: 14,
      name: 'Chevron Knowledge Q&A Agent',
      team: 'Business Usecase',
      category: 'Business Usecase',
      icon: '🧠',
      colorClass: 'ic-teal',
      status: 'coming-soon',
      model: 'Azure OpenAI',
      tagline: 'Grounded Q&A over Chevron\'s internal knowledge base',
      description: 'Ask any question and get answers grounded in Chevron\'s internal policies, procedures, standards and documentation.',
      fullDescription: 'A retrieval-augmented Q&A agent grounded exclusively in Chevron\'s internal knowledge base. Answers questions about policies, procedures, technical standards, organizational guidelines and historical decisions with full source citations.',
      runsPerMonth: 0,
      hoursSaved: 0,
      activityPct: 0,
      isFavorite: false,
      lastUsed: undefined,
      samplePrompts: [
        'What is Chevron\'s policy on data retention?',
        'Explain the approval process for capital projects',
        'What are the HSE standards for offshore drilling?',
        'Find Chevron\'s guidelines on third-party vendor access'
      ],
      chatHistory: { personal: [], shared: [] },
      chatHistory_history: []
    },
    {
      id: 15,
      name: 'Technology Upgrade Agent',
      team: 'Business Usecase',
      category: 'Business Usecase',
      icon: '⬆️',
      colorClass: 'ic-amber',
      status: 'coming-soon',
      model: 'Azure OpenAI',
      tagline: 'Automate .NET and Angular upgrade migrations',
      description: 'Analyse existing codebases and generate migration plans, compatibility reports and updated code for .NET Core and Angular upgrades.',
      fullDescription: 'Scans existing .NET and Angular codebases to identify breaking changes, deprecated APIs and compatibility issues. Generates detailed migration plans, updated code snippets and testing strategies for version upgrades.',
      runsPerMonth: 0,
      hoursSaved: 0,
      activityPct: 0,
      isFavorite: false,
      lastUsed: undefined,
      samplePrompts: [
        'Analyse this codebase for .NET 8 upgrade compatibility',
        'Identify breaking changes for Angular 17 migration',
        'Generate a migration plan for this legacy application',
        'Update this code from .NET Framework to .NET Core'
      ],
      chatHistory: { personal: [], shared: [] },
      chatHistory_history: []
    },
    {
      id: 16,
      name: 'GitHub Migration Agent',
      team: 'Business Usecase',
      category: 'Business Usecase',
      icon: '🐙',
      colorClass: 'ic-blue',
      status: 'coming-soon',
      model: 'Azure OpenAI',
      tagline: 'Migrate repositories to GitHub seamlessly',
      description: 'Plan and execute migration of source code repositories to GitHub with branch strategy, history preservation and CI/CD setup.',
      fullDescription: 'Automates the migration of source code repositories from legacy systems (TFS, SVN, Bitbucket) to GitHub. Handles branch strategy design, commit history preservation, CI/CD pipeline migration and team permission setup.',
      runsPerMonth: 0,
      hoursSaved: 0,
      activityPct: 0,
      isFavorite: false,
      lastUsed: undefined,
      samplePrompts: [
        'Plan a migration from TFS to GitHub',
        'Design a branching strategy for this repository',
        'Generate a GitHub Actions CI/CD pipeline',
        'Create a repository migration checklist'
      ],
      chatHistory: { personal: [], shared: [] },
      chatHistory_history: []
    },
    {
      id: 17,
      name: 'Data Cleaning Check Agent',
      team: 'Business Usecase',
      category: 'Business Usecase',
      icon: '🧹',
      colorClass: 'ic-teal',
      status: 'coming-soon',
      model: 'Azure OpenAI',
      tagline: 'AI-powered data quality and cleaning validation',
      description: 'Automatically detect data quality issues, anomalies, duplicates and inconsistencies across datasets and suggest fixes.',
      fullDescription: 'Scans datasets to identify quality issues including missing values, duplicates, format inconsistencies, outliers and referential integrity violations. Generates data quality reports and automated cleaning scripts.',
      runsPerMonth: 0,
      hoursSaved: 0,
      activityPct: 0,
      isFavorite: false,
      lastUsed: undefined,
      samplePrompts: [
        'Check this dataset for quality issues',
        'Find duplicate records in this table',
        'Identify missing values and suggest fixes',
        'Generate a data cleaning script for this dataset'
      ],
      chatHistory: { personal: [], shared: [] },
      chatHistory_history: []
    },
    {
      id: 18,
      name: 'Data Analysis Agent',
      team: 'Business Usecase',
      category: 'Business Usecase',
      icon: '📈',
      colorClass: 'ic-amber',
      status: 'coming-soon',
      model: 'Azure OpenAI',
      tagline: 'AI analysis for structured and unstructured data',
      description: 'Perform deep analysis on both structured (tables, databases) and unstructured (PDFs, emails, reports) data sources.',
      fullDescription: 'Combines structured query capabilities with unstructured document understanding to provide comprehensive data analysis. Extracts insights from tables, databases, PDFs, emails and reports in a unified conversation.',
      runsPerMonth: 0,
      hoursSaved: 0,
      activityPct: 0,
      isFavorite: false,
      lastUsed: undefined,
      samplePrompts: [
        'Analyse trends in this dataset',
        'Extract key insights from these reports',
        'Compare structured and unstructured data sources',
        'Identify patterns across these documents and tables'
      ],
      chatHistory: { personal: [], shared: [] },
      chatHistory_history: []
    },
    {
      id: 19,
      name: 'SRS to Power BI Migration Agent',
      team: 'Business Usecase',
      category: 'Business Usecase',
      icon: '📉',
      colorClass: 'ic-blue',
      status: 'coming-soon',
      model: 'Azure OpenAI',
      tagline: 'Migrate SRS reports to Power BI dashboards',
      description: 'Automatically convert legacy SRS reports into modern Power BI dashboards with equivalent KPIs, charts and data connections.',
      fullDescription: 'Analyzes existing SRS reports to understand metrics, KPIs and visualizations, then generates Power BI dashboard designs, DAX measures and data model recommendations for a complete modern migration.',
      runsPerMonth: 0,
      hoursSaved: 0,
      activityPct: 0,
      isFavorite: false,
      lastUsed: undefined,
      samplePrompts: [
        'Convert this SRS report to a Power BI design',
        'Generate DAX measures from these KPI definitions',
        'Map this report structure to Power BI visuals',
        'Create a data model for this SRS migration'
      ],
      chatHistory: { personal: [], shared: [] },
      chatHistory_history: []
    },
    {
      id: 20,
      name: 'PDF Extraction Agent',
      team: 'Business Usecase',
      category: 'Business Usecase',
      icon: '📑',
      colorClass: 'ic-teal',
      status: 'coming-soon',
      model: 'Azure OpenAI',
      tagline: 'Extract structured data from any PDF document',
      description: 'Upload PDFs and extract tables, key fields, entities and structured data into usable formats instantly.',
      fullDescription: 'Uses AI to extract structured information from any PDF including tables, form fields, key-value pairs, entities and relationships. Outputs to JSON, CSV, Excel or custom formats. Handles scanned documents with OCR.',
      runsPerMonth: 0,
      hoursSaved: 0,
      activityPct: 0,
      isFavorite: false,
      lastUsed: undefined,
      samplePrompts: [
        'Extract all tables from this PDF',
        'Pull key fields from this contract document',
        'Convert this scanned report to structured data',
        'Extract named entities from this document'
      ],
      chatHistory: { personal: [], shared: [] },
      chatHistory_history: []
    },
    {
      id: 21,
      name: 'Contract Creation Agent',
      team: 'Business Usecase',
      category: 'Business Usecase',
      icon: '📜',
      colorClass: 'ic-amber',
      status: 'coming-soon',
      model: 'Azure OpenAI',
      tagline: 'Draft contracts from templates and requirements',
      description: 'Generate compliant contract drafts from business requirements, approved templates and standard Chevron legal clauses.',
      fullDescription: 'Creates contract drafts by combining business requirements with Chevron\'s approved legal templates and standard clause library. Supports NDAs, vendor agreements, service contracts and procurement documents with built-in compliance checking.',
      runsPerMonth: 0,
      hoursSaved: 0,
      activityPct: 0,
      isFavorite: false,
      lastUsed: undefined,
      samplePrompts: [
        'Draft an NDA for this vendor engagement',
        'Create a service agreement from these requirements',
        'Generate standard procurement contract clauses',
        'Review this contract against Chevron standards'
      ],
      chatHistory: { personal: [], shared: [] },
      chatHistory_history: []
    },
    {
      id: 22,
      name: 'Customer Request Processor',
      team: 'Business Usecase',
      category: 'Business Usecase',
      icon: '🎯',
      colorClass: 'ic-blue',
      status: 'coming-soon',
      model: 'Azure OpenAI',
      tagline: 'Agentic processing of customer requests end-to-end',
      description: 'Automatically classify, route, process and respond to customer requests using agentic AI workflows.',
      fullDescription: 'An agentic AI system that handles the full lifecycle of customer requests — classifying intent, routing to appropriate teams, gathering required information, processing actions and generating responses — all autonomously.',
      runsPerMonth: 0,
      hoursSaved: 0,
      activityPct: 0,
      isFavorite: false,
      lastUsed: undefined,
      samplePrompts: [
        'Process this customer service request',
        'Classify and route this incoming query',
        'Generate a response for this customer complaint',
        'Track the status of this customer request'
      ],
      chatHistory: { personal: [], shared: [] },
      chatHistory_history: []
    },
    {
      id: 23,
      name: 'Cloud Resource Monitoring Agent',
      team: 'Business Usecase',
      category: 'Business Usecase',
      icon: '☁️',
      colorClass: 'ic-teal',
      status: 'coming-soon',
      model: 'Azure OpenAI',
      tagline: 'Monitor and optimise cloud resources intelligently',
      description: 'Monitor Azure cloud resources, detect anomalies, identify cost optimisation opportunities and alert on critical issues.',
      fullDescription: 'Continuously monitors Azure cloud infrastructure including compute, storage, networking and databases. Detects performance anomalies, identifies cost optimisation opportunities, generates alerts and provides remediation recommendations.',
      runsPerMonth: 0,
      hoursSaved: 0,
      activityPct: 0,
      isFavorite: false,
      lastUsed: undefined,
      samplePrompts: [
        'Show me underutilised Azure resources',
        'Identify cost optimisation opportunities',
        'Alert me on any anomalies in this resource group',
        'Generate a cloud spend report for this month'
      ],
      chatHistory: { personal: [], shared: [] },
      chatHistory_history: []
    },
    {
      id: 24,
      name: 'Law Directory Search',
      team: 'Business Usecase',
      category: 'Business Usecase',
      icon: '⚖️',
      colorClass: 'ic-amber',
      status: 'coming-soon',
      model: 'Azure OpenAI',
      tagline: 'Search legal directories and regulations intelligently',
      description: 'Search across legal databases, regulations, case law and Chevron\'s legal directory using natural language queries.',
      fullDescription: 'Provides intelligent search across legal databases, regulatory frameworks, case law repositories and Chevron\'s internal legal directory. Summarises relevant statutes, regulations and precedents in plain English.',
      runsPerMonth: 0,
      hoursSaved: 0,
      activityPct: 0,
      isFavorite: false,
      lastUsed: undefined,
      samplePrompts: [
        'Find regulations applicable to offshore drilling in the Gulf',
        'Search for environmental compliance requirements',
        'Summarise relevant case law for this contract dispute',
        'Find the legal contact for this jurisdiction'
      ],
      chatHistory: { personal: [], shared: [] },
      chatHistory_history: []
    },
    {
      id: 25,
      name: 'EWF Indexing Agent',
      team: 'Business Usecase',
      category: 'Business Usecase',
      icon: '🛢️',
      colorClass: 'ic-blue',
      status: 'coming-soon',
      model: 'Azure OpenAI',
      tagline: 'AI indexing for Electronic Well Files unstructured data',
      description: 'Intelligently index and search unstructured Electronic Well File data using AI to overcome traditional EWF limitations.',
      fullDescription: 'Addresses the challenge of unstructured data in Electronic Well Files by applying AI-powered document understanding, entity extraction and intelligent indexing. Makes previously unsearchable well data fully discoverable and queryable.',
      runsPerMonth: 0,
      hoursSaved: 0,
      activityPct: 0,
      isFavorite: false,
      lastUsed: undefined,
      samplePrompts: [
        'Index this well file collection',
        'Search for completion reports in these EWF files',
        'Extract drilling parameters from this well file',
        'Find all perforation data across these well files'
      ],
      chatHistory: { personal: [], shared: [] },
      chatHistory_history: []
    },
    {
      id: 26,
      name: 'IRM Control Assistant',
      team: 'Business Usecase',
      category: 'Business Usecase',
      icon: '🔐',
      colorClass: 'ic-teal',
      status: 'coming-soon',
      model: 'Azure OpenAI',
      tagline: 'Assist with IRM control queries and compliance',
      description: 'Answer questions about IRM controls, compliance requirements and control testing procedures instantly.',
      fullDescription: 'Provides intelligent assistance for Information Risk Management control queries. Answers questions about control requirements, testing procedures, compliance status and remediation guidance aligned to Chevron\'s IRM framework.',
      runsPerMonth: 0,
      hoursSaved: 0,
      activityPct: 0,
      isFavorite: false,
      lastUsed: undefined,
      samplePrompts: [
        'What controls apply to this system?',
        'How do I test this IRM control?',
        'What is the remediation for this control gap?',
        'Summarise the compliance status for this domain'
      ],
      chatHistory: { personal: [], shared: [] },
      chatHistory_history: []
    },
    {
      id: 27,
      name: 'IRM Control Document Builder',
      team: 'Business Usecase',
      category: 'Business Usecase',
      icon: '🗂️',
      colorClass: 'ic-amber',
      status: 'coming-soon',
      model: 'Azure OpenAI',
      tagline: 'Build IRM control documents automatically',
      description: 'Generate complete IRM control documentation including control descriptions, testing procedures and evidence requirements.',
      fullDescription: 'Automates the creation of IRM control documentation packages including control narratives, testing scripts, evidence checklists and control matrices. Aligned to Chevron\'s IRM standards and SOX requirements.',
      runsPerMonth: 0,
      hoursSaved: 0,
      activityPct: 0,
      isFavorite: false,
      lastUsed: undefined,
      samplePrompts: [
        'Build a control document for access management',
        'Generate testing procedures for this control',
        'Create an evidence checklist for SOX compliance',
        'Draft a control matrix for this business process'
      ],
      chatHistory: { personal: [], shared: [] },
      chatHistory_history: []
    },
    {
      id: 28,
      name: 'IRM Control Evaluator',
      team: 'Business Usecase',
      category: 'Business Usecase',
      icon: '🔍',
      colorClass: 'ic-blue',
      status: 'coming-soon',
      model: 'Azure OpenAI',
      tagline: 'Evaluate IRM control effectiveness automatically',
      description: 'Assess control effectiveness, identify gaps and generate evaluation reports against IRM standards.',
      fullDescription: 'Evaluates the design and operating effectiveness of IRM controls by analysing control evidence, test results and exception reports. Generates gap assessments, risk ratings and remediation recommendations.',
      runsPerMonth: 0,
      hoursSaved: 0,
      activityPct: 0,
      isFavorite: false,
      lastUsed: undefined,
      samplePrompts: [
        'Evaluate the effectiveness of these controls',
        'Identify gaps in this control framework',
        'Rate the risk of these control exceptions',
        'Generate a control evaluation report'
      ],
      chatHistory: { personal: [], shared: [] },
      chatHistory_history: []
    },
    {
      id: 29,
      name: 'Fitness Certificate Review Agent',
      team: 'Business Usecase',
      category: 'Business Usecase',
      icon: '🏗️',
      colorClass: 'ic-teal',
      status: 'coming-soon',
      model: 'Azure OpenAI',
      tagline: 'Review contractor fitness certificates for SASBU',
      description: 'Automate the review of fitness certificates for contractors working on SASBU, checking completeness and compliance.',
      fullDescription: 'Automates the fitness certificate review process for SASBU contractors by checking document completeness, validity dates, required certifications and compliance against SASBU safety requirements. Flags issues and generates approval recommendations.',
      runsPerMonth: 0,
      hoursSaved: 0,
      activityPct: 0,
      isFavorite: false,
      lastUsed: undefined,
      samplePrompts: [
        'Review this contractor fitness certificate',
        'Check if all required certifications are present',
        'Validate expiry dates on these certificates',
        'Generate a compliance summary for this contractor'
      ],
      chatHistory: { personal: [], shared: [] },
      chatHistory_history: []
    },
    {
      id: 30,
      name: 'Azure Foundry P&L Avatar Agent',
      team: 'Business Usecase',
      category: 'Business Usecase',
      icon: '💹',
      colorClass: 'ic-amber',
      status: 'coming-soon',
      model: 'Azure OpenAI',
      tagline: 'Avatar-based P&L data agent on Azure Foundry',
      description: 'Interactive avatar-powered agent for querying, analysing and presenting P&L financial data built on Azure AI Foundry.',
      fullDescription: 'An avatar-based conversational AI built on Azure AI Foundry that provides interactive P&L data analysis. Combines natural language querying with visual avatar presentation for financial data exploration and reporting.',
      runsPerMonth: 0,
      hoursSaved: 0,
      activityPct: 0,
      isFavorite: false,
      lastUsed: undefined,
      samplePrompts: [
        'Show me the P&L breakdown for Q3',
        'Compare revenue trends across business units',
        'Explain the variance in this cost centre',
        'Generate a P&L executive summary'
      ],
      chatHistory: { personal: [], shared: [] },
      chatHistory_history: []
    },
    {
      id: 31,
      name: 'ServiceNow Support Agent',
      team: 'Business Usecase',
      category: 'Business Usecase',
      icon: '🎫',
      colorClass: 'ic-blue',
      status: 'coming-soon',
      model: 'Azure OpenAI',
      tagline: 'Intelligent support agent integrated with ServiceNow',
      description: 'Handle IT support requests, auto-resolve common issues and manage tickets with full ServiceNow integration.',
      fullDescription: 'An AI-powered support agent with deep ServiceNow integration that handles ticket triage, auto-resolution of common issues, knowledge base search and escalation routing. Reduces MTTR and improves first-call resolution rates.',
      runsPerMonth: 0,
      hoursSaved: 0,
      activityPct: 0,
      isFavorite: false,
      lastUsed: undefined,
      samplePrompts: [
        'Resolve this common IT issue automatically',
        'Search the knowledge base for this problem',
        'Escalate this ticket to the right team',
        'Generate a resolution note for this incident'
      ],
      chatHistory: { personal: [], shared: [] },
      chatHistory_history: []
    },
    {
      id: 32,
      name: 'Requirement Generation Agent',
      team: 'Business Usecase',
      category: 'Business Usecase',
      icon: '📌',
      colorClass: 'ic-teal',
      status: 'coming-soon',
      model: 'Azure OpenAI',
      tagline: 'Generate detailed requirements from business context',
      description: 'Convert high-level business goals and stakeholder inputs into detailed, testable requirements with full traceability.',
      fullDescription: 'Transforms business goals, stakeholder interviews and domain context into structured requirements documentation including functional requirements, non-functional requirements, constraints and assumptions with full traceability matrices.',
      runsPerMonth: 0,
      hoursSaved: 0,
      activityPct: 0,
      isFavorite: false,
      lastUsed: undefined,
      samplePrompts: [
        'Generate requirements from this business goal',
        'Convert stakeholder feedback into user stories',
        'Create a requirements traceability matrix',
        'Identify missing requirements in this scope'
      ],
      chatHistory: { personal: [], shared: [] },
      chatHistory_history: []
    },
    {
      id: 33,
      name: 'Reconciliation Agent',
      team: 'Business Usecase',
      category: 'Business Usecase',
      icon: '🔄',
      colorClass: 'ic-amber',
      status: 'coming-soon',
      model: 'Azure OpenAI',
      tagline: 'Automate financial and data reconciliation',
      description: 'Automatically reconcile financial records, identify discrepancies and generate exception reports across data sources.',
      fullDescription: 'Automates reconciliation of financial records across multiple systems by matching transactions, identifying discrepancies, calculating variances and generating detailed exception reports with root cause analysis.',
      runsPerMonth: 0,
      hoursSaved: 0,
      activityPct: 0,
      isFavorite: false,
      lastUsed: undefined,
      samplePrompts: [
        'Reconcile these two financial datasets',
        'Identify discrepancies between GL and sub-ledger',
        'Generate an exception report for this reconciliation',
        'Find unmatched transactions in these records'
      ],
      chatHistory: { personal: [], shared: [] },
      chatHistory_history: []
    },
    {
      id: 34,
      name: 'Agentic Data Transformation',
      team: 'Business Usecase',
      category: 'Business Usecase',
      icon: '🔀',
      colorClass: 'ic-blue',
      status: 'coming-soon',
      model: 'Azure OpenAI',
      tagline: 'Autonomous data transformation and pipeline agent',
      description: 'Autonomously transform, map and migrate data between formats, schemas and systems using agentic AI workflows.',
      fullDescription: 'An agentic AI system that autonomously handles data transformation tasks including schema mapping, format conversion, data migration and pipeline creation. Learns from corrections and improves over time.',
      runsPerMonth: 0,
      hoursSaved: 0,
      activityPct: 0,
      isFavorite: false,
      lastUsed: undefined,
      samplePrompts: [
        'Transform this dataset to match the target schema',
        'Map fields between these two data models',
        'Create a data pipeline for this transformation',
        'Migrate data from this legacy format'
      ],
      chatHistory: { personal: [], shared: [] },
      chatHistory_history: []
    },
    {
      id: 35,
      name: 'GitHub BRD Agent',
      team: 'Business Usecase',
      category: 'Business Usecase',
      icon: '📗',
      colorClass: 'ic-teal',
      status: 'coming-soon',
      model: 'Azure OpenAI',
      tagline: 'Generate BRDs from GitHub repositories',
      description: 'Analyse GitHub repositories and automatically generate Business Requirements Documents from code, commits and issues.',
      fullDescription: 'Analyses GitHub repository contents including code structure, commit history, issues and pull requests to reverse-engineer and generate comprehensive Business Requirements Documents for existing systems.',
      runsPerMonth: 0,
      hoursSaved: 0,
      activityPct: 0,
      isFavorite: false,
      lastUsed: undefined,
      samplePrompts: [
        'Generate a BRD from this GitHub repository',
        'Document the business rules in this codebase',
        'Create requirements from these GitHub issues',
        'Analyse commit history to extract features'
      ],
      chatHistory: { personal: [], shared: [] },
      chatHistory_history: []
    },
    {
      id: 36,
      name: 'SQL to Dashboard Agent',
      team: 'Business Usecase',
      category: 'Business Usecase',
      icon: '📊',
      colorClass: 'ic-amber',
      status: 'coming-soon',
      model: 'Azure OpenAI',
      tagline: 'Natural language data queries and visualisation',
      description: 'Query SQL databases using plain English and automatically generate visualisations and dashboards from results.',
      fullDescription: 'Converts natural language questions into SQL queries, executes them against connected databases and automatically generates appropriate visualisations and dashboard layouts. Supports Power BI, Tableau and custom chart outputs.',
      runsPerMonth: 0,
      hoursSaved: 0,
      activityPct: 0,
      isFavorite: false,
      lastUsed: undefined,
      samplePrompts: [
        'Show me monthly sales trends as a chart',
        'Query the top 10 customers by revenue',
        'Build a dashboard for this KPI set',
        'Visualise this SQL query result'
      ],
      chatHistory: { personal: [], shared: [] },
      chatHistory_history: []
    },
    {
      id: 37,
      name: 'SQL Chat Interface Agent',
      team: 'Business Usecase',
      category: 'Business Usecase',
      icon: '💬',
      colorClass: 'ic-blue',
      status: 'coming-soon',
      model: 'Azure OpenAI',
      tagline: 'Chat directly with your SQL databases',
      description: 'Ask questions about your data in plain English and get instant answers directly from your SQL database.',
      fullDescription: 'A conversational interface for SQL databases that translates natural language questions into optimised SQL queries, executes them and presents results in a human-readable format. No SQL knowledge required.',
      runsPerMonth: 0,
      hoursSaved: 0,
      activityPct: 0,
      isFavorite: false,
      lastUsed: undefined,
      samplePrompts: [
        'How many active users do we have this month?',
        'What is the average transaction value by region?',
        'Show me all orders placed in the last 7 days',
        'Find the top performing products this quarter'
      ],
      chatHistory: { personal: [], shared: [] },
      chatHistory_history: []
    },
    {
      id: 38,
      name: 'JDE Access Creation Agent',
      team: 'Business Usecase',
      category: 'Business Usecase',
      icon: '🔑',
      colorClass: 'ic-teal',
      status: 'coming-soon',
      model: 'Azure OpenAI',
      tagline: 'Automate JD Edwards access creation workflows',
      description: 'Automate the end-to-end process of creating, managing and auditing JDE user access requests.',
      fullDescription: 'Automates JD Edwards access creation workflows including request intake, role validation, approval routing, provisioning and audit trail generation. Reduces access creation time from days to minutes while ensuring compliance.',
      runsPerMonth: 0,
      hoursSaved: 0,
      activityPct: 0,
      isFavorite: false,
      lastUsed: undefined,
      samplePrompts: [
        'Create a JDE access request for this user',
        'Validate the roles requested for this position',
        'Check the approval status of this access request',
        'Generate an access audit report for this user'
      ],
      chatHistory: { personal: [], shared: [] },
      chatHistory_history: []
    },
    {
      id: 39,
      name: 'Custom Model Agent',
      team: 'Business Usecase',
      category: 'Business Usecase',
      icon: '🤖',
      colorClass: 'ic-amber',
      status: 'coming-soon',
      model: 'Azure OpenAI',
      tagline: 'Deploy and interact with custom fine-tuned models',
      description: 'Interface with custom fine-tuned AI models trained on Chevron-specific data for specialised domain tasks.',
      fullDescription: 'Provides a unified interface for interacting with custom fine-tuned models trained on Chevron-specific datasets. Supports model deployment, testing, feedback collection and performance monitoring for domain-specific AI applications.',
      runsPerMonth: 0,
      hoursSaved: 0,
      activityPct: 0,
      isFavorite: false,
      lastUsed: undefined,
      samplePrompts: [
        'Query the custom drilling model for this well',
        'Run this domain-specific analysis',
        'Test the fine-tuned model on this input',
        'Compare custom model vs base model output'
      ],
      chatHistory: { personal: [], shared: [] },
      chatHistory_history: []
    },
    {
      id: 40,
      name: 'Change Request Review Agent',
      team: 'Business Usecase',
      category: 'Business Usecase',
      icon: '🔄',
      colorClass: 'ic-blue',
      status: 'coming-soon',
      model: 'Azure OpenAI',
      tagline: 'AI-powered change request review and approval',
      description: 'Analyse change requests for completeness, risk and impact before routing for approval.',
      fullDescription: 'Reviews change requests for completeness, technical accuracy, risk assessment and impact analysis. Flags missing information, identifies high-risk changes and generates review summaries to accelerate the CAB approval process.',
      runsPerMonth: 0,
      hoursSaved: 0,
      activityPct: 0,
      isFavorite: false,
      lastUsed: undefined,
      samplePrompts: [
        'Review this change request for completeness',
        'Assess the risk of this proposed change',
        'Identify the impact of this system change',
        'Generate a CAB summary for this change'
      ],
      chatHistory: { personal: [], shared: [] },
      chatHistory_history: []
    },
    {
      id: 41,
      name: 'Spiral Assay Automation Agent',
      team: 'Business Usecase',
      category: 'Business Usecase',
      icon: '🧫',
      colorClass: 'ic-teal',
      status: 'coming-soon',
      model: 'Azure OpenAI',
      tagline: 'Automate spiral assay data processing',
      description: 'Automate the extraction, processing and analysis of spiral assay data from laboratory reports.',
      fullDescription: 'Automates the processing of spiral assay laboratory data including data extraction from reports, quality validation, statistical analysis and integration with upstream planning systems for crude assay management.',
      runsPerMonth: 0,
      hoursSaved: 0,
      activityPct: 0,
      isFavorite: false,
      lastUsed: undefined,
      samplePrompts: [
        'Process this spiral assay report',
        'Extract crude properties from this assay',
        'Validate the quality of this assay data',
        'Compare this assay against the reference crude'
      ],
      chatHistory: { personal: [], shared: [] },
      chatHistory_history: []
    },
    {
      id: 42,
      name: 'Financial Audit Agent',
      team: 'Business Usecase',
      category: 'Business Usecase',
      icon: '🔎',
      colorClass: 'ic-amber',
      status: 'coming-soon',
      model: 'Azure OpenAI',
      tagline: 'AI-powered financial audit assistance',
      description: 'Assist auditors with transaction analysis, anomaly detection, sampling and audit documentation generation.',
      fullDescription: 'Supports financial audit workflows with AI-powered transaction analysis, statistical sampling, anomaly detection and risk identification. Generates audit workpapers, exception reports and findings documentation automatically.',
      runsPerMonth: 0,
      hoursSaved: 0,
      activityPct: 0,
      isFavorite: false,
      lastUsed: undefined,
      samplePrompts: [
        'Identify anomalies in these financial transactions',
        'Generate an audit sample from this population',
        'Create an audit workpaper for this area',
        'Summarise findings from this audit review'
      ],
      chatHistory: { personal: [], shared: [] },
      chatHistory_history: []
    },
    {
      id: 43,
      name: 'Terminal Manager TAG BOT',
      team: 'Business Usecase',
      category: 'Business Usecase',
      icon: '⚙️',
      colorClass: 'ic-blue',
      status: 'coming-soon',
      model: 'Azure OpenAI',
      tagline: 'Intelligent terminal management and TAG operations',
      description: 'Manage terminal operations, asset tagging and equipment tracking with AI-powered query and automation.',
      fullDescription: 'An intelligent bot for terminal management operations including asset TAG queries, equipment status tracking, maintenance scheduling and operational reporting. Integrates with terminal management systems for real-time data access.',
      runsPerMonth: 0,
      hoursSaved: 0,
      activityPct: 0,
      isFavorite: false,
      lastUsed: undefined,
      samplePrompts: [
        'Find the TAG details for this equipment',
        'Check the maintenance status of this asset',
        'Generate a terminal operations report',
        'Query all assets in this terminal zone'
      ],
      chatHistory: { personal: [], shared: [] },
      chatHistory_history: []
    },
  ]);

  readonly agents = this._agents.asReadonly();
  readonly favorites = computed(() => this._agents().filter(a => a.isFavorite));
  readonly recentlyUsed = computed(() => this._agents().filter(a => a.lastUsed));

  toggleFavorite(id: number): void {
    this._agents.update(list =>
      list.map(a => a.id === id ? { ...a, isFavorite: !a.isFavorite } : a)
    );
  }

  filterBy(category: string, status: string, query: string): Agent[] {
    return this._agents().filter(a => {
      if (category !== 'All' && a.category !== category) return false;
      if (status !== 'all' && a.status !== status) return false;
      if (query && !a.name.toLowerCase().includes(query) &&
        !a.team.toLowerCase().includes(query) &&
        !a.description.toLowerCase().includes(query)) return false;
      return true;
    });
  }

  addMessage(agentId: number, thread: ThreadType, msg: Message): void {
    this._agents.update(list =>
      list.map(a => {
        if (a.id !== agentId) return a;
        const updated = { ...a };
        updated.chatHistory = {
          ...a.chatHistory,
          [thread]: [...a.chatHistory[thread], msg]
        };
        return updated;
      })
    );
  }

  clearChat(agentId: number, thread: ThreadType): void {
    this._agents.update(list =>
      list.map(a => {
        if (a.id !== agentId) return a;
        return { ...a, chatHistory: { ...a.chatHistory, [thread]: [] } };
      })
    );
  }

  getAgentById(id: number): Agent | undefined {
    return this._agents().find(a => a.id === id);
  }
}

