/**
 * Color palette application and quantization
 * Ported from Python AI PixelFix script
 */

/**
 * Quantize image to a specific number of colors using median cut algorithm
 * @param {ImageData} imageData - Source image data
 * @param {number} numColors - Target number of colors
 * @returns {ImageData} Quantized image data
 */
export function quantizeImage(imageData, numColors) {
    const { data, width, height } = imageData;

    // Extract all unique colors
    const pixels = [];
    for (let i = 0; i < data.length; i += 4) {
        pixels.push([data[i], data[i + 1], data[i + 2]]);
    }

    // Build palette using median cut
    const palette = medianCut(pixels, numColors);

    // Map each pixel to nearest palette color
    const outputData = new Uint8ClampedArray(data.length);

    for (let i = 0; i < data.length; i += 4) {
        const color = [data[i], data[i + 1], data[i + 2]];
        const nearest = findNearestColor(color, palette);

        outputData[i] = nearest[0];
        outputData[i + 1] = nearest[1];
        outputData[i + 2] = nearest[2];
        outputData[i + 3] = data[i + 3]; // Preserve alpha
    }

    return new ImageData(outputData, width, height);
}

/**
 * Median cut algorithm for color quantization
 * @param {Array<Array<number>>} pixels - Array of [r, g, b] pixels
 * @param {number} numColors - Target number of colors
 * @returns {Array<Array<number>>} Palette of [r, g, b] colors
 */
function medianCut(pixels, numColors) {
    // Start with all pixels in one bucket
    const buckets = [pixels];

    // Split buckets until we have enough colors
    while (buckets.length < numColors) {
        // Find bucket with largest range
        let largestBucket = null;
        let largestRange = -1;
        let largestChannel = 0;

        for (const bucket of buckets) {
            const ranges = getColorRanges(bucket);
            const maxRange = Math.max(...ranges);
            const channel = ranges.indexOf(maxRange);

            if (maxRange > largestRange) {
                largestRange = maxRange;
                largestBucket = bucket;
                largestChannel = channel;
            }
        }

        if (!largestBucket || largestBucket.length < 2) break;

        // Split the bucket at median along the largest channel
        const sorted = [...largestBucket].sort((a, b) => a[largestChannel] - b[largestChannel]);
        const mid = Math.floor(sorted.length / 2);

        const bucket1 = sorted.slice(0, mid);
        const bucket2 = sorted.slice(mid);

        // Replace the bucket with two new buckets
        const idx = buckets.indexOf(largestBucket);
        buckets.splice(idx, 1, bucket1, bucket2);
    }

    // Calculate average color for each bucket
    return buckets.map(bucket => {
        let sumR = 0, sumG = 0, sumB = 0;
        for (const [r, g, b] of bucket) {
            sumR += r;
            sumG += g;
            sumB += b;
        }
        const n = bucket.length;
        return [
            Math.round(sumR / n),
            Math.round(sumG / n),
            Math.round(sumB / n)
        ];
    });
}

/**
 * Get the range of values for each color channel
 * @param {Array<Array<number>>} pixels - Array of [r, g, b] pixels
 * @returns {Array<number>} Ranges for [r, g, b]
 */
function getColorRanges(pixels) {
    if (pixels.length === 0) return [0, 0, 0];

    let minR = 255, maxR = 0;
    let minG = 255, maxG = 0;
    let minB = 255, maxB = 0;

    for (const [r, g, b] of pixels) {
        minR = Math.min(minR, r);
        maxR = Math.max(maxR, r);
        minG = Math.min(minG, g);
        maxG = Math.max(maxG, g);
        minB = Math.min(minB, b);
        maxB = Math.max(maxB, b);
    }

    return [maxR - minR, maxG - minG, maxB - minB];
}

/**
 * Find nearest color in palette to a given color
 * @param {Array<number>} color - [r, g, b] color
 * @param {Array<Array<number>>} palette - Array of [r, g, b] colors
 * @returns {Array<number>} Nearest color [r, g, b]
 */
function findNearestColor(color, palette) {
    let minDist = Infinity;
    let nearest = palette[0];

    for (const paletteColor of palette) {
        const dr = color[0] - paletteColor[0];
        const dg = color[1] - paletteColor[1];
        const db = color[2] - paletteColor[2];
        const dist = dr * dr + dg * dg + db * db;

        if (dist < minDist) {
            minDist = dist;
            nearest = paletteColor;
        }
    }

    return nearest;
}

/**
 * Apply a specific palette to an image
 * @param {ImageData} imageData - Source image data
 * @param {Array<Array<number>>} palette - Array of [r, g, b] colors
 * @returns {ImageData} Image with palette applied
 */
export function applyPalette(imageData, palette) {
    const { data, width, height } = imageData;
    const outputData = new Uint8ClampedArray(data.length);

    for (let i = 0; i < data.length; i += 4) {
        const color = [data[i], data[i + 1], data[i + 2]];
        const nearest = findNearestColor(color, palette);

        outputData[i] = nearest[0];
        outputData[i + 1] = nearest[1];
        outputData[i + 2] = nearest[2];
        outputData[i + 3] = data[i + 3]; // Preserve alpha
    }

    return new ImageData(outputData, width, height);
}

/**
 * Automatically determine optimal number of colors using elbow method
 * @param {ImageData} imageData - Source image data
 * @param {number} maxK - Maximum number of colors to test
 * @returns {number} Optimal number of colors
 */
export function determineBestK(imageData, maxK = 32) {
    const { data } = imageData;

    // Sample pixels for performance (use every 4th pixel)
    const pixels = [];
    for (let i = 0; i < data.length; i += 16) {
        pixels.push([data[i], data[i + 1], data[i + 2]]);
    }

    if (pixels.length === 0) return 2;

    // Calculate distortions for different k values
    const distortions = [];

    for (let k = 1; k <= Math.min(maxK, 32); k++) {
        const palette = medianCut(pixels, k);

        // Calculate total distortion
        let totalDist = 0;
        for (const pixel of pixels) {
            const nearest = findNearestColor(pixel, palette);
            const dr = pixel[0] - nearest[0];
            const dg = pixel[1] - nearest[1];
            const db = pixel[2] - nearest[2];
            totalDist += dr * dr + dg * dg + db * db;
        }

        distortions.push(totalDist);
    }

    // Calculate rate of change
    const rateOfChange = [];
    for (let i = 1; i < distortions.length; i++) {
        const rate = (distortions[i - 1] - distortions[i]) / distortions[i - 1];
        rateOfChange.push(rate);
    }

    if (rateOfChange.length === 0) return 2;

    // Find elbow point (largest rate of change drop)
    let elbowIndex = 0;
    let maxDrop = -Infinity;

    for (let i = 1; i < rateOfChange.length; i++) {
        const drop = rateOfChange[i - 1] - rateOfChange[i];
        if (drop > maxDrop) {
            maxDrop = drop;
            elbowIndex = i;
        }
    }

    // Return k at elbow point (add 2 because we start at k=1 and need offset)
    return Math.max(2, Math.min(elbowIndex + 2, maxK));
}

/**
 * Get all unique colors from an image
 * @param {ImageData} imageData - Source image data
 * @returns {Array<Array<number>>} Array of unique [r, g, b] colors
 */
export function getUniqueColors(imageData) {
    const { data } = imageData;
    const colorSet = new Set();

    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        colorSet.add(`${r},${g},${b}`);
    }

    return Array.from(colorSet).map(str => {
        const [r, g, b] = str.split(',').map(Number);
        return [r, g, b];
    });
}
