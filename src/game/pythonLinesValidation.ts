/**
 * Formatting comparison, NOT a Python evaluator. Matches complete authored lines.
 * Supports ASCII names, integers, simple quoted strings (no escapes), comparison/
 * assignment operators, print parentheses and colons. Only a single block depth
 * is needed here. Indentation must use a consistent 1–8 spaces; four is taught.
 * Comments, tabs, inline suites, nested blocks and extra statements are rejected.
 */
function normalizedLines(source: string): string | null {
  if (source.length > 2000 || /[^\x20-\x7e\r\n]/.test(source)) return null;
  const lines = source.replace(/\r\n/g, '\n').split('\n').filter((line) => line.trim().length > 0);
  if (!lines.length || lines.length > 20) return null;
  let blockWidth = 0;
  const result: { indent: number; tokens: string[] }[] = [];
  for (const line of lines) {
    const indent = line.length - line.trimStart().length;
    if (indent > 8) return null;
    if (indent > 0) {
      blockWidth ||= indent;
      if (indent !== blockWidth) return null;
    }
    const tokens: string[] = [];
    const token = / +|[A-Za-z_][A-Za-z_0-9]*|[0-9]+|"[^"\\]*"|'[^'\\]*'|==|!=|>=|<=|[=><():]/y;
    let position = indent;
    while (position < line.length) {
      token.lastIndex = position;
      const match = token.exec(line);
      if (!match) return null;
      const value = match[0];
      if (value[0] !== ' ') {
        tokens.push(value[0] === '"' || value[0] === "'" ? `string:${value.slice(1, -1)}` : value);
      }
      position = token.lastIndex;
    }
    result.push({ indent: indent ? 1 : 0, tokens });
  }
  return JSON.stringify(result);
}

export function matchesPythonLines(answer: string, acceptedAnswers: readonly string[]): boolean {
  const submitted = normalizedLines(answer);
  return submitted !== null && acceptedAnswers.some((expected) => normalizedLines(expected) === submitted);
}
