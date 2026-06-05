import { describe, expect, it } from 'vitest';

import { generateLoremIpsum, getLoremStats, type LoremOptions } from './loremLogic';

const baseOptions = {
  count: 1,
  mode: 'paragraphs',
  seed: 1,
  startsWithLorem: true,
} satisfies LoremOptions;

describe('lorem logic', () => {
  it('generates deterministic paragraphs', () => {
    const output = generateLoremIpsum({
      ...baseOptions,
      count: 1,
      mode: 'paragraphs',
    });

    expect(output).toBe(
      [
        'Lorem ipsum dolor sit amet duis est est.',
        'Voluptate pariatur nisi laborum ex ea incididunt laboris aliqua ut.',
        'Sed ullamco occaecat ad et elit nisi reprehenderit cupidatat minim dolore cillum.',
        'Sint et pariatur aliquip occaecat laborum aliqua sint ut veniam laboris aliqua.',
      ].join(' '),
    );
    expect(getLoremStats(output).paragraphs).toBe(1);
  });

  it('generates deterministic sentences', () => {
    expect(
      generateLoremIpsum({
        ...baseOptions,
        count: 2,
        mode: 'sentences',
      }),
    ).toBe(
      'Lorem ipsum dolor sit amet consectetur duis est est ad voluptate pariatur nisi. Ex ea incididunt laboris aliqua ut ea sed ullamco occaecat ad et elit nisi reprehenderit cupidatat.',
    );
  });

  it('generates deterministic words', () => {
    expect(
      generateLoremIpsum({
        ...baseOptions,
        count: 8,
        mode: 'words',
      }),
    ).toBe('Lorem ipsum dolor sit amet velit consectetur duis');
  });

  it('can generate text without the Lorem ipsum opening', () => {
    expect(
      generateLoremIpsum({
        ...baseOptions,
        count: 8,
        mode: 'words',
        startsWithLorem: false,
      }),
    ).toBe('Velit consectetur duis est est ad voluptate pariatur');
  });

  it('uses the seed to vary generated text', () => {
    const firstOutput = generateLoremIpsum({
      ...baseOptions,
      count: 1,
      mode: 'sentences',
      startsWithLorem: false,
    });
    const secondOutput = generateLoremIpsum({
      ...baseOptions,
      count: 1,
      mode: 'sentences',
      seed: 2,
      startsWithLorem: false,
    });

    expect(firstOutput).not.toBe(secondOutput);
    expect(secondOutput).toBe(
      'Veniam ad duis officia velit commodo nostrud occaecat tempor cupidatat dolore nisi proident irure.',
    );
  });

  it('clamps counts to the supported bounds', () => {
    const paragraphOutput = generateLoremIpsum({
      ...baseOptions,
      count: 30,
      mode: 'paragraphs',
    });
    const wordOutput = generateLoremIpsum({
      ...baseOptions,
      count: 0,
      mode: 'words',
    });

    expect(getLoremStats(paragraphOutput).paragraphs).toBe(20);
    expect(getLoremStats(wordOutput).words).toBe(1);
  });

  it('counts generated text stats', () => {
    expect(getLoremStats('Lorem ipsum.\n\nDolor sit amet.')).toEqual({
      characters: 29,
      paragraphs: 2,
      sentences: 2,
      words: 5,
    });
  });
});
