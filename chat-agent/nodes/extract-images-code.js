// ========================================
// EXTRACT IMAGES - CHAT MODE v2
// Supports both n8n Chat file uploads and Discourse posts
// Now captures binary field names (data0, data1, etc.)
// ========================================

const inputData = $input.all();
const results = [];

for (const item of inputData) {
  const imageUrls = [];
  const imageFiles = [];
  let hasImages = false;

  // ========================================
  // MODE 1: n8n Chat File Uploads
  // Files come as array with metadata
  // Binary data is in $binary.data0, data1, etc.
  // ========================================
  const chatFiles = item.json?.files || [];
  const binaryData = item.binary || {};
  const binaryKeys = Object.keys(binaryData);

  if (chatFiles.length > 0) {
    for (let i = 0; i < chatFiles.length; i++) {
      const file = chatFiles[i];

      // Check if it's an image file
      const isImage = file.fileType === 'image' ||
                      file.mimeType?.startsWith('image/') ||
                      /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(file.fileName || '');

      if (isImage) {
        // Binary field name is typically data0, data1, etc.
        const binaryFieldName = `data${i}`;
        const hasBinaryData = !!binaryData[binaryFieldName];

        imageFiles.push({
          fileName: file.fileName || 'unknown',
          fileSize: file.fileSize || 'unknown',
          fileExtension: file.fileExtension || file.fileName?.split('.').pop() || 'unknown',
          fileType: file.fileType || 'image',
          mimeType: file.mimeType || 'image/unknown',
          // Binary field reference for Analyze Image node
          binaryPropertyName: binaryFieldName,
          hasBinaryData: hasBinaryData,
          index: i
        });
        hasImages = true;
      }
    }
  }

  // Also check if there are binary images without file metadata
  if (binaryKeys.length > 0 && imageFiles.length === 0) {
    for (const key of binaryKeys) {
      const binData = binaryData[key];
      if (binData?.mimeType?.startsWith('image/')) {
        imageFiles.push({
          fileName: binData.fileName || key,
          fileSize: binData.fileSize || 'unknown',
          fileExtension: binData.fileExtension || 'unknown',
          fileType: 'image',
          mimeType: binData.mimeType,
          binaryPropertyName: key,
          hasBinaryData: true,
          index: imageFiles.length
        });
        hasImages = true;
      }
    }
  }

  // ========================================
  // MODE 2: Discourse Forum Posts (Legacy)
  // Images embedded in HTML cooked content
  // ========================================
  const cookedHtml = item.json?.body?.post?.cooked || '';

  if (cookedHtml) {
    const imgRegex = /<img[^>]+src=["']([^"']+)["']/gi;

    let match;
    while ((match = imgRegex.exec(cookedHtml)) !== null) {
      const url = match[1];

      // Filter out emojis
      const isEmoji = url.includes('emoji.discourse-cdn.com') ||
                      url.includes('/emoji/') ||
                      url.includes('facebook_messenger');

      // Only valid images (PNG, JPG, GIF, WEBP) and NOT emojis
      if (/\.(png|jpe?g|gif|webp)(\?|$)/i.test(url) && !isEmoji) {
        const fullUrl = url.startsWith('http')
          ? url
          : 'https://forum.finsweet.com' + url;

        imageUrls.push(fullUrl);
        hasImages = true;
      }
    }
  }

  // ========================================
  // Build Result
  // ========================================
  results.push({
    json: {
      ...item.json,
      extractedImages: {
        // Total count from both sources
        count: imageFiles.length + imageUrls.length,

        // Chat mode: file metadata with binary field names
        files: imageFiles,
        hasFileUploads: imageFiles.length > 0,

        // List of binary field names for easy access
        binaryFields: imageFiles.map(f => f.binaryPropertyName),

        // Discourse mode: URLs extracted from HTML
        urls: imageUrls,
        hasEmbeddedImages: imageUrls.length > 0,

        // Combined flag
        hasImages: hasImages,

        // Source indicator
        source: imageFiles.length > 0 ? 'chat_upload' : (imageUrls.length > 0 ? 'discourse_embedded' : 'none')
      }
    },
    // IMPORTANT: Pass binary data through
    binary: item.binary
  });
}

return results;
