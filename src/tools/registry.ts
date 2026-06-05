import { lazy } from 'react';
import { Binary, Braces, Calculator, CodeXml, FileText, Pilcrow, ShieldAlert } from 'lucide-react';

import type { ToolDefinition, ToolSlug } from './types';

export const tools = [
  {
    slug: 'calculator',
    title: 'Calculator',
    category: 'Math',
    description: 'Standard arithmetic with keyboard input.',
    keywords: ['math', 'arithmetic', 'numbers'],
    icon: Calculator,
    component: lazy(() =>
      import('./calculator/CalculatorTool').then((module) => ({
        default: module.CalculatorTool,
      })),
    ),
  },
  {
    slug: 'json-formatter',
    title: 'JSON Formatter',
    category: 'Data',
    description: 'Validate, format, and minify JSON.',
    keywords: ['json', 'formatter', 'minify', 'validate'],
    icon: Braces,
    component: lazy(() =>
      import('./json/JsonFormatterTool').then((module) => ({
        default: module.JsonFormatterTool,
      })),
    ),
  },
  {
    slug: 'base64-converter',
    title: 'Base64 Converter',
    category: 'Encoding',
    description: 'Encode and decode UTF-8 text.',
    keywords: ['base64', 'b64', 'encode', 'decode'],
    icon: Binary,
    component: lazy(() =>
      import('./base64/Base64ConverterTool').then((module) => ({
        default: module.Base64ConverterTool,
      })),
    ),
  },
  {
    slug: 'html-validator',
    title: 'HTML Validator',
    category: 'Markup',
    description: 'Validate HTML markup offline.',
    keywords: ['html', 'validator', 'markup', 'lint', 'accessibility'],
    icon: CodeXml,
    component: lazy(() =>
      import('./html/HtmlValidatorTool').then((module) => ({
        default: module.HtmlValidatorTool,
      })),
    ),
  },
  {
    slug: 'markdown-previewer',
    title: 'Markdown Previewer',
    category: 'Markup',
    description: 'Preview markdown as sanitized HTML.',
    keywords: ['markdown', 'md', 'preview', 'markup', 'html'],
    icon: FileText,
    component: lazy(() =>
      import('./markdown/MarkdownPreviewerTool').then((module) => ({
        default: module.MarkdownPreviewerTool,
      })),
    ),
  },
  {
    slug: 'lorem-ipsum-generator',
    title: 'Lorem Ipsum Generator',
    category: 'Text',
    description: 'Generate placeholder paragraphs, sentences, or words.',
    keywords: ['lorem', 'ipsum', 'placeholder', 'text', 'copy'],
    icon: Pilcrow,
    component: lazy(() =>
      import('./lorem/LoremIpsumGeneratorTool').then((module) => ({
        default: module.LoremIpsumGeneratorTool,
      })),
    ),
  },
  {
    slug: 'jwt-decoder',
    title: 'JWT Decoder',
    category: 'Security',
    description: 'Decode JWT header, payload, and time claims locally.',
    keywords: ['jwt', 'token', 'claims', 'base64url', 'decode'],
    icon: ShieldAlert,
    component: lazy(() =>
      import('./jwt/JwtDecoderTool').then((module) => ({
        default: module.JwtDecoderTool,
      })),
    ),
  },
] satisfies ToolDefinition[];

const toolsBySlug = new Map<ToolSlug, ToolDefinition>(tools.map((tool) => [tool.slug, tool]));

export function getToolBySlug(slug: string): ToolDefinition | undefined {
  return toolsBySlug.get(slug as ToolSlug);
}

export function searchTools(query: string): ToolDefinition[] {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return tools;
  }

  return tools.filter((tool) => {
    const searchableText = [
      tool.title,
      tool.category,
      tool.description,
      tool.slug,
      ...tool.keywords,
    ].join(' ');

    return searchableText.toLowerCase().includes(normalizedQuery);
  });
}
