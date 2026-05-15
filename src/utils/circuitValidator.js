/**
 * Definiciones compartidas para el laboratorio de circuitos.
 * NOTA: La validación del circuito fue removida intencionalmente.
 * Este laboratorio es solo para practicar el armado libre.
 */

export const COMPONENT_TYPES = {
  WIRE: 'wire',
  RESISTOR: 'resistor',
  LED: 'led',
  BATTERY: 'battery',
};

export const LED_COLORS = {
  red: { on: '#ff2d55', off: '#4a1020', glow: 'rgba(255,45,85,0.6)' },
  green: { on: '#00ff88', off: '#003320', glow: 'rgba(0,255,136,0.6)' },
  blue: { on: '#0af', off: '#002040', glow: 'rgba(0,170,255,0.6)' },
  yellow: { on: '#ffe600', off: '#3a3000', glow: 'rgba(255,230,0,0.6)' },
};
