/**
 * Registry central de renderers de pregunta.
 * Permite que el motor seleccione dinámicamente el componente de UI adecuado
 * según `question.type`. Para añadir un nuevo tipo de pregunta:
 *   1. Definir el tipo en `types.ts`.
 *   2. Crear el componente renderer (con la interfaz RendererProps).
 *   3. Registrarlo aquí con su clave correspondiente.
 */
import type { ComponentType } from 'react';
import type { QuestionType, RendererProps } from '../../types';
import { MultipleChoiceRenderer } from './MultipleChoiceRenderer';
import { TrueFalseRenderer } from './TrueFalseRenderer';
import { MatchingRenderer } from './MatchingRenderer';
import { ImageIdentificationRenderer } from './ImageIdentificationRenderer';

// Mapa { tipo de pregunta -> componente React que la renderiza }.
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
