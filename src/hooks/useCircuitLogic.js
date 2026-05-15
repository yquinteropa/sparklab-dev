import { useState, useCallback } from 'react';

let idCounter = 0;
const generateId = () => `comp_${++idCounter}_${Date.now()}`;

/**
 * Hook de lógica del laboratorio (modo práctica libre).
 * Permite colocar, seleccionar y eliminar componentes en la protoboard
 * SIN validar la funcionalidad del circuito.
 */
export function useCircuitLogic() {
  const [components, setComponents] = useState([]);
  const [selectedTool, setSelectedTool] = useState(null);
  const [pendingPoint, setPendingPoint] = useState(null);
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [previewWire, setPreviewWire] = useState(null);

  const handlePointClick = useCallback(
    (point) => {
      if (!selectedTool) {
        const comp = components.find(
          (c) =>
            c.points &&
            c.points.some((p) => p.row === point.row && p.col === point.col)
        );
        if (comp) {
          setSelectedComponent((prev) => (prev === comp.id ? null : comp.id));
        }
        return;
      }

      if (!pendingPoint) {
        setPendingPoint(point);
      } else {
        if (pendingPoint.row === point.row && pendingPoint.col === point.col) {
          setPendingPoint(null);
          setPreviewWire(null);
          return;
        }
        const newComponent = {
          id: generateId(),
          type: selectedTool.type,
          color: selectedTool.color || 'red',
          points: [pendingPoint, point],
        };
        setComponents((prev) => [...prev, newComponent]);
        setPendingPoint(null);
        setPreviewWire(null);
      }
    },
    [selectedTool, pendingPoint, components]
  );

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

  const deleteComponent = useCallback((id) => {
    setComponents((prev) => prev.filter((c) => c.id !== id));
    setSelectedComponent(null);
  }, []);

  const clearAll = useCallback(() => {
    setComponents([]);
    setPendingPoint(null);
    setPreviewWire(null);
    setSelectedComponent(null);
    setSelectedTool(null);
  }, []);

  const cancelPlacement = useCallback(() => {
    setPendingPoint(null);
    setPreviewWire(null);
  }, []);

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
