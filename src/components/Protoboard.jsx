import { useRef, useEffect, useCallback } from 'react';
import { COMPONENT_TYPES, LED_COLORS } from '../utils/circuitValidator';

const COLS = 30;
const CELL = 22;
const PAD = 16;

const BOARD_W = COLS * CELL + PAD * 2;
const BOARD_H = 18 * CELL + PAD * 2;

function rowToY(row) {
  if (row === 0) return PAD + CELL * 0.5;
  if (row === 1) return PAD + CELL * 1.5;
  if (row >= 2 && row <= 6) return PAD + CELL * 2.5 + (row - 2) * CELL;
  if (row >= 7 && row <= 11) return PAD + CELL * 2.5 + 5 * CELL + CELL * 1.5 + (row - 7) * CELL;
  if (row === 12) return PAD + CELL * 2.5 + 5 * CELL + CELL * 1.5 + 5 * CELL + CELL * 0.5;
  if (row === 13) return PAD + CELL * 2.5 + 5 * CELL + CELL * 1.5 + 5 * CELL + CELL * 1.5;
  return 0;
}

function colToX(col) {
  return PAD + (col - 1) * CELL + CELL * 0.5;
}

function isRailRow(row) { return row === 0 || row === 1 || row === 12 || row === 13; }
function isPosRail(row) { return row === 0 || row === 1; }
function isNegRail(row) { return row === 12 || row === 13; }

function drawResistor(ctx, x1, y1, x2, y2) {
  const dx = x2 - x1, dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy);
  const ux = dx / len, uy = dy / len;
  const bw = Math.min(len * 0.4, 28), bh = 8;
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;

  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(mx - ux * bw / 2, my - uy * bw / 2);
  ctx.moveTo(mx + ux * bw / 2, my + uy * bw / 2);
  ctx.lineTo(x2, y2);
  ctx.strokeStyle = '#a78bfa';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.save();
  ctx.translate(mx, my);
  ctx.rotate(Math.atan2(dy, dx));
  ctx.fillStyle = '#c4b5fd';
  ctx.strokeStyle = '#7c3aed';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.rect(-bw / 2, -bh / 2, bw, bh);
  ctx.fill();
  ctx.stroke();
  const stripes = ['#f59e0b', '#92400e', '#fbbf24', '#64748b'];
  const sw = bw / 6;
  stripes.forEach((sc, i) => {
    ctx.fillStyle = sc;
    ctx.fillRect(-bw / 2 + sw * (i + 0.5), -bh / 2, sw * 0.7, bh);
  });
  ctx.restore();
}

function drawLED(ctx, x1, y1, x2, y2, color) {
  const map = LED_COLORS[color] || LED_COLORS.red;
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
  const dx = x2 - x1, dy = y2 - y1;
  const angle = Math.atan2(dy, dx);

  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(mx, my);
  ctx.moveTo(mx, my);
  ctx.lineTo(x2, y2);
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.save();
  ctx.translate(mx, my);
  ctx.rotate(angle);
  ctx.beginPath();
  ctx.moveTo(-6, -6); ctx.lineTo(6, -6);
  ctx.lineTo(6, 6);   ctx.lineTo(-6, 6);
  ctx.closePath();
  ctx.fillStyle = map.off;
  ctx.strokeStyle = '#64748b';
  ctx.lineWidth = 1.5;
  ctx.fill(); ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-4, -4); ctx.lineTo(4, 0); ctx.lineTo(-4, 4);
  ctx.closePath();
  ctx.fillStyle = '#cbd5e1';
  ctx.fill();
  ctx.restore();
}

function drawBattery(ctx, x1, y1, x2, y2) {
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
  const dx = x2 - x1, dy = y2 - y1;
  const angle = Math.atan2(dy, dx);
  const bw = 20, bh = 10;

  ctx.beginPath();
  ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
  ctx.strokeStyle = '#10b981'; ctx.lineWidth = 2; ctx.stroke();

  ctx.save();
  ctx.translate(mx, my); ctx.rotate(angle);
  ctx.fillStyle = '#1e293b'; ctx.strokeStyle = '#10b981'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.rect(-bw / 2, -bh / 2, bw, bh); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#ef4444'; ctx.fillRect(-bw / 2 - 4, -bh / 2, 4, bh);
  ctx.fillStyle = '#3b82f6'; ctx.fillRect(bw / 2, -bh / 2, 4, bh);
  ctx.fillStyle = '#ffffff'; ctx.font = 'bold 7px monospace';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('9V', 0, 0);
  ctx.restore();
}

export default function Protoboard({
  components, selectedTool, pendingPoint, hoveredPoint,
  selectedComponent, previewWire,
  onPointClick, onPointHover, onComponentClick,
}) {
  const canvasRef = useRef(null);
  const allRows = [0,1,2,3,4,5,6,7,8,9,10,11,12,13];

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.roundRect(0, 0, BOARD_W, BOARD_H, 8);
    ctx.fill();

    ctx.strokeStyle = '#d1d5db';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(0, 0, BOARD_W, BOARD_H, 8);
    ctx.stroke();

    const rail0Y = rowToY(0) - CELL * 0.45;
    ctx.fillStyle = 'rgba(254,226,226,0.7)';
    ctx.beginPath();
    ctx.roundRect(PAD - 6, rail0Y, BOARD_W - PAD * 2 + 12, CELL * 2, 4);
    ctx.fill();
    ctx.strokeStyle = 'rgba(239,68,68,0.5)';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 4]);
    ctx.beginPath();
    ctx.moveTo(PAD + 2, rowToY(0)); ctx.lineTo(BOARD_W - PAD - 2, rowToY(0));
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(PAD + 2, rowToY(1)); ctx.lineTo(BOARD_W - PAD - 2, rowToY(1));
    ctx.stroke();
    ctx.setLineDash([]);

    const rail12Y = rowToY(12) - CELL * 0.45;
    ctx.fillStyle = 'rgba(219,234,254,0.7)';
    ctx.beginPath();
    ctx.roundRect(PAD - 6, rail12Y, BOARD_W - PAD * 2 + 12, CELL * 2, 4);
    ctx.fill();
    ctx.strokeStyle = 'rgba(59,130,246,0.5)';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 4]);
    ctx.beginPath();
    ctx.moveTo(PAD + 2, rowToY(12)); ctx.lineTo(BOARD_W - PAD - 2, rowToY(12));
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(PAD + 2, rowToY(13)); ctx.lineTo(BOARD_W - PAD - 2, rowToY(13));
    ctx.stroke();
    ctx.setLineDash([]);

    const gapTop = rowToY(6) + CELL * 0.55;
    const gapBot = rowToY(7) - CELL * 0.55;
    const gapH = gapBot - gapTop;
    ctx.fillStyle = '#f3f4f6';
    ctx.fillRect(PAD - 6, gapTop, BOARD_W - PAD * 2 + 12, gapH);
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(PAD - 6, gapTop); ctx.lineTo(BOARD_W - PAD + 6, gapTop);
    ctx.moveTo(PAD - 6, gapBot); ctx.lineTo(BOARD_W - PAD + 6, gapBot);
    ctx.stroke();

    ctx.fillStyle = 'rgba(100,116,139,0.7)';
    ctx.font = '7px monospace';
    ctx.textAlign = 'center';
    for (let c = 1; c <= COLS; c += 5) {
      ctx.fillText(c, colToX(c), PAD + CELL * 0.35);
    }

    const rowLetters = ['a','b','c','d','e','f','g','h','i','j'];
    ctx.textAlign = 'right';
    ctx.fillStyle = 'rgba(100,116,139,0.7)';
    for (let r = 2; r <= 11; r++) {
      ctx.fillText(rowLetters[r - 2], PAD - 4, rowToY(r) + 3);
    }
    ctx.fillStyle = 'rgba(239,68,68,0.8)';
    ctx.textAlign = 'left';
    ctx.font = 'bold 8px monospace';
    ctx.fillText('+', 3, rowToY(0) + 3);
    ctx.fillText('+', 3, rowToY(1) + 3);
    ctx.fillStyle = 'rgba(59,130,246,0.8)';
    ctx.fillText('−', 3, rowToY(12) + 3);
    ctx.fillText('−', 3, rowToY(13) + 3);

    allRows.forEach((row) => {
      for (let col = 1; col <= COLS; col++) {
        const x = colToX(col);
        const y = rowToY(row);
        const isHov = hoveredPoint?.row === row && hoveredPoint?.col === col;
        const isPend = pendingPoint?.row === row && pendingPoint?.col === col;
        const posRail = isPosRail(row);
        const negRail = isNegRail(row);
        const rail = isRailRow(row);
        const r = rail ? 2.8 : 3.2;

        ctx.beginPath();
        ctx.arc(x, y + 0.8, r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0,0,0,0.12)';
        ctx.fill();

        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);

        if (isPend) {
          ctx.fillStyle = '#06b6d4';
          ctx.shadowColor = '#06b6d4'; ctx.shadowBlur = 8;
        } else if (isHov && selectedTool) {
          ctx.fillStyle = posRail ? 'rgba(239,68,68,0.75)'
            : negRail ? 'rgba(59,130,246,0.75)'
            : 'rgba(245,158,11,0.75)';
          ctx.shadowColor = '#f59e0b'; ctx.shadowBlur = 6;
        } else {
          ctx.fillStyle = posRail ? 'rgba(220,38,38,0.45)'
            : negRail ? 'rgba(37,99,235,0.45)'
            : '#b0b8c4';
          ctx.shadowBlur = 0;
        }
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.strokeStyle = posRail ? 'rgba(185,28,28,0.4)'
          : negRail ? 'rgba(29,78,216,0.4)'
          : 'rgba(148,163,184,0.6)';
        ctx.lineWidth = 0.7;
        ctx.stroke();
      }
    });

    if (previewWire) {
      const { from, to } = previewWire;
      ctx.beginPath();
      ctx.moveTo(colToX(from.col), rowToY(from.row));
      ctx.lineTo(colToX(to.col), rowToY(to.row));
      ctx.strokeStyle = 'rgba(245,158,11,0.5)';
      ctx.lineWidth = 2; ctx.setLineDash([4, 4]); ctx.stroke(); ctx.setLineDash([]);
    }

    components.forEach((comp) => {
      if (!comp.points || comp.points.length < 2) return;
      const [p1, p2] = comp.points;
      const x1 = colToX(p1.col), y1 = rowToY(p1.row);
      const x2 = colToX(p2.col), y2 = rowToY(p2.row);
      const isSel = selectedComponent === comp.id;

      if (isSel) {
        ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
        ctx.strokeStyle = 'rgba(6,182,212,0.4)'; ctx.lineWidth = 7; ctx.stroke();
      }

      if (comp.type === COMPONENT_TYPES.WIRE) {
        ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
        ctx.strokeStyle = '#f59e0b'; ctx.lineWidth = 2.5; ctx.stroke();
        [{ x: x1, y: y1 }, { x: x2, y: y2 }].forEach(({ x, y }) => {
          ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI * 2);
          ctx.fillStyle = '#d97706'; ctx.fill();
        });
      } else if (comp.type === COMPONENT_TYPES.RESISTOR) {
        drawResistor(ctx, x1, y1, x2, y2);
      } else if (comp.type === COMPONENT_TYPES.LED) {
        drawLED(ctx, x1, y1, x2, y2, comp.color);
      } else if (comp.type === COMPONENT_TYPES.BATTERY) {
        drawBattery(ctx, x1, y1, x2, y2);
      }
    });
  }, [components, selectedTool, pendingPoint, hoveredPoint, selectedComponent, previewWire]);

  useEffect(() => { draw(); }, [draw]);

  const getPointFromEvent = useCallback((e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const mx = (e.clientX - rect.left) * scaleX;
    const my = (e.clientY - rect.top) * scaleY;
    let closest = null, minDist = CELL * 0.55;
    allRows.forEach((row) => {
      for (let col = 1; col <= COLS; col++) {
        const cx = colToX(col), cy = rowToY(row);
        const dist = Math.sqrt((mx - cx) ** 2 + (my - cy) ** 2);
        if (dist < minDist) { minDist = dist; closest = { row, col }; }
      }
    });
    return closest;
  }, []);

  const handleMouseMove = useCallback((e) => {
    onPointHover(getPointFromEvent(e));
  }, [getPointFromEvent, onPointHover]);

  const handleClick = useCallback((e) => {
    const point = getPointFromEvent(e);
    if (!point) return;
    if (!selectedTool) {
      const comp = components.find(
        (c) => c.points && c.points.some((p) => p.row === point.row && p.col === point.col)
      );
      if (comp) { onComponentClick(comp.id); return; }
    }
    onPointClick(point);
  }, [getPointFromEvent, onPointClick, onComponentClick, components, selectedTool]);

  const handleMouseLeave = useCallback(() => { onPointHover(null); }, [onPointHover]);

  return (
    <div className="relative flex flex-col items-center gap-2">
      <div className="flex items-center gap-6 text-xs font-semibold">
        <span className="flex items-center gap-1.5 text-red-500">
          <span className="w-3 h-1 bg-red-500 rounded inline-block" /> + Positivo (2 filas)
        </span>
        <span className="flex items-center gap-1.5 text-blue-500">
          <span className="w-3 h-1 bg-blue-500 rounded inline-block" /> − Negativo (2 filas)
        </span>
      </div>

      <canvas
        ref={canvasRef}
        width={BOARD_W}
        height={BOARD_H}
        onClick={handleClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="rounded-xl cursor-crosshair"
        style={{
          maxWidth: '100%',
          boxShadow: '0 2px 16px rgba(0,0,0,0.10), 0 1px 3px rgba(0,0,0,0.08)',
          border: '1.5px solid #e5e7eb',
        }}
      />

      {selectedComponent && (
        <div className="text-xs text-cyan-400 font-semibold animate-pulse">
          Componente seleccionado — presiona Delete para eliminar
        </div>
      )}
    </div>
  );
}
