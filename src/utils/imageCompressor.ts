/**
 * Utilitário de Compressão e Otimização de Imagens para Campo
 * Reduz fotos de celulares (3MB - 15MB) para ~30KB - 60KB com excelente nitidez visual
 * Garante persistência instantânea no LocalStorage e envio ultrarrápido para MySQL/PHP
 */

export interface CompressedImageResult {
  dataUrl: string;
  originalSizeKb: number;
  compressedSizeKb: number;
  width: number;
  height: number;
}

/**
 * Comprime um arquivo de imagem (File/Blob) via Canvas HTML5
 */
export async function compressImageFile(
  file: File | Blob,
  maxDimension = 800,
  quality = 0.70
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(new Error('Erro ao ler o arquivo de imagem'));

    reader.onload = (event) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Erro ao decodificar a imagem'));

      img.onload = () => {
        try {
          let { width, height } = img;

          // Redimensionamento proporcional respeitando a proporção de aspecto
          if (width > height) {
            if (width > maxDimension) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            }
          } else {
            if (height > maxDimension) {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = Math.max(1, width);
          canvas.height = Math.max(1, height);

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(event.target?.result as string);
            return;
          }

          // Qualidade de renderização suave
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';

          // Desenha no canvas redimensionado
          ctx.drawImage(img, 0, 0, width, height);

          // Exporta como JPEG otimizado
          const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(compressedDataUrl);
        } catch {
          // Fallback se o canvas falhar
          resolve(event.target?.result as string);
        }
      };

      img.src = event.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Comprime uma string base64 / dataURL existente se for muito pesada
 */
export async function compressBase64IfNeeded(
  dataUrl: string,
  maxDimension = 800,
  quality = 0.70
): Promise<string> {
  if (!dataUrl || !dataUrl.startsWith('data:image')) {
    return dataUrl; // URL externa ou formato já tratado
  }

  // Se já tiver tamanho inferior a 45KB (~60.000 caracteres base64), não precisa recomprimir
  if (dataUrl.length < 60000) {
    return dataUrl;
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      try {
        let { width, height } = img;
        if (width > height) {
          if (width > maxDimension) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, width);
        canvas.height = Math.max(1, height);
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(dataUrl);
          return;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        const compressed = canvas.toDataURL('image/jpeg', quality);
        resolve(compressed);
      } catch {
        resolve(dataUrl);
      }
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}
