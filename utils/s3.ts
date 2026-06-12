/**
 * utils/s3.ts
 * Drop-in replacement for utils/cloudinary.ts
 * All exported function signatures are intentionally identical.
 *
 * Upload flow (presigned URL):
 *   1. POST /api/s3/presigned-upload  → receives { presignedUrl, fileUrl }
 *   2. PUT file directly to presignedUrl (browser → S3, no server proxy)
 *   3. Returns fileUrl as the stored URL (same as cloudinary's secure_url)
 *
 * Delete flow:
 *   POST /api/s3/delete with { fileUrl } → server deletes the S3 object
 */

type FolderHint = 'hero' | 'packages' | 'testimonials' | 'uploads'

/**
 * Determine a sensible S3 folder from the file type or caller context.
 * Falls back to 'uploads' if unknown.
 */
function inferFolder(file: File): FolderHint {
  if (file.type.startsWith('video/')) return 'hero'
  return 'uploads'
}

/**
 * Upload a file to S3 via a presigned PUT URL.
 * Returns the public S3 URL of the uploaded file.
 */
export const uploadToS3 = async (
  file: File,
  folder: FolderHint = 'uploads'
): Promise<string> => {
  // Step 1: Get a presigned URL from the server
  const presignRes = await fetch('/api/s3/presigned-upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      filename: file.name,
      contentType: file.type,
      folder,
    }),
  })

  if (!presignRes.ok) {
    const err = await presignRes.json().catch(() => ({}))
    throw new Error(`Failed to get presigned URL: ${JSON.stringify(err)}`)
  }

  const { presignedUrl, fileUrl } = await presignRes.json()

  // Step 2: Upload the file directly to S3
  const uploadRes = await fetch(presignedUrl, {
    method: 'PUT',
    headers: { 'Content-Type': file.type },
    body: file,
  })

  if (!uploadRes.ok) {
    throw new Error(`S3 upload failed: ${uploadRes.status} ${uploadRes.statusText}`)
  }

  return fileUrl
}

/**
 * Delete a single file from S3 by its public URL.
 * Returns true on success, false on failure.
 */
export const deleteFromS3 = async (url: string): Promise<boolean> => {
  try {
    const response = await fetch('/api/s3/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileUrl: url }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('S3 delete API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData,
      })
      throw new Error(`Failed to delete from S3: ${response.status} ${response.statusText}`)
    }

    console.log('S3 delete success:', true)
    return true
  } catch (error) {
    console.error('Error deleting from S3:', error)
    return false
  }
}

/**
 * Delete multiple files from S3 in parallel.
 * Returns true if all deletions succeed, false if any fail.
 */
export const deleteMultipleFromS3 = async (urls: string[]): Promise<boolean> => {
  try {
    const deletePromises = urls.map((url) => deleteFromS3(url))
    await Promise.all(deletePromises)
    console.log('S3 batch delete success:', true)
    return true
  } catch (error) {
    console.error('Error deleting multiple files from S3:', error)
    return false
  }
}
