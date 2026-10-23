import { useEffect, useRef, useState } from 'react';
import { createFlightAudio } from './flightAudio';

export default function useFlightAudio(telemetry) {
  const [enabled, setEnabled] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [volume, setVolume] = useState(.3);
  const audio = useRef(null);
  const mounted = useRef(false);
  const enabledRef = useRef(false);
  const latest = useRef({ telemetry, volume });
  latest.current = { telemetry, volume };

  useEffect(() => {
    mounted.current = true;
    const onVisibility = () => {
      const current = audio.current;
      if (!current) return;
      if (document.hidden) {
        current.graph.silence();
        current.context.suspend().catch(() => {});
      } else if (enabledRef.current) {
        current.context.resume().then(() => {
          if (enabledRef.current && !document.hidden) current.graph.update(latest.current.telemetry, latest.current.volume);
        }).catch(() => {
          if (mounted.current) { enabledRef.current = false; setEnabled(false); setError('Click Sound on to resume audio.'); }
        });
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      mounted.current = false;
      enabledRef.current = false;
      document.removeEventListener('visibilitychange', onVisibility);
      const current = audio.current;
      audio.current = null;
      if (current) { current.graph.dispose(); current.context.close().catch(() => {}); }
    };
  }, []);

  useEffect(() => {
    if (enabled && audio.current) audio.current.graph.update(telemetry, document.hidden ? 0 : volume);
  }, [enabled, volume, telemetry.speed, telemetry.throttle]);

  const toggle = async () => {
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      if (enabledRef.current) {
        enabledRef.current = false;
        setEnabled(false);
        audio.current.graph.silence();
        await audio.current.context.suspend();
      } else {
        if (!audio.current) {
          const AudioContext = window.AudioContext || window.webkitAudioContext;
          if (!AudioContext) throw new Error('Audio unavailable');
          const context = new AudioContext();
          audio.current = { context, graph: createFlightAudio(context) };
        }
        // Called directly from the button gesture to satisfy browser autoplay rules.
        await audio.current.context.resume();
        if (!mounted.current) return;
        enabledRef.current = true;
        setEnabled(true);
        audio.current.graph.update(latest.current.telemetry, document.hidden ? 0 : latest.current.volume);
      }
    } catch {
      const current = audio.current;
      audio.current = null;
      if (current) { current.graph.dispose(); current.context.close().catch(() => {}); }
      if (mounted.current) { enabledRef.current = false; setEnabled(false); setError('Unable to start audio. Try Sound on again.'); }
    } finally {
      if (mounted.current) setBusy(false);
    }
  };
  return { enabled, busy, error, volume, setVolume, toggle };
}
