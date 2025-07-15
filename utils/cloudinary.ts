export const uploadToCloudinary = async (file: File): Promise<string> => {
  const formData = new FormData()
  formData.append("file", file)
  formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!)

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/auto/upload`,
    {
      method: "POST",
      body: formData,
    },
  )

  const data = await response.json()
  return data.secure_url
}

// Extract public ID from Cloudinary URL
export const extractPublicIdFromUrl = (url: string): string | null => {
  try {
    // Cloudinary URL format: https://res.cloudinary.com/cloud_name/image/upload/v1234567890/folder/filename.jpg
    const urlParts = url.split('/')
    const uploadIndex = urlParts.findIndex(part => part === 'upload')
    
    if (uploadIndex === -1) return null
    
    // Get everything after 'upload' and before the file extension
    const pathAfterUpload = urlParts.slice(uploadIndex + 2).join('/')
    const publicId = pathAfterUpload.split('.')[0] // Remove file extension
    
    return publicId
  } catch (error) {
    console.error('Error extracting public ID from URL:', error)
    return null
  }
}

// Delete image from Cloudinary
export const deleteFromCloudinary = async (url: string): Promise<boolean> => {
  try {
    const publicId = extractPublicIdFromUrl(url)
    
    if (!publicId) {
      console.warn('Could not extract public ID from URL:', url)
      return false
    }

    const formData = new FormData()
    formData.append("public_id", publicId)
    formData.append("api_key", process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY!)
    formData.append("timestamp", Math.round(new Date().getTime() / 1000).toString())
    
    // Generate signature (you'll need to implement this on the server side for security)
    // For now, we'll use a server-side API route
    
    const response = await fetch('/api/cloudinary/delete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ publicId }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('Cloudinary delete API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      })
      throw new Error(`Failed to delete from Cloudinary: ${response.status} ${response.statusText}`)
    }
    console.log('Cloudinary delete success:', true);
    return true
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error)
    return false
  }
}

// Delete multiple images from Cloudinary
export const deleteMultipleFromCloudinary = async (urls: string[]): Promise<boolean> => {
  try {
    const deletePromises = urls.map(url => deleteFromCloudinary(url))
    await Promise.all(deletePromises)
    console.log("Cloudinary delete success:", true)
    return true
  } catch (error) {
    console.error('Error deleting multiple images from Cloudinary:', error)
    return false
  }
}
