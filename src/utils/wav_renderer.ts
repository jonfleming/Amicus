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
  if (points.length < 3) {
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

  // Split points into frequency ranges
  const lowFreq = points.slice(0, Math.floor(points.length * 0.2));  // 0-20% (roughly 0-500Hz)
  const midFreq = points.slice(Math.floor(points.length * 0.2), Math.floor(points.length * 0.6));  // 20-60% (roughly 500-2000Hz)
  const highFreq = points.slice(Math.floor(points.length * 0.6));  // 60-100% (roughly 2000Hz+)

  // Calculate average amplitudes for each range
  const lowAmp = lowFreq.reduce((sum, val) => sum + val, 0) / lowFreq.length;
  const midAmp = midFreq.reduce((sum, val) => sum + val, 0) / midFreq.length;
  const highAmp = highFreq.reduce((sum, val) => sum + val, 0) / highFreq.length;

  // Normalize amplitudes to 0-1 range
  const maxAmp = Math.max(lowAmp, midAmp, highAmp);
  const normalizedLow = maxAmp > 0 ? lowAmp / maxAmp : 0;
  const normalizedMid = maxAmp > 0 ? midAmp / maxAmp : 0;
  const normalizedHigh = maxAmp > 0 ? highAmp / maxAmp : 0;

  // Map frequency ranges to visemes
  if (maxAmp < 0.1) {
    // If overall amplitude is very low, use silent viseme
    visemes.viseme_sil = 1;
  } else {
    // Vowels (low frequency)
    if (normalizedLow > 0.3) {
      visemes.viseme_aa = normalizedLow * 0.3;
      visemes.viseme_U = normalizedLow * 0.2;
    }

    // Consonants (mid frequency)
    if (normalizedMid > 0.3) {
      visemes.viseme_DD = normalizedMid * 0.3;
      visemes.viseme_nn = normalizedMid * 0.2;
      visemes.viseme_aa = Math.max(0, visemes.viseme_aa - 0.1);
      visemes.viseme_U = Math.max(0, visemes.viseme_O - 0.1);
    }

    // Fricatives (high frequency)
    if (normalizedHigh > 0.3) {
      visemes.viseme_SS = normalizedHigh * 0.3;
      visemes.viseme_FF = normalizedHigh * 0.2;
      visemes.viseme_aa = Math.max(0, visemes.viseme_aa - 0.1);
      visemes.viseme_U = Math.max(0, visemes.viseme_O - 0.1);
      visemes.viseme_DD = Math.max(0, visemes.viseme_DD - 0.1);
      visemes.viseme_nn = Math.max(0, visemes.viseme_nn - 0.1);
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
