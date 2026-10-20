"use client";

const MAX_LONG_SIDE = 1568;
const JPEG_QUALITY = 0.8;

/**
 * Canvas を使って長辺 1568px に縮小し、JPEG base64（ヘッダなし）で返す
 */
export async function resizeAndEncodeImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      const { width, height } = img;
      let newWidth = width;
      let newHeight = height;

      const longSide = Math.max(width, height);
      if (longSide > MAX_LONG_SIDE) {
        const scale = MAX_LONG_SIDE / longSide;
        newWidth = Math.round(width * scale);
        newHeight = Math.round(height * scale);
      }

      const canvas = document.createElement("canvas");
      canvas.width = newWidth;
      canvas.height = newHeight;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas context を取得できませんでした"));
        return;
      }

      ctx.drawImage(img, 0, 0, newWidth, newHeight);

      const dataUrl = canvas.toDataURL("image/jpeg", JPEG_QUALITY);
      // "data:image/jpeg;base64," プレフィックスを除去
      const base64 = dataUrl.split(",")[1];
      resolve(base64);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("画像の読み込みに失敗しました"));
    };

    img.src = url;
  });
}
