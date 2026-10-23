import * as THREE from 'three';

// Local procedural textures keep the environment available without external assets.
export function createSurfaceTexture(kind) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 512;
  const context = canvas.getContext('2d');
  const pixels = context.createImageData(512, 512);
  let seed = kind === 'grass' ? 173 : 421;
  const random = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  for (let y = 0; y < 512; y++) {
    for (let x = 0; x < 512; x++) {
      const noise = (random() - .5) * (kind === 'grass' ? 26 : 19);
      const patches = Math.sin(x * Math.PI / 128) * Math.cos(y * Math.PI / 128) * 2;
      const base = kind === 'grass' ? [105, 116, 80] : [84, 87, 90];
      const offset = (y * 512 + x) * 4;
      for (let channel = 0; channel < 3; channel++) pixels.data[offset + channel] = base[channel] + noise + patches;
      pixels.data[offset + 3] = 255;
    }
  }
  context.putImageData(pixels, 0, 0);
  if (kind === 'asphalt') {
    context.strokeStyle = 'rgba(25, 29, 32, 0.18)';
    for (let i = 0; i < 30; i++) {
      const x = 195 + random() * 122;
      context.lineWidth = 1 + random() * 2;
      context.beginPath();
      context.moveTo(x, 0);
      context.lineTo(x + (random() - .5) * 8, 512);
      context.stroke();
    }
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.anisotropy = 8;
  texture.repeat.set(kind === 'grass' ? 70 : 1, kind === 'grass' ? 70 : 12);
  return texture;
}

export function createCloudTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 128;
  const context = canvas.getContext('2d');
  const puffs = [[42, 77, 33], [76, 62, 40], [115, 48, 44], [150, 65, 41], [190, 72, 36], [218, 82, 24]];
  for (const [x, y, radius] of puffs) {
    const gradient = context.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, 'rgba(255,255,255,0.65)');
    gradient.addColorStop(.45, 'rgba(244,250,255,0.45)');
    gradient.addColorStop(1, 'rgba(244,250,255,0)');
    context.fillStyle = gradient;
    context.fillRect(x - radius, y - radius, radius * 2, radius * 2);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}
