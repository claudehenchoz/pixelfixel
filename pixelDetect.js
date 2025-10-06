/**
 * Pixel detection and fixing algorithms
 * Ported from Python AI PixelFix script
 */

/**
 * Find peaks in an array of values
 * @param {Float32Array|Array} data - Array of values
 * @param {number} distance - Minimum distance between peaks
 * @param {number} height - Minimum peak height
 * @returns {Array<number>} Array of peak indices
 */
function findPeaks(data, distance = 1, height = 0.0) {
    const peaks = [];

    for (let i = 1; i < data.length - 1; i++) {
        // Check if this point is higher than its neighbors
        if (data[i] > data[i - 1] && data[i] > data[i + 1] && data[i] >= height) {
            // Check distance constraint
            if (peaks.length === 0 || i - peaks[peaks.length - 1] >= distance) {
                peaks.push(i);
            }
        }
    }

    return peaks;
}

/**
 * Calculate median of an array
 * @param {Array<number>} arr - Array of numbers
 * @returns {number} Median value
 */
function median(arr) {
    if (arr.length === 0) return 1;
    const sorted = [...arr].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0
        ? (sorted[mid - 1] + sorted[mid]) / 2
        : sorted[mid];
}

/**
 * Downscale image using k-means clustering on tiles
 * Finds the most common color in each tile
 * @param {ImageData} imageData - Source image data
 * @param {number} targetWidth - Target width
 * @param {number} targetHeight - Target height
 * @param {number} centroids - Number of color clusters per tile
 * @returns {ImageData} Downscaled image data
 */
export function kCentroid(imageData, targetWidth, targetHeight, centroids = 2) {
    const { data: srcData, width: srcWidth, height: srcHeight } = imageData;

    // Create output image data
    const outputData = new Uint8ClampedArray(targetWidth * targetHeight * 4);

    // Calculate scaling factors
    const wFactor = srcWidth / targetWidth;
    const hFactor = srcHeight / targetHeight;

    // Process each tile
    for (let ty = 0; ty < targetHeight; ty++) {
        for (let tx = 0; tx < targetWidth; tx++) {
            // Calculate tile bounds in source image
            const x1 = Math.floor(tx * wFactor);
            const y1 = Math.floor(ty * hFactor);
            const x2 = Math.min(Math.floor((tx + 1) * wFactor), srcWidth);
            const y2 = Math.min(Math.floor((ty + 1) * hFactor), srcHeight);

            // Extract colors from tile
            const tileColors = [];
            for (let y = y1; y < y2; y++) {
                for (let x = x1; x < x2; x++) {
                    const idx = (y * srcWidth + x) * 4;
                    tileColors.push([
                        srcData[idx],
                        srcData[idx + 1],
                        srcData[idx + 2]
                    ]);
                }
            }

            if (tileColors.length === 0) continue;

            // Simple k-means: find dominant color by clustering
            const dominantColor = findDominantColor(tileColors, centroids);

            // Set pixel in output
            const outIdx = (ty * targetWidth + tx) * 4;
            outputData[outIdx] = dominantColor[0];
            outputData[outIdx + 1] = dominantColor[1];
            outputData[outIdx + 2] = dominantColor[2];
            outputData[outIdx + 3] = 255;
        }
    }

    return new ImageData(outputData, targetWidth, targetHeight);
}

/**
 * Find the most dominant color in a set of colors using simplified k-means
 * @param {Array<Array<number>>} colors - Array of [r, g, b] colors
 * @param {number} k - Number of clusters
 * @returns {Array<number>} Dominant color [r, g, b]
 */
function findDominantColor(colors, k = 2) {
    if (colors.length === 0) return [0, 0, 0];
    if (colors.length === 1) return colors[0];

    // Initialize centroids with random colors from the set
    const centroids = [];
    const step = Math.floor(colors.length / k);
    for (let i = 0; i < k && i * step < colors.length; i++) {
        centroids.push([...colors[i * step]]);
    }

    // Run k-means iterations (limited to 5 for performance)
    const maxIterations = 5;
    for (let iter = 0; iter < maxIterations; iter++) {
        // Assign colors to nearest centroid
        const clusters = Array.from({ length: k }, () => []);

        for (const color of colors) {
            let minDist = Infinity;
            let nearestCluster = 0;

            for (let i = 0; i < centroids.length; i++) {
                const dist = colorDistance(color, centroids[i]);
                if (dist < minDist) {
                    minDist = dist;
                    nearestCluster = i;
                }
            }

            clusters[nearestCluster].push(color);
        }

        // Update centroids
        for (let i = 0; i < k; i++) {
            if (clusters[i].length > 0) {
                centroids[i] = averageColor(clusters[i]);
            }
        }
    }

    // Find the cluster with most colors
    const clusters = Array.from({ length: k }, () => []);
    for (const color of colors) {
        let minDist = Infinity;
        let nearestCluster = 0;

        for (let i = 0; i < centroids.length; i++) {
            const dist = colorDistance(color, centroids[i]);
            if (dist < minDist) {
                minDist = dist;
                nearestCluster = i;
            }
        }

        clusters[nearestCluster].push(color);
    }

    // Return centroid of largest cluster
    let largestCluster = 0;
    let maxSize = 0;
    for (let i = 0; i < k; i++) {
        if (clusters[i].length > maxSize) {
            maxSize = clusters[i].length;
            largestCluster = i;
        }
    }

    return centroids[largestCluster].map(v => Math.round(v));
}

/**
 * Calculate Euclidean distance between two colors
 * @param {Array<number>} c1 - First color [r, g, b]
 * @param {Array<number>} c2 - Second color [r, g, b]
 * @returns {number} Distance
 */
function colorDistance(c1, c2) {
    const dr = c1[0] - c2[0];
    const dg = c1[1] - c2[1];
    const db = c1[2] - c2[2];
    return Math.sqrt(dr * dr + dg * dg + db * db);
}

/**
 * Calculate average color from array of colors
 * @param {Array<Array<number>>} colors - Array of [r, g, b] colors
 * @returns {Array<number>} Average color [r, g, b]
 */
function averageColor(colors) {
    if (colors.length === 0) return [0, 0, 0];

    let sumR = 0, sumG = 0, sumB = 0;
    for (const [r, g, b] of colors) {
        sumR += r;
        sumG += g;
        sumB += b;
    }

    const n = colors.length;
    return [sumR / n, sumG / n, sumB / n];
}

/**
 * Detect pixel scaling factor in AI-generated pixel art
 * @param {ImageData} imageData - Source image data
 * @returns {{downscaled: ImageData, hFactor: number, vFactor: number}}
 *          Downscaled image and scaling factors
 */
export function pixelDetect(imageData) {
    const { data, width, height } = imageData;

    // Compute horizontal differences between pixels
    const hdiff = new Float32Array(width - 1);
    for (let x = 0; x < width - 1; x++) {
        let sum = 0;
        for (let y = 0; y < height; y++) {
            const idx1 = (y * width + x) * 4;
            const idx2 = (y * width + x + 1) * 4;

            const dr = data[idx1] - data[idx2];
            const dg = data[idx1 + 1] - data[idx2 + 1];
            const db = data[idx1 + 2] - data[idx2 + 2];

            sum += Math.sqrt(dr * dr + dg * dg + db * db);
        }
        hdiff[x] = sum;
    }

    // Compute vertical differences between pixels
    const vdiff = new Float32Array(height - 1);
    for (let y = 0; y < height - 1; y++) {
        let sum = 0;
        for (let x = 0; x < width; x++) {
            const idx1 = (y * width + x) * 4;
            const idx2 = ((y + 1) * width + x) * 4;

            const dr = data[idx1] - data[idx2];
            const dg = data[idx1 + 1] - data[idx2 + 1];
            const db = data[idx1 + 2] - data[idx2 + 2];

            sum += Math.sqrt(dr * dr + dg * dg + db * db);
        }
        vdiff[y] = sum;
    }

    // Find peaks in the differences
    const hPeaks = findPeaks(hdiff, 1, 0.0);
    const vPeaks = findPeaks(vdiff, 1, 0.0);

    // Compute spacing between peaks
    const hSpacing = [];
    for (let i = 1; i < hPeaks.length; i++) {
        hSpacing.push(hPeaks[i] - hPeaks[i - 1]);
    }

    const vSpacing = [];
    for (let i = 1; i < vPeaks.length; i++) {
        vSpacing.push(vPeaks[i] - vPeaks[i - 1]);
    }

    // Calculate median spacing
    const hMedian = median(hSpacing);
    const vMedian = median(vSpacing);

    // Calculate new dimensions
    const newWidth = Math.max(1, Math.round(width / hMedian));
    const newHeight = Math.max(1, Math.round(height / vMedian));

    // Downscale using kCentroid
    const downscaled = kCentroid(imageData, newWidth, newHeight, 2);

    return {
        downscaled,
        hFactor: hMedian,
        vFactor: vMedian
    };
}
