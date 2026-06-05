export type LoremMode = 'paragraphs' | 'sentences' | 'words';

export type LoremOptions = {
  count: number;
  mode: LoremMode;
  seed: number;
  startsWithLorem: boolean;
};

export type LoremStats = {
  characters: number;
  paragraphs: number;
  sentences: number;
  words: number;
};

export const loremCountBounds: Record<LoremMode, { max: number; min: number }> = {
  paragraphs: { min: 1, max: 20 },
  sentences: { min: 1, max: 100 },
  words: { min: 1, max: 500 },
};

export const defaultLoremOptions: LoremOptions = {
  count: 3,
  mode: 'paragraphs',
  seed: 1,
  startsWithLorem: true,
};

const loremOpeningWords = ['lorem', 'ipsum', 'dolor', 'sit', 'amet'];

const wordBank = [
  'consectetur',
  'adipiscing',
  'elit',
  'sed',
  'do',
  'eiusmod',
  'tempor',
  'incididunt',
  'ut',
  'labore',
  'et',
  'dolore',
  'magna',
  'aliqua',
  'enim',
  'ad',
  'minim',
  'veniam',
  'quis',
  'nostrud',
  'exercitation',
  'ullamco',
  'laboris',
  'nisi',
  'aliquip',
  'ex',
  'ea',
  'commodo',
  'consequat',
  'duis',
  'aute',
  'irure',
  'reprehenderit',
  'voluptate',
  'velit',
  'esse',
  'cillum',
  'fugiat',
  'nulla',
  'pariatur',
  'excepteur',
  'sint',
  'occaecat',
  'cupidatat',
  'non',
  'proident',
  'sunt',
  'culpa',
  'officia',
  'deserunt',
  'mollit',
  'anim',
  'id',
  'est',
  'laborum',
];

export function clampLoremCount(mode: LoremMode, count: number): number {
  const bounds = loremCountBounds[mode];

  if (!Number.isFinite(count)) {
    return bounds.min;
  }

  return Math.min(Math.max(Math.trunc(count), bounds.min), bounds.max);
}

export function generateLoremIpsum(options: LoremOptions): string {
  const count = clampLoremCount(options.mode, options.count);
  const random = createSeededRandom(options.seed);

  if (options.mode === 'words') {
    return formatWordRun(generateWords(count, options.startsWithLorem, random));
  }

  if (options.mode === 'sentences') {
    return generateSentences(count, options.startsWithLorem, random).join(' ');
  }

  return Array.from({ length: count }, (_, paragraphIndex) => {
    const sentenceCount = 3 + getRandomInteger(random, 0, 2);
    const startsParagraph = options.startsWithLorem && paragraphIndex === 0;

    return generateSentences(sentenceCount, startsParagraph, random).join(' ');
  }).join('\n\n');
}

export function getLoremStats(text: string): LoremStats {
  const trimmedText = text.trim();

  if (!trimmedText) {
    return {
      characters: 0,
      paragraphs: 0,
      sentences: 0,
      words: 0,
    };
  }

  return {
    characters: text.length,
    paragraphs: trimmedText.split(/\n{2,}/).filter(Boolean).length,
    sentences: trimmedText.match(/[^.!?]+[.!?]+/g)?.length ?? 0,
    words: trimmedText.match(/[A-Za-z]+/g)?.length ?? 0,
  };
}

function generateSentences(
  count: number,
  startsWithLorem: boolean,
  random: () => number,
): string[] {
  return Array.from({ length: count }, (_, sentenceIndex) => {
    const wordCount = 8 + getRandomInteger(random, 0, 8);
    const words = generateWords(wordCount, startsWithLorem && sentenceIndex === 0, random);

    return formatSentence(words);
  });
}

function generateWords(count: number, startsWithLorem: boolean, random: () => number): string[] {
  const words = startsWithLorem ? loremOpeningWords.slice(0, count) : [];

  while (words.length < count) {
    words.push(wordBank[getRandomInteger(random, 0, wordBank.length - 1)]);
  }

  return words;
}

function formatSentence(words: string[]): string {
  if (words.length === 0) {
    return '';
  }

  return `${formatWordRun(words)}.`;
}

function formatWordRun(words: string[]): string {
  if (words.length === 0) {
    return '';
  }

  const formattedWords = [...words];
  formattedWords[0] = capitalizeWord(formattedWords[0]);

  return formattedWords.join(' ');
}

function capitalizeWord(word: string): string {
  return `${word.charAt(0).toUpperCase()}${word.slice(1)}`;
}

function createSeededRandom(seed: number): () => number {
  let state = seed >>> 0;

  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);

    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function getRandomInteger(random: () => number, min: number, max: number): number {
  return Math.floor(random() * (max - min + 1)) + min;
}
