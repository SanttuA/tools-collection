import { HtmlValidate, StaticConfigLoader, type Message } from 'html-validate/browser';

export type HtmlValidationSeverity = 'error' | 'warning';

export type HtmlValidationIssue = {
  column: number;
  line: number;
  message: string;
  ruleId: string;
  ruleUrl?: string;
  severity: HtmlValidationSeverity;
};

export type HtmlValidationResult = {
  error: string | null;
  errorCount: number;
  issues: HtmlValidationIssue[];
  report: string;
  valid: boolean;
  warningCount: number;
};

const htmlValidate = new HtmlValidate(
  new StaticConfigLoader({
    extends: ['html-validate:recommended'],
    elements: ['html5'],
    root: true,
  }),
);

export const emptyHtmlValidationResult: HtmlValidationResult = {
  error: null,
  errorCount: 0,
  issues: [],
  report: '',
  valid: true,
  warningCount: 0,
};

export async function validateHtml(input: string): Promise<HtmlValidationResult> {
  if (!input.trim()) {
    return emptyHtmlValidationResult;
  }

  try {
    const report = await htmlValidate.validateString(input, 'inline.html');
    const issues = report.results.flatMap((result) => result.messages.map(normalizeMessage));

    return {
      error: null,
      errorCount: report.errorCount,
      issues,
      report: formatValidationReport(report.errorCount, report.warningCount, issues),
      valid: report.valid,
      warningCount: report.warningCount,
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Could not validate HTML.',
      errorCount: 1,
      issues: [],
      report: '',
      valid: false,
      warningCount: 0,
    };
  }
}

function normalizeMessage(message: Message): HtmlValidationIssue {
  return {
    column: message.column,
    line: message.line,
    message: message.message,
    ruleId: message.ruleId,
    ruleUrl: message.ruleUrl,
    severity: message.severity === 2 ? 'error' : 'warning',
  };
}

function formatValidationReport(
  errorCount: number,
  warningCount: number,
  issues: HtmlValidationIssue[],
): string {
  if (issues.length === 0) {
    return 'No HTML validation issues found.';
  }

  const summary = `${formatCount(errorCount, 'error')}, ${formatCount(warningCount, 'warning')}`;
  const issueLines = issues.map((issue) => {
    const ruleSuffix = issue.ruleId ? ` (${issue.ruleId})` : '';

    return `${issue.severity.toUpperCase()} line ${issue.line}, column ${issue.column}: ${issue.message}${ruleSuffix}`;
  });

  return [summary, '', ...issueLines].join('\n');
}

function formatCount(count: number, label: string): string {
  return `${count} ${label}${count === 1 ? '' : 's'}`;
}
