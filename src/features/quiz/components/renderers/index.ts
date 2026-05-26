import type { ComponentType } from 'react';
import type { QuestionType, RendererProps } from '../../types';
import { MultipleChoiceRenderer } from './MultipleChoiceRenderer';
import { TrueFalseRenderer } from './TrueFalseRenderer';
import { MatchingRenderer } from './MatchingRenderer';
import { ImageIdentificationRenderer } from './ImageIdentificationRenderer';

// Registry: agregar un nuevo tipo = añadir una entrada aquí.
export const RENDERERS: Record<
  QuestionType,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ComponentType<RendererProps<any>>
> = {
  multiple_choice: MultipleChoiceRenderer,
  true_false: TrueFalseRenderer,
  matching: MatchingRenderer,
  image_identification: ImageIdentificationRenderer,
};
