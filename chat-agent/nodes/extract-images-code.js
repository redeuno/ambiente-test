// ========================================
// EXTRACT IMAGES - CHAT MODE
// Supports both n8n Chat file uploads and Discourse posts
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
  // ========================================
  const chatFiles = item.json?.files || [];

  if (chatFiles.length > 0) {
    for (const file of chatFiles) {
      // Check if it's an image file
      const isImage = file.fileType === 'image' ||
                      file.mimeType?.startsWith('image/') ||
                      /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(file.fileName || '');

      if (isImage) {
        imageFiles.push({
          fileName: file.fileName || 'unknown',
          fileSize: file.fileSize || 'unknown',
          fileExtension: file.fileExtension || file.fileName?.split('.').pop() || 'unknown',
          fileType: file.fileType || 'image',
          mimeType: file.mimeType || 'image/unknown',
          // n8n chat stores file data differently - check for data or url
          data: file.data || null,
          url: file.url || null,
          binaryPropertyName: file.binaryPropertyName || null
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

        // Chat mode: file metadata
        files: imageFiles,
        hasFileUploads: imageFiles.length > 0,

        // Discourse mode: URLs extracted from HTML
        urls: imageUrls,
        hasEmbeddedImages: imageUrls.length > 0,

        // Combined flag
        hasImages: hasImages,

        // Source indicator
        source: imageFiles.length > 0 ? 'chat_upload' : (imageUrls.length > 0 ? 'discourse_embedded' : 'none')
      }
    }
  });
}

return results;
