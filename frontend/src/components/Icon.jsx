const paths = {
  plane: 'M22 2 9 15m13-13-5 20-4-9-9-4 18-7Z',
  dashboard: 'm3 10 9-7 9 7v11h-6v-7H9v7H3V10Z',
  aircraft: 'm12 3 2 7 7 3v2l-7-1v5l3 2v1l-5-1-5 1v-1l3-2v-5l-7 1v-2l7-3 2-7Z',
  flights: 'M5 5h14v16H5V5Zm3-3v6m8-6v6M5 10h14m-10 5 2 2 4-4',
  simulator: 'M7 7h10l4 5v6a2 2 0 0 1-3 1l-3-3H9l-3 3a2 2 0 0 1-3-1v-6l4-5Zm0 3v5m-2-2h4m7-1h.01m3 2h.01',
  telemetry: 'M4 20V12m5 8V4m6 16v-9m5 9V7',
  report: 'M5 3h9l5 5v13H5V3Zm9 0v5h5M9 12h6m-6 4h6',
  maintenance: 'm14 6 4-4a6 6 0 0 1-7 8L4 20a2 2 0 0 1-3-3l10-7a6 6 0 0 1 8-7l-5 3Z',
  chip: 'M6 6h12v12H6V6Zm4 4h4v4h-4v-4ZM9 2v4m6-4v4M9 18v4m6-4v4M2 9h4m-4 6h4m12-6h4m-4 6h4',
  altitude: 'm2 20 7-16 5 9 3-5 5 12H2Zm4-7 3 2 3-2',
  speed: 'M4 19a10 10 0 1 1 16 0M12 13l5-6M6 9l1 1m10 0 1-1M12 4v2',
  heading: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm4 6-3 6-5 2 3-6 5-2Z',
  fuel: 'M4 21V3h9v18H4Zm0-12h9m2-6 4 4v9a2 2 0 0 1-4 0v-4h-2M2 21h13',
  pitch: 'M3 12h18M12 5v14m-4-7 4-4 4 4',
  roll: 'M3 12h18M12 3v18m-6-5 6 3 6-3',
  throttle: 'M4 20v-5h3v5H4Zm7 0V9h3v11h-3Zm7 0V3h3v17h-3Z',
  keyboard: 'M2 5h20v14H2V5Zm3 4h.01m4 0h.01m4 0h.01m4 0h.01M5 13h.01m4 0h.01m4 0h.01m4 0h.01M7 16h10',
  level: 'M12 2v4m0 12v4M2 12h4m12 0h4M12 6a6 6 0 1 0 0 12 6 6 0 0 0 0-12Z',
  download: 'M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5',
  back: 'm10 5-7 7 7 7M3 12h18',
  info: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 9v6m0-10h.01',
};

export default function Icon({ name, size = 20, className = '' }) {
  return <svg className={`icon ${className}`} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[name] ?? paths.plane} /></svg>;
}
