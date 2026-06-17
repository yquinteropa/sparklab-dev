import { useState, useCallback } from 'react';

// Contador monótono auxiliar para garantizar IDs únicos por sesión.
let idCounter = 0;
// Genera un identificador único combinando contador + timestamp para evitar colisiones.
const generateId = () => `comp_${++idCounter}_${Date.now()}`;

/**
 * Hook de lógica del laboratorio (modo práctica libre).
 * Permite colocar, seleccionar y eliminar componentes en la protoboard
 * SIN validar la funcionalidad del circuito (modo "sandbox" educativo).
 */
export function useCircuitLogic() {
  // Lista de componentes colocados en la protoboard (cables, baterías, bombillas, etc.)
  const [components, setComponents] = useState([]);
  // Herramienta seleccionada actualmente desde el panel de componentes
  const [selectedTool, setSelectedTool] = useState(null);
  // Primer punto seleccionado al construir un componente de dos puntos (ej: cable)
  const [pendingPoint, setPendingPoint] = useState(null);
  // Punto sobre el que está el cursor (para resaltado visual)
  const [hoveredPoint, setHoveredPoint] = useState(null);
  // ID del componente seleccionado para mostrar acciones (ej: eliminar)
  const [selectedComponent, setSelectedComponent] = useState(null);
  // Cable "fantasma" mostrado mientras el usuario decide el segundo punto
  const [previewWire, setPreviewWire] = useState(null);

  /**
   * Manejador principal de clicks sobre los puntos de la protoboard.
   * - Sin herramienta activa: selecciona/deselecciona un componente existente.
   * - Con herramienta activa: define los dos extremos y crea el componente.
   */
  const handlePointClick = useCallback(
    (point) => {
      // Modo selección: no hay herramienta activa
      if (!selectedTool) {
        // Buscar si el punto pertenece a algún componente colocado
        const comp = components.find(
          (c) =>
            c.points &&
            c.points.some((p) => p.row === point.row && p.col === point.col)
        );
        if (comp) {
          // Toggle: si ya estaba seleccionado lo deselecciona
          setSelectedComponent((prev) => (prev === comp.id ? null : comp.id));
        }
        return;
      }

      // Primer click: marcar el punto de inicio
      if (!pendingPoint) {
        setPendingPoint(point);
      } else {
        // Segundo click sobre el mismo punto: cancelar la colocación
        if (pendingPoint.row === point.row && pendingPoint.col === point.col) {
          setPendingPoint(null);
          setPreviewWire(null);
          return;
        }
        // Crear el nuevo componente con los dos puntos definidos
        const newComponent = {
          id: generateId(),
          type: selectedTool.type,
          color: selectedTool.color || 'red',
          points: [pendingPoint, point],
        };
        setComponents((prev) => [...prev, newComponent]);
        // Reiniciar estado de colocación para permitir crear otro componente
        setPendingPoint(null);
        setPreviewWire(null);
      }
    },
    [selectedTool, pendingPoint, components]
  );

  /**
   * Actualiza el punto bajo el cursor y, si hay un punto pendiente,
   * dibuja un cable "fantasma" hacia el cursor como vista previa.
   */
  const handlePointHover = useCallback(
    (point) => {
      setHoveredPoint(point);
      if (pendingPoint && point) {
        setPreviewWire({ from: pendingPoint, to: point });
      } else {
        setPreviewWire(null);
      }
    },
    [pendingPoint]
  );

  // Elimina un componente concreto por su ID y limpia la selección.
  const deleteComponent = useCallback((id) => {
    setComponents((prev) => prev.filter((c) => c.id !== id));
    setSelectedComponent(null);
  }, []);

  // Limpia completamente la protoboard y resetea cualquier estado intermedio.
  const clearAll = useCallback(() => {
    setComponents([]);
    setPendingPoint(null);
    setPreviewWire(null);
    setSelectedComponent(null);
    setSelectedTool(null);
  }, []);

  // Cancela una colocación a medio hacer (ej: al pulsar ESC).
  const cancelPlacement = useCallback(() => {
    setPendingPoint(null);
    setPreviewWire(null);
  }, []);

  // API pública del hook expuesta a los componentes de UI.
  return {
    components,
    selectedTool,
    setSelectedTool,
    pendingPoint,
    hoveredPoint,
    selectedComponent,
    setSelectedComponent,
    previewWire,
    handlePointClick,
    handlePointHover,
    deleteComponent,
    clearAll,
    cancelPlacement,
  };
}
