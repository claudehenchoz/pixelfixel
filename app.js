/**
 * PixelFixel - Main Application
 * Client-side pixel art fixing and palette application
 */

import { pixelDetect } from './pixelDetect.js';
import { quantizeImage, applyPalette, determineBestK } from './paletteApply.js';
import { getPalette } from './presets.js';

// Application state
let originalImage = null;
let fixedImageData = null;
let detectionInfo = null;

// UI Elements
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const openButton = document.getElementById('openButton');
const processingSection = document.getElementById('processingSection');
const originalCanvas = document.getElementById('originalCanvas');
const fixedCanvas = document.getElementById('fixedCanvas');
const paletteSelect = document.getElementById('paletteSelect');
const customColorGroup = document.getElementById('customColorGroup');
const colorSlider = document.getElementById('colorSlider');
const colorValue = document.getElementById('colorValue');
const downloadButton = document.getElementById('downloadButton');
const resetButton = document.getElementById('resetButton');
const originalSize = document.getElementById('originalSize');
const fixedSize = document.getElementById('fixedSize');
const detectionInfoEl = document.getElementById('detectionInfo');

// Canvas contexts
const originalCtx = originalCanvas.getContext('2d', { willReadFrequently: true });
const fixedCtx = fixedCanvas.getContext('2d', { willReadFrequently: true });

/**
 * Initialize event listeners
 */
function init() {
    // File input
    openButton.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', handleFileSelect);

    // Drag and drop
    dropZone.addEventListener('dragover', handleDragOver);
    dropZone.addEventListener('dragleave', handleDragLeave);
    dropZone.addEventListener('drop', handleDrop);

    // Paste
    document.addEventListener('paste', handlePaste);

    // Controls
    paletteSelect.addEventListener('change', handlePaletteChange);
    colorSlider.addEventListener('input', handleColorSliderChange);
    downloadButton.addEventListener('click', handleDownload);
    resetButton.addEventListener('click', handleReset);

    console.log('PixelFixel initialized');
}

/**
 * Handle drag over event
 */
function handleDragOver(e) {
    e.preventDefault();
    dropZone.classList.add('drag-over');
}

/**
 * Handle drag leave event
 */
function handleDragLeave(e) {
    e.preventDefault();
    dropZone.classList.remove('drag-over');
}

/**
 * Handle drop event
 */
function handleDrop(e) {
    e.preventDefault();
    dropZone.classList.remove('drag-over');

    const files = e.dataTransfer.files;
    if (files.length > 0) {
        loadImageFile(files[0]);
    }
}

/**
 * Handle file select
 */
function handleFileSelect(e) {
    const files = e.target.files;
    if (files.length > 0) {
        loadImageFile(files[0]);
    }
}

/**
 * Handle paste event
 */
function handlePaste(e) {
    const items = e.clipboardData.items;

    for (const item of items) {
        if (item.type.startsWith('image/')) {
            const file = item.getAsFile();
            loadImageFile(file);
            break;
        }
    }
}

/**
 * Load image from file
 */
function loadImageFile(file) {
    if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            originalImage = img;
            processImage();
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

/**
 * Process the loaded image
 */
function processImage() {
    if (!originalImage) return;

    // Show processing section
    processingSection.classList.remove('hidden');

    // Display original image
    originalCanvas.width = originalImage.width;
    originalCanvas.height = originalImage.height;
    originalCtx.drawImage(originalImage, 0, 0);
    originalSize.textContent = `(${originalImage.width}×${originalImage.height})`;

    // Get original image data
    const originalData = originalCtx.getImageData(0, 0, originalImage.width, originalImage.height);

    // Detect pixel scaling
    const startTime = performance.now();
    const result = pixelDetect(originalData);
    const detectTime = Math.round(performance.now() - startTime);

    fixedImageData = result.downscaled;
    detectionInfo = {
        hFactor: result.hFactor,
        vFactor: result.vFactor,
        detectTime
    };

    // Apply current palette settings
    applyCurrentPalette();
}

/**
 * Apply the currently selected palette to the fixed image
 */
function applyCurrentPalette() {
    if (!fixedImageData) return;

    const paletteType = paletteSelect.value;
    let processedData = fixedImageData;

    const startTime = performance.now();

    if (paletteType === 'none') {
        // Auto-detect optimal color count
        const optimalColors = determineBestK(fixedImageData, 32);
        processedData = quantizeImage(fixedImageData, optimalColors);
        console.log(`Auto-detected ${optimalColors} colors`);

    } else if (paletteType === 'custom') {
        // Use custom color count from slider
        const numColors = parseInt(colorSlider.value);
        processedData = quantizeImage(fixedImageData, numColors);

    } else {
        // Use preset palette
        const palette = getPalette(paletteType);
        if (palette) {
            processedData = applyPalette(fixedImageData, palette);
        }
    }

    const paletteTime = Math.round(performance.now() - startTime);

    // Display fixed image with integer upscaling
    displayFixedImage(processedData);

    // Update info
    const scaleFactor = Math.max(detectionInfo.hFactor, detectionInfo.vFactor);
    detectionInfoEl.textContent =
        `Detected ${scaleFactor.toFixed(1)}x upscaling | ` +
        `Pixel detection: ${detectionInfo.detectTime}ms | ` +
        `Palette: ${paletteTime}ms`;
}

/**
 * Display the fixed image with integer upscaling
 */
function displayFixedImage(imageData) {
    const { width, height } = imageData;

    // Set canvas to actual size
    fixedCanvas.width = width;
    fixedCanvas.height = height;

    // Draw the fixed image
    fixedCtx.putImageData(imageData, 0, 0);

    // Update size label
    fixedSize.textContent = `(${width}×${height})`;

    // Apply CSS scaling for better visibility (using pixelated rendering)
    const scale = Math.min(
        Math.floor(originalCanvas.width / width),
        Math.floor(originalCanvas.height / height),
        8 // Max scale
    );

    if (scale > 1) {
        fixedCanvas.style.width = `${width * scale}px`;
        fixedCanvas.style.height = `${height * scale}px`;
    } else {
        fixedCanvas.style.width = '';
        fixedCanvas.style.height = '';
    }
}

/**
 * Handle palette selection change
 */
function handlePaletteChange() {
    const paletteType = paletteSelect.value;

    if (paletteType === 'custom') {
        customColorGroup.classList.remove('hidden');
    } else {
        customColorGroup.classList.add('hidden');
    }

    if (fixedImageData) {
        applyCurrentPalette();
    }
}

/**
 * Handle color slider change
 */
function handleColorSliderChange() {
    const value = colorSlider.value;
    colorValue.textContent = value;

    if (fixedImageData) {
        // Debounce the update for performance
        clearTimeout(handleColorSliderChange.timeout);
        handleColorSliderChange.timeout = setTimeout(() => {
            applyCurrentPalette();
        }, 100);
    }
}

/**
 * Handle download button click
 */
function handleDownload() {
    if (!fixedCanvas) return;

    // Create a temporary canvas to export the actual pixel data
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = fixedCanvas.width;
    exportCanvas.height = fixedCanvas.height;
    const exportCtx = exportCanvas.getContext('2d');
    exportCtx.drawImage(fixedCanvas, 0, 0);

    // Download
    exportCanvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'pixelfixel-output.png';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });
}

/**
 * Handle reset button click
 */
function handleReset() {
    originalImage = null;
    fixedImageData = null;
    detectionInfo = null;

    processingSection.classList.add('hidden');
    fileInput.value = '';

    // Reset canvas styling
    fixedCanvas.style.width = '';
    fixedCanvas.style.height = '';

    // Reset palette selection
    paletteSelect.value = 'none';
    customColorGroup.classList.add('hidden');
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
