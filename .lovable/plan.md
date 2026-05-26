# Motor de Quiz Dinámico (QuizEngine)

Refactorizar `src/pages/QuickQuiz.tsx` para desacoplar lógica y presentación, soportar 4 tipos de preguntas extensibles, y cargar el banco desde Supabase.

## 1. Base de datos (Supabase)

Crear tabla `questions` con el banco gestionado server-side. Solo se crea la estructura, sin poblar contenido.

Campos:
- `id` (uuid)
- `type` (text): `multiple_choice` | `true_false` | `matching` | `image_identification`
- `difficulty` (text, opcional): `easy|medium|hard` para futuros filtros
- `is_active` (boolean, default true)
- `content` (jsonb): payload flexible según tipo
- `created_at`, `updated_at`

Forma de `content` por tipo:
```jsonc
// multiple_choice
{ "question_text": "...", "options": ["a","b","c","d"], "correct_answer": 2, "explanation": "..." }
// true_false
{ "question_text": "...", "correct_answer": true, "explanation": "..." }
// matching
{ "question_text": "...", "pairs": [{"left":"Voltaje","right":"Voltio"}, ...], "explanation": "..." }
// image_identification
{ "question_text": "¿Qué componente es?", "media_url": "https://...", "options": ["LED","Resistencia",...], "correct_answer": 1, "explanation": "..." }
```

RLS:
- `SELECT` público (lectura para todos los usuarios autenticados y anon — el quiz puede jugarse sin login si así lo decides; por defecto lo abrimos a authenticated + anon ya que las preguntas no son sensibles).
- Sin INSERT/UPDATE/DELETE para usuarios; el poblado se hará vía dashboard o seed manual.

## 2. Estructura de archivos

```text
src/features/quiz/
  types.ts                       // Tipos: QuestionType, Question, QuestionContent<T>, RendererProps
  hooks/
    useQuizSession.ts            // Estado global, timer, score, progreso, fetch + selección aleatoria
  components/
    QuizEngine.tsx               // Controlador: orquesta sesión y renderiza el componente por tipo
    QuizHeader.tsx               // Timer, progreso, score
    QuizFeedback.tsx             // Overlay acierto/error reusable
    QuizResults.tsx              // Pantalla final
    renderers/
      MultipleChoiceRenderer.tsx
      TrueFalseRenderer.tsx
      MatchingRenderer.tsx
      ImageIdentificationRenderer.tsx
      index.ts                   // Registry: { [type]: Renderer }
  lib/
    shuffle.ts                   // Fisher-Yates
    scoring.ts                   // Cálculo de puntos / bonificación / penalización tiempo
```

`src/pages/QuickQuiz.tsx` se reduce a layout + `<QuizEngine />`.

## 3. Hook `useQuizSession`

Estado (vía `useReducer`):
- `status`: `loading | ready | playing | feedback | finished | error`
- `questions: Question[]` (20 aleatorias)
- `currentIndex: number`
- `score: number`
- `correctCount`, `wrongCount`
- `timeLeft: number` (segundos, total global, p.ej. 180s)
- `lastResult: { correct: boolean; explanation?: string } | null`

API expuesta:
- `start()` — fetch desde Supabase, baraja, toma 20, inicia timer.
- `submitAnswer(answer: unknown)` — valida según tipo, calcula puntos, aplica bonificación (+tiempo si acierta) o penalización (−tiempo si falla), setea `lastResult`, pasa a `feedback`.
- `next()` — avanza pregunta o finaliza.
- `reset()`.

Reglas de scoring (parametrizables en `scoring.ts`):
- Base por acierto: 100 pts.
- Bonus tiempo: `+ floor(timeLeft / questionsLeft) / 2` (configurable).
- Penalización por error: −5 segundos al timer.
- Timer global llega a 0 → `finished`.

Selección aleatoria sin repetición: Fisher-Yates sobre el set obtenido, `slice(0, 20)`.

## 4. Patrón de renderizado

`QuizEngine` no conoce los tipos: consulta el `renderers/index.ts` registry:
```ts
const RENDERERS: Record<QuestionType, ComponentType<RendererProps>> = { ... }
const Renderer = RENDERERS[currentQuestion.type];
<Renderer question={currentQuestion} disabled={status==='feedback'} onAnswer={submitAnswer} />
```
Agregar un nuevo tipo = crear renderer + registrar + insertar filas en Supabase. Cero cambios en el motor.

Cada renderer recibe `{ question, disabled, onAnswer }` y es responsable solo de capturar la respuesta del usuario.

## 5. Renderers

- **MultipleChoiceRenderer**: grid responsive 1 col mobile / 2 col ≥sm; botones con estados hover/selected/correct/incorrect (Framer Motion `whileTap`, `layout`).
- **TrueFalseRenderer**: dos botones grandes (V/F), iconografía clara, ideal táctil.
- **MatchingRenderer**: dos columnas (izq/der). Tap en item izq → tap en item der para emparejar. Líneas/colores neón vinculan pares. Animaciones con Framer Motion (`layoutId` para transiciones, `AnimatePresence` para entrada/salida). Confirma cuando todos los pares están hechos.
- **ImageIdentificationRenderer**: imagen `media_url` con `aspect-square` y `object-contain`, lazy load, fallback. Debajo, 4 opciones en grid 2×2 mobile / 1×4 ≥md.

Todos comparten:
- Feedback inmediato vía `QuizFeedback` (overlay 1.2s con check/cross + explicación).
- Tokens semánticos (`bg-card`, `text-primary`, `border-primary/40`, glow neón).
- Mobile-first: padding, tamaños tap ≥44px, texto fluido.

## 6. Identidad visual

- Modo oscuro con tokens existentes (`hsl(var(--primary))`, etc.).
- Glow neón en botones activos y feedback.
- Transiciones de pregunta: `AnimatePresence` con fade + slide.
- Timer con barra de progreso animada que cambia de color cuando `timeLeft < 30s`.

## 7. Integración

- `QuickQuiz.tsx` queda como wrapper con `DashboardNav` y `<QuizEngine totalQuestions={20} totalSeconds={180} />`.
- Persistencia opcional (fuera de scope ahora): al finalizar, llamar a `user_progress` para sumar XP — lo dejamos como TODO comentado.

## Detalles técnicos

- Fetch con `supabase.from('questions').select('*').eq('is_active', true)`.
- Tipado estricto: discriminated union `Question` por `type` para narrowing en renderers.
- Timer con `useEffect` + `setInterval`, limpiando en unmount; se pausa en `feedback` (configurable).
- Sin tocar lógica de niveles ni otros módulos.

## Entregables de esta iteración

1. Migración Supabase: tabla `questions` + GRANTs + RLS.
2. Estructura completa de archivos en `src/features/quiz/` (motor, hook, renderers vacíos pero funcionales, tipos, helpers).
3. `QuickQuiz.tsx` refactorizado para usar `QuizEngine`.
4. Sin poblar preguntas (lo hará el usuario después).
