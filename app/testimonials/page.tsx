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

interface Testimonial {
  id: string
  client_name: string
  message: string
  image_url?: string
  created_at: string
}

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null)
  const [formData, setFormData] = useState({
    client_name: "",
    message: "",
    image: null as File | null,
  })
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    fetchTestimonials()
  }, [])

  const fetchTestimonials = async () => {
    try {
      const { data, error } = await supabase.from("testimonials").select("*").order("created_at", { ascending: false })

      if (error) throw error
      setTestimonials(data || [])
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch testimonials",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      client_name: "",
      message: "",
      image: null,
    })
    setEditingTestimonial(null)
  }

  const openEditDialog = (testimonial: Testimonial) => {
    setEditingTestimonial(testimonial)
    setFormData({
      client_name: testimonial.client_name,
      message: testimonial.message,
      image: null,
    })
    setDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.client_name || !formData.message) {
      toast({
        title: "Error",
        description: "Please fill in client name and message",
        variant: "destructive",
      })
      return
    }

    setSaving(true)
    try {
      let imageUrl = editingTestimonial?.image_url || ""

      if (formData.image) {
        imageUrl = await uploadToCloudinary(formData.image)
      }

      const testimonialData = {
        client_name: formData.client_name,
        message: formData.message,
        image_url: imageUrl || null,
      }

      if (editingTestimonial) {
        const { error } = await supabase.from("testimonials").update(testimonialData).eq("id", editingTestimonial.id)

        if (error) throw error
      } else {
        const { error } = await supabase.from("testimonials").insert([testimonialData])

        if (error) throw error
      }

      toast({
        title: "Success",
        description: `Testimonial ${editingTestimonial ? "updated" : "created"} successfully`,
      })

      setDialogOpen(false)
      resetForm()
      fetchTestimonials()
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${editingTestimonial ? "update" : "create"} testimonial`,
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const deleteTestimonial = async (id: string) => {
    try {
      const { error } = await supabase.from("testimonials").delete().eq("id", id)

      if (error) throw error

      toast({
        title: "Success",
        description: "Testimonial deleted successfully",
      })
      fetchTestimonials()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete testimonial",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="flex-1">
        <PageHeader title="Testimonials" description="Manage client testimonials" />
        <div className="p-6">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1">
      <PageHeader title="Testimonials" description="Manage client testimonials">
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Add Testimonial
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingTestimonial ? "Edit Testimonial" : "Add New Testimonial"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="client_name">Client Name *</Label>
                <Input
                  id="client_name"
                  value={formData.client_name}
                  onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="message">Message *</Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows={4}
                  required
                />
              </div>
              <div>
                <Label htmlFor="image">Client Image (Optional)</Label>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFormData({ ...formData, image: e.target.files?.[0] || null })}
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={saving}>
                  {saving ? "Saving..." : editingTestimonial ? "Update" : "Create"}
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
          {testimonials.map((testimonial) => (
            <Card key={testimonial.id}>
              <CardContent className="p-4">
                <div className="space-y-4">
                  {testimonial.image_url && (
                    <div className="w-16 h-16 relative mx-auto bg-gray-100 rounded-full overflow-hidden">
                      <Image
                        src={testimonial.image_url || "/placeholder.svg"}
                        alt={testimonial.client_name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="text-center">
                    <h3 className="font-semibold">{testimonial.client_name}</h3>
                  </div>
                  <p className="text-sm text-gray-600 italic">"{testimonial.message}"</p>
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" onClick={() => openEditDialog(testimonial)} className="flex-1">
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => deleteTestimonial(testimonial.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {testimonials.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No testimonials created yet. Add your first testimonial above.
          </div>
        )}
      </div>
    </div>
  )
}
