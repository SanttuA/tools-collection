import type { LucideIcon } from 'lucide-react';
import type { ComponentType, LazyExoticComponent } from 'react';

export type ToolSlug =
  | 'calculator'
  | 'json-formatter'
  | 'base64-converter'
  | 'html-validator'
  | 'markdown-previewer'
  | 'lorem-ipsum-generator'
  | 'jwt-decoder'
  | 'world-clocks'
  | 'unit-converter';

export type ToolComponentProps = {
  headingId: string;
};

export type ToolDefinition = {
  slug: ToolSlug;
  title: string;
  category: string;
  description: string;
  keywords: string[];
  icon: LucideIcon;
  component: LazyExoticComponent<ComponentType<ToolComponentProps>>;
};
