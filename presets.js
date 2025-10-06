/**
 * Predefined color palettes for pixel art
 * Common retro gaming and pixel art palettes
 */

export const PALETTES = {
    pico8: {
        name: 'PICO-8',
        colors: [
            [0, 0, 0],       // Black
            [29, 43, 83],    // Dark Blue
            [126, 37, 83],   // Dark Purple
            [0, 135, 81],    // Dark Green
            [171, 82, 54],   // Brown
            [95, 87, 79],    // Dark Gray
            [194, 195, 199], // Light Gray
            [255, 241, 232], // White
            [255, 0, 77],    // Red
            [255, 163, 0],   // Orange
            [255, 236, 39],  // Yellow
            [0, 228, 54],    // Green
            [41, 173, 255],  // Blue
            [131, 118, 156], // Indigo
            [255, 119, 168], // Pink
            [255, 204, 170]  // Peach
        ]
    },

    gameboy: {
        name: 'Game Boy',
        colors: [
            [15, 56, 15],    // Darkest Green
            [48, 98, 48],    // Dark Green
            [139, 172, 15],  // Light Green
            [155, 188, 15]   // Lightest Green
        ]
    },

    nes: {
        name: 'NES NTSC',
        colors: [
            [101, 101, 101], [0, 45, 105], [19, 31, 127], [60, 19, 124],
            [96, 11, 98], [115, 10, 55], [113, 15, 7], [90, 26, 0],
            [52, 40, 0], [11, 52, 0], [0, 60, 0], [0, 61, 16],
            [0, 56, 64], [0, 0, 0], [0, 0, 0], [0, 0, 0],
            [174, 174, 174], [15, 99, 179], [64, 81, 208], [120, 65, 204],
            [167, 54, 169], [192, 52, 112], [189, 60, 48], [159, 74, 0],
            [109, 92, 0], [54, 109, 0], [7, 119, 4], [0, 121, 61],
            [0, 114, 125], [0, 0, 0], [0, 0, 0], [0, 0, 0],
            [254, 254, 255], [93, 179, 255], [143, 161, 255], [200, 144, 255],
            [247, 133, 250], [255, 131, 192], [255, 139, 127], [239, 154, 73],
            [189, 172, 44], [133, 188, 47], [85, 199, 83], [60, 201, 140],
            [62, 194, 205], [78, 78, 78], [0, 0, 0], [0, 0, 0],
            [254, 254, 255], [188, 223, 255], [209, 216, 255], [232, 209, 255],
            [251, 205, 253], [255, 204, 229], [255, 207, 202], [248, 213, 180],
            [228, 220, 168], [204, 227, 169], [185, 232, 184], [174, 232, 208],
            [175, 229, 234], [182, 182, 182], [0, 0, 0], [0, 0, 0]
        ]
    },

    commodore64: {
        name: 'Commodore 64',
        colors: [
            [0, 0, 0],       // Black
            [255, 255, 255], // White
            [136, 0, 0],     // Red
            [170, 255, 238], // Cyan
            [204, 68, 204],  // Purple
            [0, 204, 85],    // Green
            [0, 0, 170],     // Blue
            [238, 238, 119], // Yellow
            [221, 136, 85],  // Orange
            [102, 68, 0],    // Brown
            [255, 119, 119], // Light Red
            [51, 51, 51],    // Dark Gray
            [119, 119, 119], // Gray
            [170, 255, 102], // Light Green
            [0, 136, 255],   // Light Blue
            [187, 187, 187]  // Light Gray
        ]
    },

    cga: {
        name: 'CGA',
        colors: [
            [0, 0, 0],       // Black
            [0, 0, 170],     // Blue
            [0, 170, 0],     // Green
            [0, 170, 170],   // Cyan
            [170, 0, 0],     // Red
            [170, 0, 170],   // Magenta
            [170, 85, 0],    // Brown
            [170, 170, 170], // Light Gray
            [85, 85, 85],    // Dark Gray
            [85, 85, 255],   // Light Blue
            [85, 255, 85],   // Light Green
            [85, 255, 255],  // Light Cyan
            [255, 85, 85],   // Light Red
            [255, 85, 255],  // Light Magenta
            [255, 255, 85],  // Yellow
            [255, 255, 255]  // White
        ]
    },

    // Additional popular palettes
    ega: {
        name: 'EGA',
        colors: [
            [0, 0, 0], [0, 0, 170], [0, 170, 0], [0, 170, 170],
            [170, 0, 0], [170, 0, 170], [170, 85, 0], [170, 170, 170],
            [85, 85, 85], [85, 85, 255], [85, 255, 85], [85, 255, 255],
            [255, 85, 85], [255, 85, 255], [255, 255, 85], [255, 255, 255]
        ]
    },

    grayscale4: {
        name: 'Grayscale 4',
        colors: [
            [0, 0, 0],
            [85, 85, 85],
            [170, 170, 170],
            [255, 255, 255]
        ]
    },

    arcade: {
        name: 'Arcade',
        colors: [
            [0, 0, 0], [255, 255, 255], [255, 0, 0], [0, 255, 0],
            [0, 0, 255], [255, 255, 0], [255, 0, 255], [0, 255, 255],
            [128, 0, 0], [0, 128, 0], [0, 0, 128], [128, 128, 0],
            [128, 0, 128], [0, 128, 128], [128, 128, 128], [192, 192, 192]
        ]
    },

    gameboy_green: {
        name: 'Game Boy (Original)',
        colors: [
            [8, 24, 32],
            [52, 104, 86],
            [136, 192, 112],
            [224, 248, 208]
        ]
    },

    sweetie16: {
        name: 'Sweetie 16',
        colors: [
            [26, 28, 44], [93, 39, 93], [177, 62, 83], [239, 125, 87],
            [255, 205, 117], [167, 240, 112], [56, 183, 100], [37, 113, 121],
            [41, 54, 111], [59, 93, 201], [65, 166, 246], [115, 239, 247],
            [244, 244, 244], [148, 176, 194], [86, 108, 134], [51, 60, 87]
        ]
    }
};

/**
 * Get palette by name
 * @param {string} name - Palette name
 * @returns {Array<Array<number>>|null} Palette colors or null
 */
export function getPalette(name) {
    return PALETTES[name]?.colors || null;
}

/**
 * Get all palette names
 * @returns {Array<{key: string, name: string, colorCount: number}>}
 */
export function getAllPaletteInfo() {
    return Object.entries(PALETTES).map(([key, palette]) => ({
        key,
        name: palette.name,
        colorCount: palette.colors.length
    }));
}
