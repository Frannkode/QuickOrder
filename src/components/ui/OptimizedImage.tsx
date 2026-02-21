import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    src: string;
    alt: string;
    className?: string;
    fallbackSrc?: string;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
    src,
    alt,
    className = '',
    fallbackSrc = '/images/products/placeholder.png',
    ...props
}) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [hasError, setHasError] = useState(false);
    const [currentSrc, setCurrentSrc] = useState(src);

    useEffect(() => {
        setCurrentSrc(src);
        setIsLoaded(false);
        setHasError(false);
    }, [src]);

    const handleImageLoad = () => {
        setIsLoaded(true);
    };

    const handleImageError = () => {
        if (!hasError) {
            setHasError(true);
            setCurrentSrc(fallbackSrc);
            setIsLoaded(true);
        }
    };

    return (
        <div className={`relative overflow-hidden ${className}`}>
            <AnimatePresence mode="wait">
                {!isLoaded && (
                    <motion.div
                        key="skeleton"
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="absolute inset-0 bg-slate-200 dark:bg-slate-700 animate-pulse"
                    />
                )}
            </AnimatePresence>
            <motion.img
                src={currentSrc}
                alt={alt}
                onLoad={handleImageLoad}
                onError={handleImageError}
                loading="lazy"
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{
                    opacity: isLoaded ? 1 : 0,
                    scale: isLoaded ? 1 : 1.05
                }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className={`w-full h-full object-cover transition-transform ${className}`}
                {...props}
            />
        </div>
    );
};
