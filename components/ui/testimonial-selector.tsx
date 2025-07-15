"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { createClient } from "@/utils/supabase/client"
import Image from "next/image"
import { X } from "lucide-react"

interface Testimonial {
  id: string
  client_name: string
  message: string
  image_url?: string
}

interface TestimonialSelectorProps {
  selectedTestimonials: string[]
  onSelectionChange: (testimonialIds: string[]) => void
}

export function TestimonialSelector({ selectedTestimonials, onSelectionChange }: TestimonialSelectorProps) {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchTestimonials()
  }, [])

  const fetchTestimonials = async () => {
    try {
      const { data, error } = await supabase
        .from("testimonials")
        .select("id, client_name, message, image_url")
        .order("created_at", { ascending: false })

      if (error) throw error
      setTestimonials(data || [])
    } catch (error) {
      console.error("Error fetching testimonials:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleTestimonialToggle = (testimonialId: string) => {
    const newSelection = selectedTestimonials.includes(testimonialId)
      ? selectedTestimonials.filter(id => id !== testimonialId)
      : [...selectedTestimonials, testimonialId]
    
    onSelectionChange(newSelection)
  }

  const removeTestimonial = (testimonialId: string) => {
    const newSelection = selectedTestimonials.filter(id => id !== testimonialId)
    onSelectionChange(newSelection)
  }

  if (loading) {
    return <div className="text-sm text-gray-500">Loading testimonials...</div>
  }

  return (
    <div className="space-y-4 max-w-xl sm:max-w-3xl">
      <div>
        <Label className="text-sm font-medium">Select Testimonials</Label>
        <p className="text-xs text-gray-500 mt-1">
          Choose testimonials to display with this package
        </p>
      </div>

      {/* Selected Testimonials */}
      {selectedTestimonials.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">Selected Testimonials ({selectedTestimonials.length})</Label>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {testimonials
              .filter(testimonial => selectedTestimonials.includes(testimonial.id))
              .map((testimonial) => (
                <Card key={testimonial.id} className="p-3">
                  <CardContent className="p-0 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {testimonial.image_url && (
                        <div className="w-10 h-10 relative bg-gray-100 rounded-full overflow-hidden flex-shrink-0">
                          <Image
                            src={testimonial.image_url}
                            alt={testimonial.client_name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{testimonial.client_name}</p>
                        <p className="text-xs text-gray-600 truncate max-w-lg">"{testimonial.message}"</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeTestimonial(testimonial.id)}
                      className="h-6 w-6 p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      )}

      {/* Available Testimonials */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">
          Available Testimonials ({testimonials.filter(t => !selectedTestimonials.includes(t.id)).length})
        </Label>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {testimonials
            .filter(testimonial => !selectedTestimonials.includes(testimonial.id))
            .map((testimonial) => (
              <Card key={testimonial.id} className="p-3">
                <CardContent className="p-0">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id={`testimonial-${testimonial.id}`}
                      checked={selectedTestimonials.includes(testimonial.id)}
                      onCheckedChange={() => handleTestimonialToggle(testimonial.id)}
                    />
                    {testimonial.image_url && (
                      <div className="w-10 h-10 relative bg-gray-100 rounded-full overflow-hidden flex-shrink-0">
                        <Image
                          src={testimonial.image_url}
                          alt={testimonial.client_name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{testimonial.client_name}</p>
                      <p className="text-xs text-gray-600 truncate">"{testimonial.message}"</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      </div>

      {testimonials.length === 0 && (
        <div className="text-center py-4 text-sm text-gray-500">
          No testimonials available. Create some testimonials first.
        </div>
      )}
    </div>
  )
} 