# Poblar tabla `questions` con nuevas preguntas

Insertar las 8 preguntas de identificación de imágenes del JSON adjunto en la tabla `public.questions`, adaptándolas al esquema esperado por el motor de quiz.

## Mapeo de campos

JSON entrante → columna/JSON de la BD:
- `type` → columna `type` (se conserva `"image_identification"`)
- `difficulty: 1` → columna `difficulty` = `"easy"` (todas)
- `question` → `content.question_text`
- `options` → `content.options`
- `correct_answer` → `content.correct_answer`
- `media_url` → **se omite** (placeholders example.com). Se completará después cuando subas las imágenes reales.
- `is_active` = `true`

## Consideración técnica

El renderer `ImageIdentificationRenderer` espera `content.media_url`. Como lo omitiremos por ahora, estas preguntas mostrarán un espacio sin imagen hasta que se actualice cada fila con la URL real. Recomendación: actualizar las URLs antes de habilitarlas en producción, o marcarlas temporalmente como `is_active = false` hasta tener las imágenes. 

**Sugerencia:** insertar con `is_active = false` para no contaminar el quiz cronometrado hasta que estén las imágenes. Confirma si prefieres esa opción o `is_active = true` directamente.

## Ejecución

Una sola operación `INSERT` (vía tool de inserción de datos) con 8 filas en `public.questions`. Cada `content` quedará así:

```json
{
  "question_text": "...",
  "options": ["...", "...", "...", "..."],
  "correct_answer": "..."
}
```

No requiere cambios de esquema, código ni RLS.
