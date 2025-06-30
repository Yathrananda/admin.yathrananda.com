"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PageHeader } from "@/components/ui/page-header"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/utils/supabase/client"
import { uploadToCloudinary } from "@/utils/cloudinary"
import { Trash2, Upload } from "lucide-react"
import Image from "next/image"

interface HeroMedia {
  id: string
  url: string
  type: "image" | "video"
  is_active: boolean
}

export default function HeroPage() {
  const [heroMedia, setHeroMedia] = useState<HeroMedia[]>([])
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    fetchHeroMedia()
  }, [])

  const fetchHeroMedia = async () => {
    try {
      const { data, error } = await supabase.from("hero_media").select("*").order("created_at", { ascending: false })

      if (error) throw error
      setHeroMedia(data || [])
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

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const url = await uploadToCloudinary(file)
      const type = file.type.startsWith("video/") ? "video" : "image"

      const { error } = await supabase.from("hero_media").insert([{ url, type, is_active: false }])

      if (error) throw error

      toast({
        title: "Success",
        description: "Media uploaded successfully",
      })
      fetchHeroMedia()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload media",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  const toggleActive = async (id: string, currentActive: boolean) => {
    try {
      // First, set all media to inactive
      await supabase.from("hero_media").update({ is_active: false }).neq("id", "00000000-0000-0000-0000-000000000000")

      // Then set the selected one to active (if it wasn't already active)
      if (!currentActive) {
        await supabase.from("hero_media").update({ is_active: true }).eq("id", id)
      }

      toast({
        title: "Success",
        description: currentActive ? "Media deactivated" : "Media activated",
      })
      fetchHeroMedia()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update media status",
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

  if (loading) {
    return (
      <div className="flex-1">
        <PageHeader title="Hero Section" description="Manage hero images and videos" />
        <div className="p-6">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1">
      <PageHeader title="Hero Section" description="Manage hero images and videos" />
      <div className="p-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Upload New Media</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="media-upload">Choose Image or Video</Label>
                <Input
                  id="media-upload"
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileUpload}
                  disabled={uploading}
                />
              </div>
              {uploading && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Upload className="h-4 w-4 animate-spin" />
                  Uploading...
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {heroMedia.map((media) => (
            <Card key={media.id} className={media.is_active ? "ring-2 ring-blue-500" : ""}>
              <CardContent className="p-4">
                <div className="aspect-video relative mb-4 bg-gray-100 rounded-lg overflow-hidden">
                  {media.type === "image" ? (
                    <Image src={media.url || "/placeholder.svg"} alt="Hero media" fill className="object-cover" />
                  ) : (
                    <video src={media.url} className="w-full h-full object-cover" controls />
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={media.is_active ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleActive(media.id, media.is_active)}
                    className="flex-1"
                  >
                    {media.is_active ? "Active" : "Set Active"}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => deleteMedia(media.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {heroMedia.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No hero media uploaded yet. Upload your first image or video above.
          </div>
        )}
      </div>
    </div>
  )
}
