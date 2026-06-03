export type Base64Result = {
  output: string;
  error: string | null;
};

const textEncoder = new TextEncoder();

export function encodeBase64(input: string): Base64Result {
  try {
    const bytes = textEncoder.encode(input);

    return {
      output: bytesToBase64(bytes),
      error: null,
    };
  } catch (error) {
    return {
      output: '',
      error: error instanceof Error ? error.message : 'Could not encode text.',
    };
  }
}

export function decodeBase64(input: string): Base64Result {
  if (!input.trim()) {
    return {
      output: '',
      error: null,
    };
  }

  try {
    const binary = globalThis.atob(input.trim());
    const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
    const decoder = new TextDecoder('utf-8', { fatal: true });

    return {
      output: decoder.decode(bytes),
      error: null,
    };
  } catch {
    return {
      output: '',
      error: 'Input is not valid UTF-8 Base64.',
    };
  }
}

function bytesToBase64(bytes: Uint8Array): string {
  const chunkSize = 0x8000;
  let binary = '';

  for (let index = 0; index < bytes.length; index += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize));
  }

  return globalThis.btoa(binary);
}
