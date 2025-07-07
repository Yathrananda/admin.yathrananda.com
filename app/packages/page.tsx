"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { PageHeader } from "@/components/ui/page-header"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/utils/supabase/client"
import { uploadToCloudinary } from "@/utils/cloudinary"
import { Plus, Edit, Trash2 } from "lucide-react"
import Image from "next/image"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { PackageForm } from "@/components/ui/package-form"
import { Badge } from "@/components/ui/badge"

interface TravelPackage {
  id: string
  title: string
  subtitle?: string
  description?: string
  overview?: string
  price: number
  duration: string
  location: string
  image_url?: string
  hero_image_url?: string
  hero_image_alt?: string
  group_size?: string
  advance_payment?: string
  balance_payment?: string
  departure_place?: string
  departure_date?: string
  departure_type?: string
  activities_display_type?: string
  created_at: string
  is_trending: boolean
  is_international: boolean
  is_domestic: boolean
  is_upcoming: boolean
  is_kerala_tours: boolean
  is_customized_tours: boolean
  itinerary?: Array<{
    id: string
    day: number
    title: string
    route?: string
    meal_plan?: string
    notes?: string
    activities: string[]
    images: Array<{
      url: string
      alt?: string
    }>
  }>
  gallery?: Array<{
    url: string
    alt?: string
    caption?: string
  }>
  bookingInfo?: {
    advancePayment: string
    balancePayment: string
    bookingRules: string[]
  }
  cancellationPolicy?: {
    rules: string[]
  }
}

export default function PackagesPage() {
  const [packages, setPackages] = useState<TravelPackage[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingPackage, setEditingPackage] = useState<TravelPackage | null>(null)
  const [uploading, setUploading] = useState(false)
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    fetchPackages()
  }, [])

  const fetchPackages = async () => {
    try {
      const { data: packagesData, error: packagesError } = await supabase
        .from("travel_packages")
        .select("*")
        .order("created_at", { ascending: false })

      if (packagesError) throw packagesError

      // Fetch related data for each package
      const packagesWithDetails = await Promise.all(
        (packagesData || []).map(async (pkg) => {
          const [
            { data: itinerary },
            { data: gallery },
            { data: bookingRules },
            { data: cancellationRules },
          ] = await Promise.all([
            supabase.from("package_itinerary").select("*").eq("package_id", pkg.id).order('display_order', { ascending: true }),
            supabase.from("package_gallery").select("*").eq("package_id", pkg.id).order('display_order', { ascending: true }),
            supabase.from("package_booking_rules").select("*").eq("package_id", pkg.id).order('display_order', { ascending: true }),
            supabase.from("package_cancellation_rules").select("*").eq("package_id", pkg.id).order('display_order', { ascending: true }),
          ])

          // Fetch activities and images for each itinerary day
          const itineraryWithDetails = await Promise.all(
            (itinerary || []).map(async (day) => {
              const [{ data: activities }, { data: images }] = await Promise.all([
                supabase.from("itinerary_activities").select("*").eq("itinerary_id", day.id).order('display_order', { ascending: true }),
                supabase.from("itinerary_images").select("*").eq("itinerary_id", day.id).order('display_order', { ascending: true }),
              ])

              return {
                ...day,
                activities: activities?.map((a) => a.activity) || [],
                images: images?.map(img => ({
                  url: img.url,
                  alt: img.alt || ""
                })) || [],
              }
            })
          )
          console.log(pkg, 'pkg')
          return {
            ...pkg,
            itinerary: itineraryWithDetails || [],
            gallery: (gallery || []).map(img => ({
              url: img.url,
              alt: img.alt || "",
              caption: img.caption || ""
            })),
            bookingInfo: {
              advancePayment: pkg.advance_payment || "",
              balancePayment: pkg.balance_payment || "",
              bookingRules: bookingRules?.map((r) => r.rule) || [""],
            },
            cancellationPolicy: {
              rules: cancellationRules?.map((r) => r.rule) || [""],
            }
          }
        })
      )

      setPackages(packagesWithDetails)
    } catch (error) {
      console.error("Error fetching packages:", error)
      toast({
        title: "Error",
        description: "Failed to fetch packages",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (formData: any) => {
    setUploading(true)
    try {
      let mainImageUrl = editingPackage?.image_url

      // Upload main package image if provided
      if (formData.image) {
        mainImageUrl = await uploadToCloudinary(formData.image)
      }

      // Create or update the main package
      const packageData = {
        title: formData.title,
        subtitle: formData.subtitle,
        overview: formData.overview,
        description: formData.overview,
        price: Number(formData.price),
        duration: formData.duration,
        location: formData.location,
        image_url: mainImageUrl,
        hero_image_url: mainImageUrl,
        hero_image_alt: formData.heroImage?.alt,
        group_size: formData.group_size,
        advance_payment: formData.bookingInfo.advancePayment,
        balance_payment: formData.bookingInfo.balancePayment,
        is_trending: formData.is_trending,
        is_international: formData.is_international,
        is_domestic: formData.is_domestic,
        is_upcoming: formData.is_upcoming,
        is_kerala_tours: formData.is_kerala_tours,
        is_customized_tours: formData.is_customized_tours,
        departure_place: formData.departure_place,
        departure_date: formData.departure_date,
        departure_type: formData.departure_type,
        activities_display_type: formData.activities_display_type
      }

      let packageId = editingPackage?.id

      if (editingPackage) {
        const { error } = await supabase
          .from("travel_packages")
          .update(packageData)
          .eq("id", editingPackage.id)
        if (error) throw error
      } else {
        const { data, error } = await supabase
          .from("travel_packages")
          .insert([packageData])
          .select()
        if (error) throw error
        packageId = data[0].id
      }

      if (packageId) {
        // Clear existing related data if updating
        if (editingPackage) {
          await Promise.all([
            supabase.from("package_itinerary").delete().eq("package_id", packageId),
            supabase.from("package_gallery").delete().eq("package_id", packageId),
            supabase.from("package_booking_rules").delete().eq("package_id", packageId),
            supabase.from("package_cancellation_rules").delete().eq("package_id", packageId),
          ])
        }

        // Insert itinerary and related data
        for (const day of formData.itinerary) {
          const { data: itineraryDay, error: itineraryError } = await supabase
            .from("package_itinerary")
            .insert({
              package_id: packageId,
              day: day.day,
              title: day.title,
              route: day.route,
              meal_plan: day.meal_plan,
              notes: day.notes,
            })
            .select()
            .single()

          if (itineraryError) throw itineraryError

          if (itineraryDay) {
            // Insert activities
            if (day.activities.length > 0) {
              const { error: activitiesError } = await supabase.from("itinerary_activities").insert(
                day.activities.map((activity: string) => ({
                  itinerary_id: itineraryDay.id,
                  activity,
                }))
              )
              if (activitiesError) throw activitiesError
            }

            // Upload and insert itinerary images
            if (day.images.length > 0) {
              const uploadedImages = await Promise.all(
                day.images.map(async (img: { file: File | null, url?: string, alt: string }) => {
                  let imageUrl = img.url
                  if (img.file) {
                    imageUrl = await uploadToCloudinary(img.file)
                  }
                  return {
                    itinerary_id: itineraryDay.id,
                    url: imageUrl,
                    alt: img.alt,
                  }
                })
              )

              const { error: imagesError } = await supabase.from("itinerary_images").insert(uploadedImages)
              if (imagesError) throw imagesError
            }
          }
        }

        // Upload and insert gallery images
        if (formData.gallery.length > 0) {
          const uploadedGalleryImages = await Promise.all(
            formData.gallery.map(async (img: { file: File | null, url?: string, alt: string, caption: string }) => {
              let imageUrl = img.url
              if (img.file) {
                imageUrl = await uploadToCloudinary(img.file)
              }
              return {
                package_id: packageId,
                url: imageUrl,
                alt: img.alt,
                caption: img.caption,
              }
            })
          )

          const { error: galleryError } = await supabase.from("package_gallery").insert(uploadedGalleryImages)
          if (galleryError) throw galleryError
        }

        // Insert booking rules
        if (formData.bookingInfo.bookingRules.length > 0) {
          const { error: bookingRulesError } = await supabase.from("package_booking_rules").insert(
            formData.bookingInfo.bookingRules.map((rule: string) => ({
              package_id: packageId,
              rule,
            }))
          )
          if (bookingRulesError) throw bookingRulesError
        }

        // Insert cancellation rules
        if (formData.cancellationPolicy.rules.length > 0) {
          const { error: cancellationRulesError } = await supabase
            .from("package_cancellation_rules")
            .insert(
              formData.cancellationPolicy.rules.map((rule: string) => ({
                package_id: packageId,
                rule,
              }))
            )
          if (cancellationRulesError) throw cancellationRulesError
        }
      }

      toast({
        title: "Success",
        description: `Package ${editingPackage ? "updated" : "created"} successfully`,
      })

      setDialogOpen(false)
      setEditingPackage(null)
      fetchPackages()
    } catch (error) {
      console.error("Error:", error)
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
            <Button onClick={() => setEditingPackage(null)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Package
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingPackage ? "Edit Package" : "Add New Package"}</DialogTitle>
            </DialogHeader>
            <PackageForm
              initialData={editingPackage}
              onSubmit={handleSubmit}
              isLoading={uploading}
            />
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
                    <Image
                      src={pkg.image_url || "/placeholder.svg"}
                      alt={pkg.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg">{pkg.title}</h3>
                  <div className="flex flex-wrap gap-2">
                    {pkg.is_trending && <Badge variant="secondary">Trending</Badge>}
                    {pkg.is_upcoming && <Badge variant="secondary">Upcoming</Badge>}
                    {pkg.is_domestic && <Badge>Domestic</Badge>}
                    {pkg.is_international && <Badge>International</Badge>}
                    {pkg.is_kerala_tours && <Badge variant="outline">Kerala Tours</Badge>}
                    {pkg.is_customized_tours && <Badge variant="outline">Customized Tours</Badge>}
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">{pkg.description}</p>
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">₹{pkg.price.toLocaleString()}</span>
                    <span className="text-gray-600">{pkg.duration}</span>
                  </div>
                  <p className="text-sm text-gray-600">{pkg.location}</p>
                  {pkg.departure_place && (
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Departure:</span> {pkg.departure_place}
                      {pkg.departure_date && (
                        <span> • {new Date(pkg.departure_date).toLocaleDateString()}</span>
                      )}
                      {pkg.departure_type && (
                        <span> • {pkg.departure_type.charAt(0).toUpperCase() + pkg.departure_type.slice(1)}</span>
                      )}
                    </div>
                  )}
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" onClick={() => {
                      setEditingPackage(pkg)
                      setDialogOpen(true)
                    }}>
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
