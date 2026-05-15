import { COMPONENT_TYPES, LED_COLORS } from '../utils/circuitValidator';

const TOOLS = [
  { type: COMPONENT_TYPES.WIRE, label: 'Cable', icon: '➖', desc: 'Conecta dos puntos' },
  { type: COMPONENT_TYPES.BATTERY, label: 'Batería 9V', icon: '🔋', desc: 'Fuente de energía' },
  { type: COMPONENT_TYPES.RESISTOR, label: 'Resistencia', icon: '🟪', desc: 'Limita la corriente' },
];

const LED_OPTIONS = [
  { color: 'red', label: 'Rojo' },
  { color: 'green', label: 'Verde' },
  { color: 'blue', label: 'Azul' },
  { color: 'yellow', label: 'Amarillo' },
];

export default function ComponentPanel({
  selectedTool,
  setSelectedTool,
  onClear,
  onCancel,
  pendingPoint,
}) {
  const isSelected = (type, color) => {
    if (!selectedTool) return false;
    if (selectedTool.type !== type) return false;
    if (type === COMPONENT_TYPES.LED) return selectedTool.color === color;
    return true;
  };

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-xs font-black uppercase tracking-widest text-green-400">
        Componentes
      </h3>

      <div className="flex flex-col gap-2">
        {TOOLS.map((tool) => (
          <button
            key={tool.type}
            onClick={() =>
              setSelectedTool(isSelected(tool.type) ? null : { type: tool.type })
            }
            className={`group flex items-center gap-2.5 rounded-lg border px-2.5 py-2 text-left transition-all ${
              isSelected(tool.type)
                ? 'border-green-500 bg-green-900/40 shadow-[0_0_12px_rgba(34,197,94,0.3)]'
                : 'border-slate-700/60 bg-slate-900/40 hover:border-green-700/60 hover:bg-slate-800/60'
            }`}
          >
            <span className="text-lg">{tool.icon}</span>
            <span className="flex-1">
              <span className="block text-xs font-bold text-slate-200">{tool.label}</span>
              <span className="block text-[10px] text-slate-500">{tool.desc}</span>
            </span>
          </button>
        ))}
      </div>

      <div className="mt-1">
        <h4 className="mb-1.5 text-[10px] font-black uppercase tracking-widest text-slate-500">
          LED
        </h4>
        <div className="grid grid-cols-2 gap-1.5">
          {LED_OPTIONS.map((led) => (
            <button
              key={led.color}
              onClick={() =>
                setSelectedTool(
                  isSelected(COMPONENT_TYPES.LED, led.color)
                    ? null
                    : { type: COMPONENT_TYPES.LED, color: led.color }
                )
              }
              className={`flex items-center gap-1.5 rounded-md border px-2 py-1.5 text-[10px] font-bold transition-all ${
                isSelected(COMPONENT_TYPES.LED, led.color)
                  ? 'border-green-500 bg-green-900/40'
                  : 'border-slate-700/60 bg-slate-900/40 hover:border-green-700/60'
              }`}
            >
              <span
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{
                  background: LED_COLORS[led.color].on,
                  boxShadow: `0 0 6px ${LED_COLORS[led.color].glow}`,
                }}
              />
              <span className="text-slate-300">{led.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-2 flex flex-col gap-1.5">
        {pendingPoint && (
          <button
            onClick={onCancel}
            className="rounded-md border border-amber-500/50 bg-amber-900/30 px-2 py-1.5 text-[11px] font-bold text-amber-300 hover:bg-amber-900/50"
          >
            Cancelar colocación
          </button>
        )}
        <button
          onClick={onClear}
          className="rounded-md border border-red-500/40 bg-red-900/20 px-2 py-1.5 text-[11px] font-bold text-red-300 hover:bg-red-900/40"
        >
          Limpiar todo
        </button>
      </div>

      <div className="mt-2 rounded-lg border border-slate-700/40 bg-slate-900/40 p-2.5 text-[10px] leading-relaxed text-slate-400">
        <p className="mb-1 font-bold text-slate-300">Atajos</p>
        <p><kbd className="text-slate-200">ESC</kbd> · cancelar</p>
        <p><kbd className="text-slate-200">Del</kbd> · eliminar</p>
      </div>
    </div>
  );
}
