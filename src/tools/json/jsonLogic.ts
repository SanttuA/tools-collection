export type TransformResult = {
  output: string;
  error: string | null;
};

export function formatJson(input: string): TransformResult {
  return transformJson(input, 2);
}

export function minifyJson(input: string): TransformResult {
  return transformJson(input, 0);
}

function transformJson(input: string, spacing: number): TransformResult {
  if (!input.trim()) {
    return {
      output: '',
      error: null,
    };
  }

  try {
    const parsed = JSON.parse(input) as unknown;

    return {
      output: JSON.stringify(parsed, null, spacing),
      error: null,
    };
  } catch (error) {
    return {
      output: '',
      error: error instanceof Error ? error.message : 'Invalid JSON.',
    };
  }
}
