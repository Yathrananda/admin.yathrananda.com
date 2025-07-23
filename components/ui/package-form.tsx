import { useState, useEffect } from "react"
import { Button } from "./button"
import { Input } from "./input"
import { Label } from "./label"
import { Textarea } from "./textarea"
import { Card } from "./card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs"
import { Plus, Minus, Upload, Image as ImageIcon, X } from "lucide-react"
import Image from "next/image"
import { Checkbox } from "./checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select"
import { TestimonialSelector } from "./testimonial-selector"

interface ImageFile {
  file: File | null
  url?: string
  alt: string
  caption?: string
}

interface ItineraryDay {
  day: number
  title: string
  route: string
  meal_plan: string
  activities: string[]
  notes: string
  images: Array<{ file: File | null, url?: string, alt: string }>
}

interface PackageFormProps {
  initialData?: any
  onSubmit: (data: any) => Promise<void>
  isLoading: boolean
}

export function PackageForm({ initialData, onSubmit, isLoading }: PackageFormProps) {
  const [activeTab, setActiveTab] = useState("basic")
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [deletedImages, setDeletedImages] = useState<string[]>([])
  
  const [formData, setFormData] = useState({
    // Basic Info
    title: initialData?.title ?? "",
    subtitle: initialData?.subtitle ?? "",
    overview: initialData?.overview ?? "",
    price: initialData?.price ?? "",
    duration: initialData?.duration ?? "",
    location: initialData?.location ?? "",
    group_size: initialData?.group_size ?? "",
    is_trending: initialData?.is_trending ?? false,
    is_international: initialData?.is_international ?? false,
    is_domestic: initialData?.is_domestic ?? false,
    is_upcoming: initialData?.is_upcoming ?? false,
    is_kerala_tours: initialData?.is_kerala_tours ?? false,
    is_customized_tours: initialData?.is_customized_tours ?? false,
    
    // Departure Details
    departure_place: initialData?.departure_place ?? "",
    departure_date: initialData?.departure_date ?? "",
    departure_type: initialData?.departure_type ?? "plane",
    
    // Activities Display
    activities_display_type: initialData?.activities_display_type ?? "points",
    
    heroImage: {
      url: initialData?.heroImage?.url ?? "",
      alt: initialData?.heroImage?.alt ?? "",
    },
    image: null as File | null,

    // Itinerary
    itinerary: (initialData?.itinerary ?? [
      {
        day: 1,
        title: "",
        route: "",
        meal_plan: "",
        activities: [""],
        notes: "",
        images: [] as Array<{ file: File | null, url?: string, alt: string }>,
      },
    ]).map((day: any) => ({
      ...day,
      images: day.images?.map((img: any) => ({
        file: null,
        url: img.url ?? "",
        alt: img.alt ?? "",
      })) ?? []
    })) as ItineraryDay[],

    // Gallery
    gallery: (initialData?.gallery ?? []).map((img: any) => ({
      file: null as File | null,
      url: img?.url ?? "",
      alt: img?.alt ?? "",
      caption: img?.caption ?? "",
    })) || [{ file: null, url: "", alt: "", caption: "" }] as ImageFile[],

    // Booking Info
    bookingInfo: {
      advancePayment: initialData?.bookingInfo?.advancePayment ?? "",
      balancePayment: initialData?.bookingInfo?.balancePayment ?? "",
      bookingRules: Array.isArray(initialData?.bookingInfo?.bookingRules) 
        ? initialData.bookingInfo.bookingRules
        : [""],
    },

    // Cancellation Policy
    cancellationPolicy: {
      rules: Array.isArray(initialData?.cancellationPolicy?.rules)
        ? initialData.cancellationPolicy.rules
        : [""],
    },

    // Testimonials
    testimonials: initialData?.testimonials?.map((t: any) => t.id) || [],

    // Inclusions & Exclusions
    inclusions: Array.isArray(initialData?.inclusions) 
      ? initialData.inclusions
      : [""],
    exclusions: Array.isArray(initialData?.exclusions) 
      ? initialData.exclusions
      : [""],
  })

  useEffect(() => {
    console.log('Initial Data:', initialData)
    console.log('Form Data:', formData)
  }, [])

  useEffect(() => {
    // Set hero image preview if exists
    if (formData.heroImage.url) {
      setImagePreview(formData.heroImage.url)
    }
  }, [formData.heroImage.url])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit({ ...formData, deletedImages })
  }

  // Helper functions for array fields
  const addArrayItem = (field: string, defaultValue: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: [...prev[field], defaultValue],
    }))
  }

  const removeArrayItem = (field: string, index: number) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: prev[field].filter((_: any, i: number) => i !== index),
    }))
  }

  const updateArrayItem = (field: string, index: number, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: prev[field].map((item: any, i: number) => (i === index ? value : item)),
    }))
  }

  // Handle hero image file selection
  const handleHeroImageChange = (files: FileList | null) => {
    if (!files?.length) return

    const file = files[0]
    const imageUrl = URL.createObjectURL(file)
    setImagePreview(imageUrl)
    setFormData({ 
      ...formData, 
      image: file,
      heroImage: {
        ...formData.heroImage,
        url: imageUrl,
      }
    })
  }

  // Handle image file selection for itinerary
  const handleItineraryImageChange = (dayIndex: number, imageIndex: number, files: FileList | null) => {
    if (!files?.length) return

    const file = files[0]
    const imageUrl = URL.createObjectURL(file)
    const newImages = [...formData.itinerary[dayIndex].images]
    
    if (imageIndex >= newImages.length) {
      newImages.push({ file, url: imageUrl, alt: "" })
    } else {
      newImages[imageIndex] = { ...newImages[imageIndex], file, url: imageUrl }
    }

    const newItinerary = [...formData.itinerary]
    newItinerary[dayIndex] = { ...newItinerary[dayIndex], images: newImages }
    setFormData({ ...formData, itinerary: newItinerary })
  }

  // Handle image file selection for gallery
  const handleGalleryImageChange = (index: number, files: FileList | null) => {
    if (!files?.length) return

    const file = files[0]
    const imageUrl = URL.createObjectURL(file)
    const newGallery = formData.gallery.map((item: ImageFile, i: number) => 
      i === index ? { ...item, file, url: imageUrl } : item
    )
    setFormData({ ...formData, gallery: newGallery })
  }

  // Handle image deletion
  const handleDeleteImage = (type: 'hero' | 'itinerary' | 'gallery', dayIndex?: number, imageIndex?: number) => {
    if (type === 'hero') {
      // Track the deleted hero image URL
      if (formData.heroImage.url && !formData.heroImage.url.startsWith('blob:')) {
        setDeletedImages(prev => [...prev, formData.heroImage.url!])
      }
      setImagePreview(null)
      setFormData({
        ...formData,
        image: null,
        heroImage: { url: "", alt: "" }
      })
    } else if (type === 'itinerary' && dayIndex !== undefined && imageIndex !== undefined) {
      const currentImage = formData.itinerary[dayIndex].images[imageIndex]
      // Track the deleted itinerary image URL
      if (currentImage.url && !currentImage.url.startsWith('blob:')) {
        setDeletedImages(prev => [...prev, currentImage.url!])
      }
      const newItinerary = [...formData.itinerary]
      newItinerary[dayIndex].images[imageIndex] = { file: null, url: "", alt: "" }
      setFormData({ ...formData, itinerary: newItinerary })
    } else if (type === 'gallery' && imageIndex !== undefined) {
      const currentImage = formData.gallery[imageIndex]
      // Track the deleted gallery image URL
      if (currentImage.url && !currentImage.url.startsWith('blob:')) {
        setDeletedImages(prev => [...prev, currentImage.url!])
      }
      const newGallery = [...formData.gallery]
      newGallery[imageIndex] = { file: null, url: "", alt: "", caption: "" }
      setFormData({ ...formData, gallery: newGallery })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="itinerary">Itinerary</TabsTrigger>
          <TabsTrigger value="gallery">Gallery</TabsTrigger>
          <TabsTrigger value="inclusions">Inclusions</TabsTrigger>
          <TabsTrigger value="booking">Booking</TabsTrigger>
          <TabsTrigger value="cancellation">Cancellation</TabsTrigger>
          <TabsTrigger value="testimonials">Testimonials</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          <div className="grid gap-4">
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
              <Label htmlFor="subtitle">Subtitle</Label>
              <Input
                id="subtitle"
                value={formData.subtitle}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="overview">Overview</Label>
              <Textarea
                id="overview"
                value={formData.overview}
                onChange={(e) => setFormData({ ...formData, overview: e.target.value })}
                rows={4}
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
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
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
                <Label htmlFor="group_size">Group Size</Label>
                <Input
                  id="group_size"
                  value={formData.group_size}
                  onChange={(e) => setFormData({ ...formData, group_size: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-4">
              <Label>Departure Details</Label>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="departure_place">Departure Place</Label>
                  <Input
                    id="departure_place"
                    value={formData.departure_place}
                    onChange={(e) => setFormData({ ...formData, departure_place: e.target.value })}
                    placeholder="e.g., Delhi, Mumbai"
                  />
                </div>
                <div>
                  <Label htmlFor="departure_date">Departure Date</Label>
                  <Input
                    id="departure_date"
                    type="date"
                    value={formData.departure_date}
                    onChange={(e) => setFormData({ ...formData, departure_date: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="departure_type">Departure Type</Label>
                  <Select
                    value={formData.departure_type}
                    onValueChange={(value) => setFormData({ ...formData, departure_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="plane">Plane</SelectItem>
                      <SelectItem value="train">Train</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <Label>Activities Display</Label>
              <div>
                <Label htmlFor="activities_display_type">Display Format</Label>
                <Select
                  value={formData.activities_display_type}
                  onValueChange={(value) => setFormData({ ...formData, activities_display_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select display format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="points">Bullet Points</SelectItem>
                    <SelectItem value="description">Description</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground mt-1">
                  Choose how activities will be displayed in the itinerary
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <Label>Package Type</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="is_trending"
                    checked={formData.is_trending}
                    onCheckedChange={(checked) => 
                      setFormData({ ...formData, is_trending: checked as boolean })
                    }
                  />
                  <Label htmlFor="is_trending" className="cursor-pointer">Trending Package</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="is_upcoming"
                    checked={formData.is_upcoming}
                    onCheckedChange={(checked) => 
                      setFormData({ ...formData, is_upcoming: checked as boolean })
                    }
                  />
                  <Label htmlFor="is_upcoming" className="cursor-pointer">Upcoming Tour</Label>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <Label>Package Category</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="is_domestic"
                    checked={formData.is_domestic}
                    onCheckedChange={(checked) => 
                      setFormData({ ...formData, is_domestic: checked as boolean })
                    }
                  />
                  <Label htmlFor="is_domestic" className="cursor-pointer">Domestic Package</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="is_international"
                    checked={formData.is_international}
                    onCheckedChange={(checked) => 
                      setFormData({ ...formData, is_international: checked as boolean })
                    }
                  />
                  <Label htmlFor="is_international" className="cursor-pointer">International Package</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="is_kerala_tours"
                    checked={formData.is_kerala_tours}
                    onCheckedChange={(checked) => 
                      setFormData({ ...formData, is_kerala_tours: checked as boolean })
                    }
                  />
                  <Label htmlFor="is_kerala_tours" className="cursor-pointer">Kerala Tours</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="is_customized_tours"
                    checked={formData.is_customized_tours}
                    onCheckedChange={(checked) => 
                      setFormData({ ...formData, is_customized_tours: checked as boolean })
                    }
                  />
                  <Label htmlFor="is_customized_tours" className="cursor-pointer">Customized Tours</Label>
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="heroImage">Hero Image</Label>
              <div className="space-y-2">
                {(imagePreview || formData.heroImage.url) && (
                  <div className="relative w-full h-48">
                    <Image
                      src={imagePreview || formData.heroImage.url}
                      alt={formData.heroImage.alt}
                      fill
                      className="object-cover rounded-md"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={() => handleDeleteImage('hero')}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                <Input
                  id="heroImage"
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleHeroImageChange(e.target.files)}
                />
                <Input
                  placeholder="Image alt text"
                  value={formData.heroImage.alt}
                  onChange={(e) => setFormData({
                    ...formData,
                    heroImage: { ...formData.heroImage, alt: e.target.value }
                  })}
                />
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="itinerary" className="space-y-4">
          {formData.itinerary.map((day: ItineraryDay, dayIndex: number) => (
            <Card key={dayIndex} className="p-4">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Day *</Label>
                    <Input
                      type="number"
                      value={day.day}
                      onChange={(e) =>
                        updateArrayItem("itinerary", dayIndex, { ...day, day: parseInt(e.target.value) })
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label>Title *</Label>
                    <Input
                      value={day.title}
                      onChange={(e) =>
                        updateArrayItem("itinerary", dayIndex, { ...day, title: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Route</Label>
                    <Input
                      value={day.route}
                      onChange={(e) =>
                        updateArrayItem("itinerary", dayIndex, { ...day, route: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label>Meal Plan</Label>
                    <Input
                      value={day.meal_plan}
                      onChange={(e) =>
                        updateArrayItem("itinerary", dayIndex, { ...day, meal_plan: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div>
                  <Label>Activities</Label>
                  {day.activities.map((activity: string, actIndex: number) => (
                    <div key={actIndex} className="flex gap-2 mt-2">
                      <Input
                        value={activity}
                        onChange={(e) => {
                          const newActivities = [...day.activities]
                          newActivities[actIndex] = e.target.value
                          updateArrayItem("itinerary", dayIndex, { ...day, activities: newActivities })
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          const newActivities = day.activities.filter((_: any, i: number) => i !== actIndex)
                          updateArrayItem("itinerary", dayIndex, { ...day, activities: newActivities })
                        }}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => {
                      const newActivities = [...day.activities, ""]
                      updateArrayItem("itinerary", dayIndex, { ...day, activities: newActivities })
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" /> Add Activity
                  </Button>
                </div>

                <div>
                  <Label>Notes</Label>
                  <Textarea
                    value={day.notes}
                    onChange={(e) =>
                      updateArrayItem("itinerary", dayIndex, { ...day, notes: e.target.value })
                    }
                  />
                </div>

                <div>
                  <Label>Images</Label>
                  <div className="grid grid-cols-2 gap-4">
                    {day.images.map((image: { file: File | null, url?: string, alt: string }, imageIndex: number) => (
                      <div key={imageIndex} className="space-y-2">
                        {image.url && (
                          <div className="relative w-full h-32">
                            <Image
                              src={image.url}
                              alt={image.alt}
                              fill
                              className="object-cover rounded-md"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute top-2 right-2"
                              onClick={() => handleDeleteImage('itinerary', dayIndex, imageIndex)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                        <div className="flex gap-2">
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleItineraryImageChange(dayIndex, imageIndex, e.target.files)}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => {
                              const newImages = day.images.filter((_: { file: File | null, url?: string, alt: string }, i: number) => i !== imageIndex)
                              updateArrayItem("itinerary", dayIndex, { ...day, images: newImages })
                            }}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                        </div>
                        <Input
                          placeholder="Alt text"
                          value={image.alt}
                          onChange={(e) => {
                            const newImages = [...day.images]
                            newImages[imageIndex] = { ...image, alt: e.target.value }
                            updateArrayItem("itinerary", dayIndex, { ...day, images: newImages })
                          }}
                        />
                      </div>
                    ))}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => {
                      const newImages = [...day.images, { file: null, url: "", alt: "" }]
                      updateArrayItem("itinerary", dayIndex, { ...day, images: newImages })
                    }}
                  >
                    <ImageIcon className="h-4 w-4 mr-2" /> Add Image
                  </Button>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => removeArrayItem("itinerary", dayIndex)}
              >
                <Minus className="h-4 w-4 mr-2" /> Remove Day
              </Button>
            </Card>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              addArrayItem("itinerary", {
                day: formData.itinerary.length + 1,
                title: "",
                route: "",
                meal_plan: "",
                activities: [""],
                notes: "",
                images: [],
              })
            }
          >
            <Plus className="h-4 w-4 mr-2" /> Add Day
          </Button>
        </TabsContent>

        <TabsContent value="gallery" className="space-y-4">
          {formData.gallery.map((image: ImageFile, index: number) => (
            <Card key={index} className="p-4">
              <div className="space-y-4">
                <div>
                  <Label>Image</Label>
                  {image.url && (
                    <div className="relative w-full h-48 mb-2">
                      <Image
                        src={image.url}
                        alt={image.alt}
                        fill
                        className="object-cover rounded-md"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={() => handleDeleteImage('gallery', undefined, index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleGalleryImageChange(index, e.target.files)}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeArrayItem("gallery", index)}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div>
                  <Label>Alt Text</Label>
                  <Input
                    value={image.alt}
                    onChange={(e) =>
                      updateArrayItem("gallery", index, { ...image, alt: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Caption</Label>
                  <Input
                    value={image.caption}
                    onChange={(e) =>
                      updateArrayItem("gallery", index, { ...image, caption: e.target.value })
                    }
                  />
                </div>
              </div>
            </Card>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={() => addArrayItem("gallery", { file: null, url: "", alt: "", caption: "" })}
          >
            <Plus className="h-4 w-4 mr-2" /> Add Image
          </Button>
        </TabsContent>

        <TabsContent value="inclusions" className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label className="text-lg font-semibold">What's Included</Label>
              <p className="text-sm text-muted-foreground mb-3">
                List all the items, services, and amenities included in this package
              </p>
              {formData.inclusions.map((inclusion: string, index: number) => (
                <div key={index} className="flex gap-2 mt-2">
                  <Input
                    value={inclusion}
                    placeholder="e.g., Accommodation in 4-star hotels"
                    onChange={(e) => {
                      const newInclusions = [...formData.inclusions]
                      newInclusions[index] = e.target.value
                      setFormData({
                        ...formData,
                        inclusions: newInclusions
                      })
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      const newInclusions = formData.inclusions.filter(
                        (_: any, i: number) => i !== index
                      )
                      setFormData({
                        ...formData,
                        inclusions: newInclusions.length ? newInclusions : [""]
                      })
                    }}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() =>
                  setFormData({
                    ...formData,
                    inclusions: [...formData.inclusions, ""]
                  })
                }
              >
                <Plus className="h-4 w-4 mr-2" /> Add Inclusion
              </Button>
            </div>

            <div>
              <Label className="text-lg font-semibold">What's Excluded</Label>
              <p className="text-sm text-muted-foreground mb-3">
                List all the items, services, and costs not included in this package
              </p>
              {formData.exclusions.map((exclusion: string, index: number) => (
                <div key={index} className="flex gap-2 mt-2">
                  <Input
                    value={exclusion}
                    placeholder="e.g., International flights"
                    onChange={(e) => {
                      const newExclusions = [...formData.exclusions]
                      newExclusions[index] = e.target.value
                      setFormData({
                        ...formData,
                        exclusions: newExclusions
                      })
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      const newExclusions = formData.exclusions.filter(
                        (_: any, i: number) => i !== index
                      )
                      setFormData({
                        ...formData,
                        exclusions: newExclusions.length ? newExclusions : [""]
                      })
                    }}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() =>
                  setFormData({
                    ...formData,
                    exclusions: [...formData.exclusions, ""]
                  })
                }
              >
                <Plus className="h-4 w-4 mr-2" /> Add Exclusion
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="booking" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Advance Payment</Label>
              <Input
                value={formData.bookingInfo.advancePayment}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    bookingInfo: { 
                      ...formData.bookingInfo, 
                      advancePayment: e.target.value 
                    },
                  })
                }
              />
            </div>
            <div>
              <Label>Balance Payment</Label>
              <Input
                value={formData.bookingInfo.balancePayment}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    bookingInfo: { 
                      ...formData.bookingInfo, 
                      balancePayment: e.target.value 
                    },
                  })
                }
              />
            </div>
          </div>

          <div>
            <Label>Booking Rules</Label>
            {formData.bookingInfo.bookingRules.map((rule: string, index: number) => (
              <div key={index} className="flex gap-2 mt-2">
                <Input
                  value={rule}
                  onChange={(e) => {
                    const newRules = [...formData.bookingInfo.bookingRules]
                    newRules[index] = e.target.value
                    setFormData({
                      ...formData,
                      bookingInfo: { 
                        ...formData.bookingInfo, 
                        bookingRules: newRules 
                      },
                    })
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    const newRules = formData.bookingInfo.bookingRules.filter(
                      (_: any, i: number) => i !== index
                    )
                    setFormData({
                      ...formData,
                      bookingInfo: { 
                        ...formData.bookingInfo, 
                        bookingRules: newRules.length ? newRules : [""] 
                      },
                    })
                  }}
                >
                  <Minus className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() =>
                setFormData({
                  ...formData,
                  bookingInfo: {
                    ...formData.bookingInfo,
                    bookingRules: [...formData.bookingInfo.bookingRules, ""],
                  },
                })
              }
            >
              <Plus className="h-4 w-4 mr-2" /> Add Rule
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="cancellation" className="space-y-4">
          <div>
            <Label>Cancellation Rules</Label>
            {formData.cancellationPolicy.rules.map((rule: string, index: number) => (
              <div key={index} className="flex gap-2 mt-2">
                <Input
                  value={rule}
                  onChange={(e) => {
                    const newRules = [...formData.cancellationPolicy.rules]
                    newRules[index] = e.target.value
                    setFormData({
                      ...formData,
                      cancellationPolicy: { 
                        ...formData.cancellationPolicy, 
                        rules: newRules 
                      },
                    })
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    const newRules = formData.cancellationPolicy.rules.filter(
                      (_: any, i: number) => i !== index
                    )
                    setFormData({
                      ...formData,
                      cancellationPolicy: { 
                        ...formData.cancellationPolicy, 
                        rules: newRules.length ? newRules : [""] 
                      },
                    })
                  }}
                >
                  <Minus className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() =>
                setFormData({
                  ...formData,
                  cancellationPolicy: {
                    ...formData.cancellationPolicy,
                    rules: [...formData.cancellationPolicy.rules, ""],
                  },
                })
              }
            >
              <Plus className="h-4 w-4 mr-2" /> Add Rule
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="testimonials" className="space-y-4">
          <TestimonialSelector
            selectedTestimonials={formData.testimonials}
            onSelectionChange={(testimonialIds) =>
              setFormData({ ...formData, testimonials: testimonialIds })
            }
          />
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : initialData ? "Update Package" : "Create Package"}
        </Button>
      </div>
    </form>
  )
} 