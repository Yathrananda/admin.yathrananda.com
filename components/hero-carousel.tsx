"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Trash2, RotateCcw } from "lucide-react";
import Image from "next/image";

interface HeroMedia {
  id: string;
  url: string;
  type: "image" | "video";
  is_active: boolean;
  carousel_order: number;
}

interface HeroCarouselProps {
  activeMedia: HeroMedia[];
  onRemove: (id: string) => void;
  onReplace: (id: string) => void;
}

export function HeroCarousel({
  activeMedia,
  onRemove,
  onReplace,
}: HeroCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (activeMedia.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-gray-500">
            No active carousel items. Upload and activate media to create your
            carousel.
          </p>
        </CardContent>
      </Card>
    );
  }

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % activeMedia.length);
  };

  const prevSlide = () => {
    setCurrentIndex(
      (prev) => (prev - 1 + activeMedia.length) % activeMedia.length
    );
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Main Carousel Display */}
          <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
            {activeMedia[currentIndex]?.type === "image" ? (
              <Image
                src={activeMedia[currentIndex]?.url || "/placeholder.svg"}
                alt={`Carousel item ${currentIndex + 1}`}
                fill
                className="object-cover"
              />
            ) : (
              <video
                src={activeMedia[currentIndex]?.url}
                className="w-full h-full object-cover"
                controls
                key={activeMedia[currentIndex]?.id}
              />
            )}

            {/* Navigation Arrows */}
            {activeMedia.length > 1 && (
              <>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
                  onClick={prevSlide}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
                  onClick={nextSlide}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </>
            )}

            {/* Slide Counter */}
            <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
              {currentIndex + 1} / {activeMedia.length}
            </div>

            {/* Individual Item Controls */}
            <div className="absolute bottom-2 right-2 flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="bg-white/80 hover:bg-white"
                onClick={() => onReplace(activeMedia[currentIndex]?.id)}
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="bg-white/80 hover:bg-white"
                onClick={() => onRemove(activeMedia[currentIndex]?.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Thumbnail Navigation */}
          {activeMedia.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {activeMedia.map((media, index) => (
                <button
                  key={media.id}
                  onClick={() => goToSlide(index)}
                  className={`flex-shrink-0 w-16 h-12 rounded border-2 overflow-hidden ${
                    index === currentIndex
                      ? "border-blue-500"
                      : "border-gray-200"
                  }`}
                >
                  {media.type === "image" ? (
                    <Image
                      src={media.url || "/placeholder.svg"}
                      alt={`Thumbnail ${index + 1}`}
                      width={64}
                      height={48}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                      <div className="w-0 h-0 border-l-[6px] border-l-white border-y-[4px] border-y-transparent" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
