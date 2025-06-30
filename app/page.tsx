"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { PageHeader } from "@/components/ui/page-header"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/utils/supabase/client"
import { uploadToCloudinary } from "@/utils/cloudinary"
import { HeroCarousel } from "@/components/hero-carousel"
import { BulkUpload } from "@/components/bulk-upload"
import { Trash2, Plus } from "lucide-react"
import { Input } from "@/components/ui/input"
import Image from "next/image"

interface HeroMedia {
  id: string
  url: string
  type: "image" | "video"
  is_active: boolean
  carousel_order: number
}

export default function HeroPage() {
  const [heroMedia, setHeroMedia] = useState<HeroMedia[]>([])
  const [activeMedia, setActiveMedia] = useState<HeroMedia[]>([])
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(true)
  const [replacingId, setReplacingId] = useState<string | null>(null)
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    fetchHeroMedia()
  }, [])

  const fetchHeroMedia = async () => {
    try {
      const { data, error } = await supabase.from("hero_media").select("*").order("carousel_order", { ascending: true })

      if (error) throw error

      const allMedia = data || []
      setHeroMedia(allMedia)
      setActiveMedia(allMedia.filter((media) => media.is_active))
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch hero media",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleBulkUpload = async (files: File[]) => {
    setUploading(true)
    try {
      const uploadPromises = files.map(async (file) => {
        const url = await uploadToCloudinary(file)
        const type = file.type.startsWith("video/") ? "video" : "image"
        return { url, type }
      })

      const uploadedMedia = await Promise.all(uploadPromises)

      const mediaData = uploadedMedia.map((media, index) => ({
        url: media.url,
        type: media.type,
        is_active: false,
        carousel_order: 0,
      }))

      const { error } = await supabase.from("hero_media").insert(mediaData)

      if (error) throw error

      toast({
        title: "Success",
        description: `${files.length} files uploaded successfully`,
      })
      fetchHeroMedia()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload some files",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  const handleSingleFileReplace = async (event: React.ChangeEvent<HTMLInputElement>, mediaId: string) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const url = await uploadToCloudinary(file)
      const type = file.type.startsWith("video/") ? "video" : "image"

      const { error } = await supabase.from("hero_media").update({ url, type }).eq("id", mediaId)

      if (error) throw error

      toast({
        title: "Success",
        description: "Media replaced successfully",
      })
      fetchHeroMedia()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to replace media",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
      setReplacingId(null)
    }
  }

  const addToCarousel = async (id: string) => {
    try {
      const nextOrder = activeMedia.length > 0 ? Math.max(...activeMedia.map((m) => m.carousel_order)) + 1 : 1

      const { error } = await supabase
        .from("hero_media")
        .update({ is_active: true, carousel_order: nextOrder })
        .eq("id", id)

      if (error) throw error

      toast({
        title: "Success",
        description: "Media added to carousel",
      })
      fetchHeroMedia()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add media to carousel",
        variant: "destructive",
      })
    }
  }

  const removeFromCarousel = async (id: string) => {
    try {
      const { error } = await supabase.from("hero_media").update({ is_active: false, carousel_order: 0 }).eq("id", id)

      if (error) throw error

      // Reorder remaining carousel items
      const remainingActive = activeMedia.filter((m) => m.id !== id)
      const updatePromises = remainingActive.map((media, index) =>
        supabase
          .from("hero_media")
          .update({ carousel_order: index + 1 })
          .eq("id", media.id),
      )

      await Promise.all(updatePromises)

      toast({
        title: "Success",
        description: "Media removed from carousel",
      })
      fetchHeroMedia()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove media from carousel",
        variant: "destructive",
      })
    }
  }

  const deleteMedia = async (id: string) => {
    try {
      const { error } = await supabase.from("hero_media").delete().eq("id", id)

      if (error) throw error

      toast({
        title: "Success",
        description: "Media deleted successfully",
      })
      fetchHeroMedia()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete media",
        variant: "destructive",
      })
    }
  }

  const handleReplaceMedia = (id: string) => {
    setReplacingId(id)
    // Trigger file input
    const input = document.getElementById(`replace-${id}`) as HTMLInputElement
    input?.click()
  }

  if (loading) {
    return (
      <div className="flex-1">
        <PageHeader title="Hero Section" description="Manage hero carousel images and videos" />
        <div className="p-6">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    )
  }

  const inactiveMedia = heroMedia.filter((media) => !media.is_active)

  return (
    <div className="flex-1">
      <PageHeader title="Hero Section" description="Manage hero carousel images and videos" />
      <div className="p-6 space-y-6">
        {/* Active Carousel Preview */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Active Carousel ({activeMedia.length} items)</h2>
          <HeroCarousel activeMedia={activeMedia} onRemove={removeFromCarousel} onReplace={handleReplaceMedia} />
        </div>

        {/* Bulk Upload */}
        <BulkUpload onUpload={handleBulkUpload} uploading={uploading} />

        {/* Media Library */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Media Library</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {inactiveMedia.map((media) => (
              <Card key={media.id}>
                <CardContent className="p-4">
                  <div className="aspect-video relative mb-4 bg-gray-100 rounded-lg overflow-hidden">
                    {media.type === "image" ? (
                      <Image src={media.url || "/placeholder.svg"} alt="Hero media" fill className="object-cover" />
                    ) : (
                      <video src={media.url} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => addToCarousel(media.id)} className="flex-1">
                      <Plus className="h-4 w-4 mr-1" />
                      Add to Carousel
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => deleteMedia(media.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {inactiveMedia.length === 0 && heroMedia.length > 0 && (
            <div className="text-center py-8 text-gray-500">All media items are currently active in the carousel.</div>
          )}

          {heroMedia.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No media uploaded yet. Use the bulk upload above to add your first images or videos.
            </div>
          )}
        </div>

        {/* Hidden file inputs for replacement */}
        {activeMedia.map((media) => (
          <Input
            key={`replace-${media.id}`}
            id={`replace-${media.id}`}
            type="file"
            accept="image/*,video/*"
            onChange={(e) => handleSingleFileReplace(e, media.id)}
            className="hidden"
          />
        ))}
      </div>
    </div>
  )
}
