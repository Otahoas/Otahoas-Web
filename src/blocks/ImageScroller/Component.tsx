'use client'

import React, { useState } from 'react'
import type { ImageScrollerBlock as ImageScrollerBlockType } from '@/payload-types'
import { Media } from '@/components/Media'
import { useTranslations } from 'next-intl'

export const ImageScrollerBlock: React.FC<ImageScrollerBlockType> = (props) => {
  const { displayMode = 'grid', images } = props
  const t = useTranslations('imageScroller')
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null)
  const [currentCarouselIndex, setCurrentCarouselIndex] = useState(0)

  if (!images || images.length === 0) return null

  const handlePrevious = () => {
    setCurrentCarouselIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  const handleNext = () => {
    setCurrentCarouselIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }

  const closeModal = () => setSelectedImageIndex(null)

  return (
    <div className="container my-12">
      <h2 className="mb-8 text-3xl font-bold">{t('title')}</h2>

      {displayMode === 'grid' ? (
        <>
          {/* Grid Mode */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {images.map((item, index) => (
              <div
                key={index}
                className="group cursor-pointer overflow-hidden rounded-lg"
                onClick={() => setSelectedImageIndex(index)}
              >
                {typeof item.image === 'object' && item.image !== null && (
                  <div className="relative aspect-square transition-transform duration-300 group-hover:scale-105">
                    <Media
                      resource={item.image}
                      imgClassName="object-cover w-full h-full"
                      className="h-full w-full"
                    />
                  </div>
                )}
                {item.caption && (
                  <p className="mt-2 text-center text-sm text-gray-600">{item.caption}</p>
                )}
              </div>
            ))}
          </div>

          {/* Modal for enlarged image */}
          {selectedImageIndex !== null && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 p-4"
              onClick={closeModal}
            >
              <button
                className="absolute right-4 top-4 text-4xl text-white hover:text-gray-300"
                onClick={closeModal}
                aria-label="Close"
              >
                ×
              </button>
              <div
                className="relative max-h-[90vh] max-w-[90vw]"
                onClick={(e) => e.stopPropagation()}
              >
                {typeof images[selectedImageIndex].image === 'object' &&
                  images[selectedImageIndex].image !== null && (
                    <>
                      <Media
                        resource={images[selectedImageIndex].image}
                        imgClassName="max-h-[80vh] w-auto object-contain"
                      />
                      {images[selectedImageIndex].caption && (
                        <p className="mt-4 text-center text-white">
                          {images[selectedImageIndex].caption}
                        </p>
                      )}
                    </>
                  )}
              </div>
            </div>
          )}
        </>
      ) : (
        <>
          {/* Carousel Mode */}
          <div className="relative">
            <div className="overflow-hidden rounded-lg">
              {typeof images[currentCarouselIndex].image === 'object' &&
                images[currentCarouselIndex].image !== null && (
                  <div className="relative aspect-video w-full">
                    <Media
                      resource={images[currentCarouselIndex].image}
                      imgClassName="object-cover w-full h-full"
                      className="h-full w-full"
                    />
                  </div>
                )}
            </div>

            {images[currentCarouselIndex].caption && (
              <p className="mt-4 text-center text-gray-600">
                {images[currentCarouselIndex].caption}
              </p>
            )}

            {/* Navigation buttons */}
            {images.length > 1 && (
              <>
                <button
                  onClick={handlePrevious}
                  className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white p-3 shadow-lg hover:bg-gray-100"
                  aria-label="Previous image"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
                <button
                  onClick={handleNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white p-3 shadow-lg hover:bg-gray-100"
                  aria-label="Next image"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </>
            )}

            {/* Image counter */}
            <div className="mt-4 text-center text-sm text-gray-500">
              {currentCarouselIndex + 1} / {images.length}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
