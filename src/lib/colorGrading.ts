export interface FilterConfig {
  exposure: number;     // -100 ~ 100
  contrast: number;     // -100 ~ 100
  warmth: number;       // -100 ~ 100 (Color Temp: Blue <-> Yellow/Amber)
  tint: number;         // -100 ~ 100 (Green <-> Magenta/Pink)
  highlights: number;   // -100 ~ 100 (Roll-off & Cream compression)
  shadows: number;      // -100 ~ 100 (Lifted Matte Blacks)
  bloom: number;        // 0 ~ 100 (Dreamy Soft Glow / Orton Effect)
  greenMute: number;    // 0 ~ 100 (Mutes neon greens to soft pastel sage)
  grain: number;        // 0 ~ 100 (Film grain)
  vignette: number;     // 0 ~ 100 (Soft corner falloff)
}

export const DEFAULT_FILTER_CONFIG: FilterConfig = {
  exposure: 0,
  contrast: 0,
  warmth: 0,
  tint: 0,
  highlights: 0,
  shadows: 0,
  bloom: 0,
  greenMute: 0,
  grain: 0,
  vignette: 0,
};

function clamp(v: number, min = 0, max = 255): number {
  return Math.max(min, Math.min(max, v));
}

// Applies pixel-level color grading
export function applyColorGrading(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  config: FilterConfig
) {
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;
  const len = data.length;

  // Precompute constants
  const expMul = 1.0 + config.exposure * 0.008;
  const expAdd = config.exposure * 0.4;
  const contrastFactor = (259 * (config.contrast * 1.5 + 255)) / (255 * (259 - config.contrast * 1.5));
  const warmth = config.warmth * 0.45;
  const tint = config.tint * 0.35;
  const shadowLift = config.shadows * 0.55;
  const highlightRoll = config.highlights * 0.4;
  const greenMuteAmount = config.greenMute / 100;
  const grainAmount = config.grain * 0.25;

  for (let i = 0; i < len; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];

    // 1. Exposure
    r = r * expMul + expAdd;
    g = g * expMul + expAdd;
    b = b * expMul + expAdd;

    // 2. Luminance calculation
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;

    // 3. Contrast adjustment centered around midtone ~128
    r = 128 + (r - 128) * contrastFactor;
    g = 128 + (g - 128) * contrastFactor;
    b = 128 + (b - 128) * contrastFactor;

    // 4. White balance: Warmth (Amber/Blue) & Tint (Magenta/Green)
    r += warmth * 1.1 + tint * 0.7;
    g += warmth * 0.3 - tint * 0.6;
    b += -warmth * 1.0 + tint * 0.3;

    // 5. Shadow lift (faded matte blacks with warm peachy hue)
    if (shadowLift !== 0) {
      const shadowFactor = Math.max(0, 1.0 - lum / 170.0);
      r += shadowFactor * shadowLift * 1.15;
      g += shadowFactor * shadowLift * 0.95;
      b += shadowFactor * shadowLift * 0.8;
    }

    // 6. Highlight rolloff & creamy ivory compression
    if (highlightRoll !== 0 && lum > 170) {
      const highFactor = (lum - 170.0) / 85.0;
      r -= highFactor * highlightRoll * 0.3;
      g -= highFactor * highlightRoll * 0.6;
      b -= highFactor * highlightRoll * 1.0; // softens harsh cool whites into warm cream/ivory
    }

    // 7. Green Harmonizer (mutes neon greens into soft sage/olive for cherry blossom harmony)
    if (greenMuteAmount > 0 && g > r && g > b) {
      const greenExcess = g - Math.max(r, b);
      if (greenExcess > 10) {
        const muteEffect = greenExcess * greenMuteAmount * 0.65;
        g -= muteEffect * 0.75;
        r += muteEffect * 0.55; // warm shift
        b += muteEffect * 0.2;
      }
    }

    // 8. Film Grain
    if (grainAmount > 0) {
      const noise = (Math.random() - 0.5) * grainAmount * 2.5;
      r += noise;
      g += noise;
      b += noise;
    }

    data[i] = clamp(r);
    data[i + 1] = clamp(g);
    data[i + 2] = clamp(b);
  }

  ctx.putImageData(imgData, 0, 0);

  // 9. Soft Vignette pass if enabled
  if (config.vignette > 0) {
    const gradient = ctx.createRadialGradient(
      width / 2,
      height / 2,
      (Math.min(width, height) / 2) * 0.6,
      width / 2,
      height / 2,
      Math.sqrt(width * width + height * height) / 1.8
    );
    gradient.addColorStop(0, "rgba(0, 0, 0, 0)");
    gradient.addColorStop(1, `rgba(40, 20, 15, ${(config.vignette / 100) * 0.4})`);

    ctx.save();
    ctx.globalCompositeOperation = "multiply";
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
  }

  // 10. Dreamy Bloom / Orton Glow Effect pass
  if (config.bloom > 0) {
    applyBloom(ctx, width, height, config.bloom);
  }
}

// High-performance Orton Glow / Bloom using scaled canvas blur
function applyBloom(ctx: CanvasRenderingContext2D, width: number, height: number, bloomStrength: number) {
  const bloomCanvas = document.createElement("canvas");
  const scale = 0.25; // 1/4 resolution for ultra fast smooth blur
  const bw = Math.max(1, Math.floor(width * scale));
  const bh = Math.max(1, Math.floor(height * scale));
  bloomCanvas.width = bw;
  bloomCanvas.height = bh;

  const bCtx = bloomCanvas.getContext("2d");
  if (!bCtx) return;

  // Draw scaled down
  bCtx.drawImage(ctx.canvas, 0, 0, bw, bh);

  // Extract highlights and tint them warm/peach
  const bImgData = bCtx.getImageData(0, 0, bw, bh);
  const bData = bImgData.data;
  const bLen = bData.length;

  for (let i = 0; i < bLen; i += 4) {
    const lum = 0.299 * bData[i] + 0.587 * bData[i + 1] + 0.114 * bData[i + 2];
    if (lum > 140) {
      const factor = (lum - 140) / 115;
      bData[i] = clamp(bData[i] * 1.15 * factor); // warm pinkish/peach highlight
      bData[i + 1] = clamp(bData[i + 1] * 1.05 * factor);
      bData[i + 2] = clamp(bData[i + 2] * 0.95 * factor);
      bData[i + 3] = clamp(255 * factor);
    } else {
      bData[i] = 0;
      bData[i + 1] = 0;
      bData[i + 2] = 0;
      bData[i + 3] = 0;
    }
  }
  bCtx.putImageData(bImgData, 0, 0);

  // Composite back onto original with smooth soft blur & screen blend
  ctx.save();
  ctx.globalAlpha = (bloomStrength / 100) * 0.65;
  ctx.filter = `blur(${Math.max(4, Math.round(width * 0.015))}px)`;
  ctx.globalCompositeOperation = "screen";
  ctx.drawImage(bloomCanvas, 0, 0, width, height);

  // Soft light overlay for dreamy cinematic depth
  ctx.globalAlpha = (bloomStrength / 100) * 0.3;
  ctx.globalCompositeOperation = "soft-light";
  ctx.drawImage(bloomCanvas, 0, 0, width, height);
  ctx.restore();
}

// Convert sRGB to CIELAB for perceptual color transfer
function rgbToLab(r: number, g: number, b: number): [number, number, number] {
  let rn = r / 255;
  let gn = g / 255;
  let bn = b / 255;

  rn = rn > 0.04045 ? Math.pow((rn + 0.055) / 1.055, 2.4) : rn / 12.92;
  gn = gn > 0.04045 ? Math.pow((gn + 0.055) / 1.055, 2.4) : gn / 12.92;
  bn = bn > 0.04045 ? Math.pow((bn + 0.055) / 1.055, 2.4) : bn / 12.92;

  let x = (rn * 0.4124 + gn * 0.3576 + bn * 0.1805) / 0.95047;
  let y = (rn * 0.2126 + gn * 0.7152 + bn * 0.0722) / 1.00000;
  let z = (rn * 0.0193 + gn * 0.1192 + bn * 0.9505) / 1.08883;

  const f = (t: number) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
  const fx = f(x);
  const fy = f(y);
  const fz = f(z);

  const L = 116 * fy - 16;
  const a = 500 * (fx - fy);
  const bVal = 200 * (fy - fz);
  return [L, a, bVal];
}

function labToRgb(L: number, a: number, bVal: number): [number, number, number] {
  const fy = (L + 16) / 116;
  const fx = a / 500 + fy;
  const fz = fy - bVal / 200;

  const fInv = (t: number) => (Math.pow(t, 3) > 0.008856 ? Math.pow(t, 3) : (t - 16 / 116) / 7.787);

  const x = 0.95047 * fInv(fx);
  const y = 1.00000 * fInv(fy);
  const z = 1.08883 * fInv(fz);

  let rn = x * 3.2406 + y * -1.5372 + z * -0.4986;
  let gn = x * -0.9689 + y * 1.8758 + z * 0.0415;
  let bn = x * 0.0557 + y * -0.2040 + z * 1.0570;

  const gamma = (v: number) => (v > 0.0031308 ? 1.055 * Math.pow(v, 1 / 2.4) - 0.055 : 12.92 * v);

  return [
    clamp(Math.round(gamma(rn) * 255)),
    clamp(Math.round(gamma(gn) * 255)),
    clamp(Math.round(gamma(bn) * 255)),
  ];
}

// Reinhard Lab Color Transfer: transfers color mood from a reference image to source image
export function transferColorFromReference(
  sourceCanvas: HTMLCanvasElement,
  targetCanvas: HTMLCanvasElement,
  intensity: number = 0.85
) {
  const sCtx = sourceCanvas.getContext("2d");
  const tCtx = targetCanvas.getContext("2d");
  if (!sCtx || !tCtx) return;

  const sW = sourceCanvas.width;
  const sH = sourceCanvas.height;
  const tW = targetCanvas.width;
  const tH = targetCanvas.height;

  const sImg = sCtx.getImageData(0, 0, sW, sH);
  const tImg = tCtx.getImageData(0, 0, tW, tH);

  // Compute Source stats in Lab
  const sData = sImg.data;
  let sLSum = 0, saSum = 0, sbSum = 0;
  const sCount = sData.length / 4;
  const sampleStep = Math.max(1, Math.floor(sCount / 20000));
  let sampleCountS = 0;

  for (let i = 0; i < sData.length; i += 4 * sampleStep) {
    const [L, a, b] = rgbToLab(sData[i], sData[i + 1], sData[i + 2]);
    sLSum += L;
    saSum += a;
    sbSum += b;
    sampleCountS++;
  }
  const sLMean = sLSum / sampleCountS;
  const saMean = saSum / sampleCountS;
  const sbMean = sbSum / sampleCountS;

  let sLVar = 0, saVar = 0, sbVar = 0;
  for (let i = 0; i < sData.length; i += 4 * sampleStep) {
    const [L, a, b] = rgbToLab(sData[i], sData[i + 1], sData[i + 2]);
    sLVar += Math.pow(L - sLMean, 2);
    saVar += Math.pow(a - saMean, 2);
    sbVar += Math.pow(b - sbMean, 2);
  }
  const sLStd = Math.sqrt(sLVar / sampleCountS) || 1;
  const saStd = Math.sqrt(saVar / sampleCountS) || 1;
  const sbStd = Math.sqrt(sbVar / sampleCountS) || 1;

  // Compute Reference stats in Lab
  const tData = tImg.data;
  let tLSum = 0, taSum = 0, tbSum = 0;
  const tCount = tData.length / 4;
  const tStep = Math.max(1, Math.floor(tCount / 20000));
  let sampleCountT = 0;

  for (let i = 0; i < tData.length; i += 4 * tStep) {
    const [L, a, b] = rgbToLab(tData[i], tData[i + 1], tData[i + 2]);
    tLSum += L;
    taSum += a;
    tbSum += b;
    sampleCountT++;
  }
  const tLMean = tLSum / sampleCountT;
  const taMean = taSum / sampleCountT;
  const tbMean = tbSum / sampleCountT;

  let tLVar = 0, taVar = 0, tbVar = 0;
  for (let i = 0; i < tData.length; i += 4 * tStep) {
    const [L, a, b] = rgbToLab(tData[i], tData[i + 1], tData[i + 2]);
    tLVar += Math.pow(L - tLMean, 2);
    taVar += Math.pow(a - taMean, 2);
    tbVar += Math.pow(b - tbMean, 2);
  }
  const tLStd = Math.sqrt(tLVar / sampleCountT) || 1;
  const taStd = Math.sqrt(taVar / sampleCountT) || 1;
  const tbStd = Math.sqrt(tbVar / sampleCountT) || 1;

  // Transfer color to source
  for (let i = 0; i < sData.length; i += 4) {
    const origR = sData[i];
    const origG = sData[i + 1];
    const origB = sData[i + 2];

    const [L, a, b] = rgbToLab(origR, origG, origB);

    // Color transfer formula with user intensity control
    let newL = (L - sLMean) * (tLStd / sLStd) + tLMean;
    let newA = (a - saMean) * (taStd / saStd) + taMean;
    let newB = (b - sbMean) * (tbStd / sbStd) + tbMean;

    const [trR, trG, trB] = labToRgb(newL, newA, newB);

    // Blend between original and transferred color
    sData[i] = clamp(origR * (1 - intensity) + trR * intensity);
    sData[i + 1] = clamp(origG * (1 - intensity) + trG * intensity);
    sData[i + 2] = clamp(origB * (1 - intensity) + trB * intensity);
  }

  sCtx.putImageData(sImg, 0, 0);
}
