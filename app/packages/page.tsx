"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { PageHeader } from "@/components/ui/page-header"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/utils/supabase/client"
import { uploadToCloudinary } from "@/utils/cloudinary"
import { Plus, Edit, Trash2 } from "lucide-react"
import Image from "next/image"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

interface TravelPackage {
  id: string
  title: string
  description: string
  price: number
  duration: string
  location: string
  image_url: string
  created_at: string
}

export default function PackagesPage() {
  const [packages, setPackages] = useState<TravelPackage[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingPackage, setEditingPackage] = useState<TravelPackage | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    duration: "",
    location: "",
    image: null as File | null,
  })
  const [uploading, setUploading] = useState(false)
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    fetchPackages()
  }, [])

  const fetchPackages = async () => {
    try {
      const { data, error } = await supabase
        .from("travel_packages")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) throw error
      setPackages(data || [])
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch packages",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      price: "",
      duration: "",
      location: "",
      image: null,
    })
    setEditingPackage(null)
  }

  const openEditDialog = (pkg: TravelPackage) => {
    setEditingPackage(pkg)
    setFormData({
      title: pkg.title,
      description: pkg.description,
      price: pkg.price.toString(),
      duration: pkg.duration,
      location: pkg.location,
      image: null,
    })
    setDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title || !formData.price || !formData.duration || !formData.location) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setUploading(true)
    try {
      let imageUrl = editingPackage?.image_url || ""

      if (formData.image) {
        imageUrl = await uploadToCloudinary(formData.image)
      }

      const packageData = {
        title: formData.title,
        description: formData.description,
        price: Number.parseFloat(formData.price),
        duration: formData.duration,
        location: formData.location,
        image_url: imageUrl,
      }

      if (editingPackage) {
        const { error } = await supabase.from("travel_packages").update(packageData).eq("id", editingPackage.id)

        if (error) throw error
      } else {
        const { error } = await supabase.from("travel_packages").insert([packageData])

        if (error) throw error
      }

      toast({
        title: "Success",
        description: `Package ${editingPackage ? "updated" : "created"} successfully`,
      })

      setDialogOpen(false)
      resetForm()
      fetchPackages()
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${editingPackage ? "update" : "create"} package`,
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  const deletePackage = async (id: string) => {
    try {
      const { error } = await supabase.from("travel_packages").delete().eq("id", id)

      if (error) throw error

      toast({
        title: "Success",
        description: "Package deleted successfully",
      })
      fetchPackages()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete package",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="flex-1">
        <PageHeader title="Travel Packages" description="Manage travel packages" />
        <div className="p-6">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1">
      <PageHeader title="Travel Packages" description="Manage travel packages">
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Add Package
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingPackage ? "Edit Package" : "Add New Package"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Price *</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="duration">Duration *</Label>
                  <Input
                    id="duration"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="e.g., 5 days 4 nights"
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="image">Package Image</Label>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFormData({ ...formData, image: e.target.files?.[0] || null })}
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={uploading}>
                  {uploading ? "Saving..." : editingPackage ? "Update" : "Create"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </PageHeader>

      <div className="p-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {packages.map((pkg) => (
            <Card key={pkg.id}>
              <CardContent className="p-4">
                {pkg.image_url && (
                  <div className="aspect-video relative mb-4 bg-gray-100 rounded-lg overflow-hidden">
                    <Image src={pkg.image_url || "/placeholder.svg"} alt={pkg.title} fill className="object-cover" />
                  </div>
                )}
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg">{pkg.title}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2">{pkg.description}</p>
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">₹{pkg.price.toLocaleString()}</span>
                    <span className="text-gray-600">{pkg.duration}</span>
                  </div>
                  <p className="text-sm text-gray-600">{pkg.location}</p>
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" onClick={() => openEditDialog(pkg)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => deletePackage(pkg.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {packages.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No packages created yet. Add your first travel package above.
          </div>
        )}
      </div>
    </div>
  )
}
