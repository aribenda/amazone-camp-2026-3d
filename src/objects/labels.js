import * as THREE from 'three';

export function createLabel(text, { color = '#101820', bg = 'rgba(255,255,255,0.86)' } = {}) {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  const scale = window.devicePixelRatio || 1;
  const width = 192;
  const height = 192;

  canvas.width = width * scale;
  canvas.height = height * scale;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  context.scale(scale, scale);

  context.clearRect(0, 0, width, height);
  context.fillStyle = bg;
  context.beginPath();
  context.arc(width / 2, height / 2, 76, 0, Math.PI * 2);
  context.fill();
  context.strokeStyle = 'rgba(16, 24, 32, 0.22)';
  context.lineWidth = 8;
  context.stroke();

  context.fillStyle = color;
  context.font = '800 74px Inter, Arial, sans-serif';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText(text, width / 2, height / 2 + 3);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthTest: false,
    depthWrite: false,
  });

  const sprite = new THREE.Sprite(material);
  sprite.scale.set(0.48, 0.48, 1);
  sprite.renderOrder = 20;
  return sprite;
}
