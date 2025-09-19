import { useEffect, useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { Card } from '@/components/ui/card';

export function PromoCarousel() {
  const images = [
    '/images/promo-1.jpg',
    '/images/promo-2.jpg',
    '/images/promo-3.jpg',
    '/images/promo-4.jpg'
  ];

  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: true,
    duration: 30 // Smooth transition
  });

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  useEffect(() => {
    if (emblaApi) {
      // Auto-advance every 3 seconds
      const intervalId = setInterval(scrollNext, 3000);
      
      return () => clearInterval(intervalId);
    }
  }, [emblaApi, scrollNext]);

  return (
    <Card className="overflow-hidden h-full">
      <div className="embla h-full" ref={emblaRef}>
        <div className="embla__container flex h-full">
          {images.map((src, index) => (
            <div className="embla__slide flex-[0_0_100%] min-w-0 h-full" key={index}>
              <img
                src={src}
                alt={`Imagem promocional ${index + 1}`}
                className="w-full h-full object-contain"
              />
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}