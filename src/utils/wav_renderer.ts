const dataMap = new WeakMap();

/**
 * Normalizes a Float32Array to Array(m): We use this to draw amplitudes on a graph
 * If we're rendering the same audio data, then we'll often be using
 * the same (data, m, downsamplePeaks) triplets so we give option to memoize
 */
const normalizeArray = (
  data: Float32Array,
  m: number,
  downsamplePeaks: boolean = false
) => {
  let cache, mKey, dKey;
  const n = data.length;
  const result = new Array(m);
  if (m <= n) {
    // Downsampling
    result.fill(0);
    const count = new Array(m).fill(0);
    for (let i = 0; i < n; i++) {
      const index = Math.floor(i * (m / n));
      if (downsamplePeaks) {
        // take highest result in the set
        result[index] = Math.max(result[index], Math.abs(data[i]));
      } else {
        result[index] += Math.abs(data[i]);
      }
      count[index]++;
    }
    if (!downsamplePeaks) {
      for (let i = 0; i < result.length; i++) {
        result[i] = result[i] / count[i];
      }
    }
  } else {
    for (let i = 0; i < m; i++) {
      const index = (i * (n - 1)) / (m - 1);
      const low = Math.floor(index);
      const high = Math.ceil(index);
      const t = index - low;
      if (high >= n) {
        result[i] = data[n - 1];
      } else {
        result[i] = data[low] * (1 - t) + data[high] * t;
      }
    }
  }

  return result;
};

/**
 * Converts frequency amplitudes to viseme values for lip sync animation
 * @param points Array of frequency amplitudes
 * @returns Object containing viseme values
 */
const getVisemeValues = (points: number[]): Record<string, number> => {
  // Ensure we have enough points for analysis
  if (points.length < 10) {
    return { viseme_sil: 1 };
  }

  // Initialize all visemes to 0
  const visemes: Record<string, number> = {
    viseme_aa: 0,
    viseme_E: 0,
    viseme_I: 0,
    viseme_O: 0,
    viseme_U: 0,
    viseme_CH: 0,
    viseme_DD: 0,
    viseme_FF: 0,
    viseme_kk: 0,
    viseme_nn: 0,
    viseme_PP: 0,
    viseme_RR: 0,
    viseme_sil: 0,
    viseme_SS: 0,
    viseme_TH: 0
  };

  // Calculate total points per Hz (assuming Nyquist frequency is half sample rate)
  // For 24000Hz sample rate, we have 22,050 range split across points.length points
  const pointsPerHz = points.length / 22050;

  // Define frequency ranges
  const ranges = {
    veryLow: points.slice(0, Math.floor(500 * pointsPerHz)),  // 0-500Hz (vowels)
    pbm: points.slice(Math.floor(500 * pointsPerHz), Math.floor(1500 * pointsPerHz)),  // 500-1500Hz (P,B,M)
    fv: points.slice(Math.floor(1500 * pointsPerHz), Math.floor(2500 * pointsPerHz)),  // 1500-2500Hz (F,V)
    w: points.slice(Math.floor(2000 * pointsPerHz), Math.floor(3000 * pointsPerHz)),   // 2000-3000Hz (W)
    r: points.slice(Math.floor(2500 * pointsPerHz), Math.floor(2500 * pointsPerHz)),   // 2500Hz (R)
    sz: points.slice(Math.floor(3500 * pointsPerHz), Math.floor(4500 * pointsPerHz)),  // 3500-4500Hz (S,Z)
    veryHigh: points.slice(Math.floor(4500 * pointsPerHz))  // 4500Hz+ (other fricatives)
  };

  // Calculate average amplitudes for each range
  const amplitudes = Object.fromEntries(
    Object.entries(ranges).map(([key, range]) => [
      key,
      range.length > 0 ? range.reduce((sum, val) => sum + val, 0) / range.length : 0
    ])
  );

  // Normalize amplitudes to 0-1 range
  const maxAmp = Math.max(...Object.values(amplitudes));
  const normalized = Object.fromEntries(
    Object.entries(amplitudes).map(([key, amp]) => [
      key,
      maxAmp > 0 ? amp / maxAmp : 0
    ])
  );

  // Map frequency ranges to visemes
  if (maxAmp < 0.1) {
    // If overall amplitude is very low, use silent viseme
    visemes.viseme_sil = 1;
  } else {
    // Vowels (very low frequency)
    if (normalized.veryLow > 0.3) {
      visemes.viseme_aa = normalized.veryLow * 0.3;
      visemes.viseme_O = normalized.veryLow * 0.2;
      visemes.viseme_U = normalized.veryLow * 0.2;
    }

    // P, B, M sounds (500-1500Hz)
    if (normalized.pbm > 0.3) {
      visemes.viseme_PP = normalized.pbm * 0.4;
      visemes.viseme_aa = 0;
      visemes.viseme_O = 0;
      visemes.viseme_U = 0;
    }

    // F, V sounds (1500-2500Hz)
    if (normalized.fv > 0.3) {
      visemes.viseme_FF = normalized.fv * 0.4;
    }

    // W sound (2000-3000Hz)
    if (normalized.w > 0.3) {
      visemes.viseme_U = Math.max(visemes.viseme_U, normalized.w * 0.3);
    }

    // R sound (2500Hz)
    if (normalized.r > 0.3) {
      visemes.viseme_RR = normalized.r * 0.4;
    }

    // S, Z sounds (3500-4500Hz)
    if (normalized.sz > 0.3) {
      visemes.viseme_SS = normalized.sz * 0.4;
    }

    // Other high frequency sounds
    if (normalized.veryHigh > 0.3) {
      visemes.viseme_TH = normalized.veryHigh * 0.3;
      visemes.viseme_CH = normalized.veryHigh * 0.2;
    }
  }

  return visemes;
};

export const WavRenderer = {
  /**
   * Renders a point-in-time snapshot of an audio sample, usually frequency values
   * @param canvas
   * @param ctx
   * @param data
   * @param color
   * @param pointCount number of bars to render
   * @param barWidth width of bars in px
   * @param barSpacing spacing between bars in px
   * @param center vertically center the bars
   */
  drawBars: (
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    data: Float32Array,
    color: string,
    pointCount: number = 0,
    barWidth: number = 0,
    barSpacing: number = 0,
    center: boolean = false
  ) => {
    pointCount = Math.floor(
      Math.min(
        pointCount,
        (canvas.width - barSpacing) / (Math.max(barWidth, 1) + barSpacing)
      )
    );
    if (!pointCount) {
      pointCount = Math.floor(
        (canvas.width - barSpacing) / (Math.max(barWidth, 1) + barSpacing)
      );
    }
    if (!barWidth) {
      barWidth = (canvas.width - barSpacing) / pointCount - barSpacing;
    }
    const points = normalizeArray(data, pointCount, true);
    for (let i = 0; i < pointCount; i++) {
      const amplitude = Math.abs(points[i]);
      const height = Math.max(1, amplitude * canvas.height);
      const x = barSpacing + i * (barWidth + barSpacing);
      const y = center ? (canvas.height - height) / 2 : canvas.height - height;
      ctx.fillStyle = color;
      ctx.fillRect(x, y, barWidth, height);
    }
    return points;
  },

  /**
   * Converts frequency data to viseme values for lip sync animation
   * @param data Float32Array of frequency data
   * @param pointCount number of frequency points to analyze
   * @returns Object containing viseme values
   */
  getVisemeData: (data: Float32Array, pointCount: number = 15) => {
    const points = normalizeArray(data, pointCount, true);
    return getVisemeValues(points);
  }
};
