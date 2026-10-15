const clamp = (value, maximum) => Math.min(maximum, Math.max(0, Number(value) || 0));

export function getFlightSound(telemetry, volume = .3) {
  const throttle = clamp(telemetry.throttle, 100) / 100;
  const speed = clamp(telemetry.speed, 400) / 400;
  return {
    master: throttle > 0 || speed > .0025 ? clamp(volume, 1) : 0,
    rumbleFrequency: 45 + throttle * 80,
    turbineFrequency: 340 + throttle * 1100 + speed * 180,
    exhaustFrequency: 450 + throttle * 1600,
    rumbleGain: .06 + throttle * .1,
    turbineGain: .008 + throttle * .022,
    exhaustGain: .12 + throttle * .3,
    windGain: speed * speed * .22,
  };
}

// Synthesized turbine/exhaust/wind layers require no downloads or audio loops.
export function createFlightAudio(context) {
  const nodes = [];
  const sources = [];
  const track = node => { nodes.push(node); return node; };
  const master = track(context.createGain());
  master.gain.value = 0;
  const compressor = track(context.createDynamicsCompressor());
  compressor.threshold.value = -18;
  compressor.ratio.value = 4;
  master.connect(compressor).connect(context.destination);

  const oscillator = (type, frequency) => {
    const source = track(context.createOscillator());
    source.type = type;
    source.frequency.value = frequency;
    const gain = track(context.createGain());
    gain.gain.value = 0;
    source.connect(gain).connect(master);
    sources.push(source);
    source.start();
    return { source, gain };
  };
  const rumble = oscillator('sine', 45);
  const turbine = oscillator('sine', 340);

  const buffer = context.createBuffer(1, context.sampleRate * 2, context.sampleRate);
  const samples = buffer.getChannelData(0);
  let seed = 771;
  for (let i = 0; i < samples.length; i++) {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    samples[i] = seed / 2147483648 - 1;
  }
  const noise = track(context.createBufferSource());
  noise.buffer = buffer;
  noise.loop = true;
  sources.push(noise);
  const exhaustFilter = track(context.createBiquadFilter());
  exhaustFilter.type = 'lowpass';
  exhaustFilter.Q.value = .5;
  const exhaustGain = track(context.createGain());
  exhaustGain.gain.value = 0;
  noise.connect(exhaustFilter).connect(exhaustGain).connect(master);
  const windFilter = track(context.createBiquadFilter());
  windFilter.type = 'bandpass';
  windFilter.frequency.value = 1200;
  windFilter.Q.value = .5;
  const windGain = track(context.createGain());
  windGain.gain.value = 0;
  noise.connect(windFilter).connect(windGain).connect(master);
  noise.start();

  const smooth = (parameter, value) => {
    const now = context.currentTime;
    if (parameter.cancelAndHoldAtTime) parameter.cancelAndHoldAtTime(now);
    else parameter.cancelScheduledValues(now);
    parameter.setTargetAtTime(value, now, .12);
  };
  return {
    update(telemetry, volume) {
      const sound = getFlightSound(telemetry, volume);
      smooth(master.gain, sound.master);
      smooth(rumble.source.frequency, sound.rumbleFrequency);
      smooth(turbine.source.frequency, sound.turbineFrequency);
      smooth(rumble.gain.gain, sound.rumbleGain);
      smooth(turbine.gain.gain, sound.turbineGain);
      smooth(exhaustFilter.frequency, sound.exhaustFrequency);
      smooth(exhaustGain.gain, sound.exhaustGain);
      smooth(windGain.gain, sound.windGain);
    },
    silence() { smooth(master.gain, 0); },
    dispose() {
      sources.forEach(source => source.stop());
      nodes.forEach(node => node.disconnect());
    },
  };
}
