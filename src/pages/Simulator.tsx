import { useEffect, useCallback } from 'react';
import { DashboardNav } from '@/components/DashboardNav';
import Protoboard from '@/components/Protoboard';
import ComponentPanel from '@/components/ComponentPanel';
import { useCircuitLogic } from '@/hooks/useCircuitLogic';
import { useAccessibility } from '@/contexts/AccessibilityContext';
import { useTranslation } from 'react-i18next';

export default function Simulator() {
  const { themeMode } = useAccessibility();
  const { t } = useTranslation();
  const isDark = themeMode !== 'light';
  const {
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
  } = useCircuitLogic();

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedComponent) {
        deleteComponent(selectedComponent);
      }
      if (e.key === 'Escape') {
        cancelPlacement();
        setSelectedComponent(null);
        setSelectedTool(null);
      }
    },
    [selectedComponent, deleteComponent, cancelPlacement, setSelectedComponent, setSelectedTool]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div
      className="flex min-h-screen flex-col"
      style={{
        background: isDark
          ? 'linear-gradient(135deg, #020c06 0%, #031a0d 50%, #020c06 100%)'
          : 'linear-gradient(135deg, #f8fafc 0%, #ecfdf5 50%, #f8fafc 100%)',
        fontFamily: "'Courier New', monospace",
      }}
    >
      <DashboardNav />

      <div className="flex items-center justify-between border-b border-green-300/60 dark:border-green-900/30 px-6 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-green-500/40 bg-green-500/20 text-lg">
            ⚡
          </div>
          <div>
            <h1 className="text-lg font-black leading-none tracking-tight text-green-700 dark:text-green-400">
              {t('simulator.labTitle')}
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-500">{t('simulator.labSubtitle')}</p>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-2 rounded-full border border-slate-300 bg-white/80 px-3 py-1.5 text-xs text-slate-600 dark:border-slate-700/40 dark:bg-slate-900/50 dark:text-slate-400">
          <span className="font-bold text-slate-900 dark:text-slate-300">{components.length}</span>
          <span>{components.length === 1 ? t('simulator.componentOne') : t('simulator.componentMany')}</span>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-52 flex-shrink-0 overflow-y-auto border-r border-green-300/50 dark:border-green-900/20 p-3">
          <ComponentPanel
            selectedTool={selectedTool}
            setSelectedTool={setSelectedTool}
            onClear={clearAll}
            onCancel={cancelPlacement}
            pendingPoint={pendingPoint}
          />
        </aside>

        <main className="flex flex-1 flex-col items-center justify-start gap-4 overflow-auto p-4">
          <div className="flex w-full max-w-4xl flex-wrap items-center gap-3 rounded-xl border border-slate-300 bg-white/80 px-4 py-2 text-xs text-slate-600 dark:border-slate-700/40 dark:bg-slate-900/60 dark:text-slate-400">
            <span className="font-bold text-slate-900 dark:text-slate-300">{t('simulator.howToBuild')}</span>
            <span>{t('simulator.step1')}</span>
            <span className="text-slate-400 dark:text-slate-600">›</span>
            <span>{t('simulator.step2')}</span>
            <span className="text-slate-400 dark:text-slate-600">›</span>
            <span>{t('simulator.step3')}</span>
            <span className="ml-auto text-slate-400 dark:text-slate-600">{t('simulator.keysHint')}</span>
          </div>

          <div className="w-full max-w-4xl">
            <Protoboard
              components={components}
              selectedTool={selectedTool}
              pendingPoint={pendingPoint}
              hoveredPoint={hoveredPoint}
              selectedComponent={selectedComponent}
              previewWire={previewWire}
              onPointClick={handlePointClick}
              onPointHover={handlePointHover}
              onComponentClick={setSelectedComponent}
            />
          </div>

          {components.length === 0 && (
            <div className="w-full max-w-4xl rounded-2xl border border-green-400/60 bg-green-50 p-5 dark:border-green-700/30 dark:bg-gradient-to-br dark:from-green-900/20 dark:to-emerald-900/10">
              <h3 className="mb-3 text-sm font-bold text-green-700 dark:text-green-400">
                {t('simulator.guideTitle')}
              </h3>
              <div className="grid grid-cols-1 gap-3 text-xs text-slate-700 dark:text-slate-400 md:grid-cols-3">
                <div className="flex gap-2">
                  <span className="font-bold text-green-600 dark:text-green-500">1.</span>
                  <span>{t('simulator.guide1')}</span>
                </div>
                <div className="flex gap-2">
                  <span className="font-bold text-green-600 dark:text-green-500">2.</span>
                  <span>{t('simulator.guide2')}</span>
                </div>
                <div className="flex gap-2">
                  <span className="font-bold text-green-600 dark:text-green-500">3.</span>
                  <span>{t('simulator.guide3')}</span>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
