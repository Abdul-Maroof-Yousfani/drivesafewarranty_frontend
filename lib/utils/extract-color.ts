/**
 * Utility to extract dominant colors from an image.
 * Uses Canvas API to sample pixels and find the most prominent colors.
 */

interface ColorResult {
  primary: string;   // Most dominant color (good for primary/text color)
  accent: string;    // Second most dominant color (or lighter variant if only one color)
}

interface ColorData {
  count: number;
  r: number;
  g: number;
  b: number;
}

/**
 * Calculate color distance between two RGB colors
 */
function colorDistance(c1: { r: number; g: number; b: number }, c2: { r: number; g: number; b: number }): number {
  return Math.sqrt(
    Math.pow(c1.r - c2.r, 2) +
    Math.pow(c1.g - c2.g, 2) +
    Math.pow(c1.b - c2.b, 2)
  );
}

/**
 * Extracts the two most dominant colors from an image file or URL.
 * Returns a promise with primary and accent hex color values.
 */
export async function extractDominantColor(imageSource: File | string): Promise<ColorResult> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    
    img.onload = () => {
      try {
        // Create a canvas to draw the image
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        
        if (!ctx) {
          resolve({ primary: "#0f172a", accent: "#f1f5f9" }); // Fallback
          return;
        }

        // Scale down for faster processing (max 100px on longest side)
        const maxSize = 100;
        const scale = Math.min(maxSize / img.width, maxSize / img.height, 1);
        canvas.width = Math.floor(img.width * scale);
        canvas.height = Math.floor(img.height * scale);
        
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // Get image data
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const pixels = imageData.data;
        
        // Color counting with bucketing (reduce color space for better grouping)
        const colorCounts: Map<string, ColorData> = new Map();
        
        for (let i = 0; i < pixels.length; i += 4) {
          const r = pixels[i];
          const g = pixels[i + 1];
          const b = pixels[i + 2];
          const a = pixels[i + 3];
          
          // Skip transparent or near-white/near-black pixels
          if (a < 128) continue; // Too transparent
          if (r > 240 && g > 240 && b > 240) continue; // Too white
          if (r < 15 && g < 15 && b < 15) continue; // Too black
          
          // Bucket the colors (reduce to ~4096 colors for grouping)
          const bucketR = Math.round(r / 16) * 16;
          const bucketG = Math.round(g / 16) * 16;
          const bucketB = Math.round(b / 16) * 16;
          
          const key = `${bucketR},${bucketG},${bucketB}`;
          const existing = colorCounts.get(key);
          
          if (existing) {
            existing.count++;
            // Keep running average for more accurate final color
            existing.r = (existing.r * (existing.count - 1) + r) / existing.count;
            existing.g = (existing.g * (existing.count - 1) + g) / existing.count;
            existing.b = (existing.b * (existing.count - 1) + b) / existing.count;
          } else {
            colorCounts.set(key, { count: 1, r, g, b });
          }
        }
        
        // Sort colors by count (descending)
        const sortedColors = Array.from(colorCounts.values())
          .sort((a, b) => b.count - a.count);
        
        // Find the most dominant color
        let primaryColor = { r: 15, g: 23, b: 42 }; // Default slate-900
        let secondaryColor: { r: number; g: number; b: number } | null = null;
        
        if (sortedColors.length > 0) {
          primaryColor = {
            r: sortedColors[0].r,
            g: sortedColors[0].g,
            b: sortedColors[0].b,
          };
          
          // Find the second most dominant color that is sufficiently different
          // (at least 80 distance in RGB space to ensure visual distinction)
          const minDistance = 80;
          for (let i = 1; i < sortedColors.length; i++) {
            const candidate = {
              r: sortedColors[i].r,
              g: sortedColors[i].g,
              b: sortedColors[i].b,
            };
            
            if (colorDistance(primaryColor, candidate) >= minDistance) {
              secondaryColor = candidate;
              break;
            }
          }
        }
        
        // Convert to hex
        const toHex = (c: number) => Math.round(c).toString(16).padStart(2, "0");
        const primaryHex = `#${toHex(primaryColor.r)}${toHex(primaryColor.g)}${toHex(primaryColor.b)}`;
        
        let accentHex: string;
        
        if (secondaryColor) {
          // Use the second dominant color as accent, but make it lighter (blend with white at 50%)
          const lightenFactor = 0.5; // 50% blend with white
          const accentR = Math.round(secondaryColor.r * (1 - lightenFactor) + 255 * lightenFactor);
          const accentG = Math.round(secondaryColor.g * (1 - lightenFactor) + 255 * lightenFactor);
          const accentB = Math.round(secondaryColor.b * (1 - lightenFactor) + 255 * lightenFactor);
          accentHex = `#${toHex(accentR)}${toHex(accentG)}${toHex(accentB)}`;
        } else {
          // Fallback: Create a lighter accent color (blend primary with white at 85%)
          const accentR = Math.round(primaryColor.r * 0.15 + 255 * 0.85);
          const accentG = Math.round(primaryColor.g * 0.15 + 255 * 0.85);
          const accentB = Math.round(primaryColor.b * 0.15 + 255 * 0.85);
          accentHex = `#${toHex(accentR)}${toHex(accentG)}${toHex(accentB)}`;
        }
        
        resolve({ primary: primaryHex, accent: accentHex });
      } catch (error) {
        console.error("Color extraction error:", error);
        resolve({ primary: "#0f172a", accent: "#f1f5f9" }); // Fallback
      }
    };
    
    img.onerror = () => {
      console.error("Failed to load image for color extraction");
      resolve({ primary: "#0f172a", accent: "#f1f5f9" }); // Fallback
    };
    
    // Load the image
    if (typeof imageSource === "string") {
      img.src = imageSource;
    } else {
      img.src = URL.createObjectURL(imageSource);
    }
  });
}
