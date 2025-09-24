import { useState, useEffect } from 'react';
import { useContent } from '../contexts/ContentContext';
import styles from '../styles/PosterDisplay.module.css';

const PosterDisplay = ({ poster }) => {
  const { getContent } = useContent();
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  // Default poster data if none provided
  const defaultPoster = {
    title: getContent('posters.defaultTitle', 'Featured Poster'),
    description: getContent('posters.defaultDescription', 'Check out our latest poster.'),
    file: { url: '/images/posters/default.jpg' },
    image: { url: '/images/posters/default.jpg' },
    url: '#',
    buttonText: getContent('posters.viewPoster', 'View Poster'),
    artist: getContent('posters.defaultArtist', 'Tamil Language Society'),
    category: getContent('posters.defaultCategory', 'General'),
    pricing: {
      basePrice: 0,
      discount: 0,
      currency: 'INR'
    }
  };

  // Use provided poster or default
  const displayPoster = poster || defaultPoster;
  
  // Get image URL from poster data
  const imageUrl = displayPoster.file?.url || displayPoster.image?.url || '/images/posters/default.jpg';
  
  // Handle image load event
  const handleImageLoad = () => {
    setIsImageLoaded(true);
  };

  // Format price with currency
  const formatPrice = (price, currency = 'INR') => {
    if (price === 0) return getContent('posters.free', 'Free');
    
    const formatter = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0
    });
    
    return formatter.format(price);
  };

  // Calculate discounted price
  const discountedPrice = displayPoster.discountedPrice || displayPoster.pricing?.basePrice;
  const basePrice = displayPoster.pricing?.basePrice;
  const hasDiscount = discountedPrice < basePrice;

  return (
    <div className={styles.posterContainer}>
      <div className={styles.posterImageContainer}>
        <img 
          src={imageUrl} 
          alt={displayPoster.title} 
          className={`${styles.posterImage} ${isImageLoaded ? styles.loaded : ''}`}
          onLoad={handleImageLoad}
          onError={(e) => {
            e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="600" viewBox="0 0 400 600"%3E%3Crect width="400" height="600" fill="%23f0f0f0"/%3E%3Ctext x="200" y="300" text-anchor="middle" dy="0.3em" font-family="Arial, sans-serif" font-size="16" fill="%23666"%3EPoster Image%3C/text%3E%3C/svg%3E';
            setIsImageLoaded(true);
          }}
        />
        {!isImageLoaded && (
          <div className={styles.imageLoader}>
            <div className={styles.spinner}></div>
          </div>
        )}
      </div>
      
      <div className={styles.posterDetails}>
        <h2 className={styles.posterTitle}>{displayPoster.title}</h2>
        
        <div className={styles.posterMeta}>
          <span className={styles.posterArtist}>
            <i className="fas fa-user"></i> {displayPoster.artist}
          </span>
          <span className={styles.posterCategory}>
            <i className="fas fa-tag"></i> {displayPoster.category}
          </span>
        </div>
        
        <p className={styles.posterDescription}>{displayPoster.description}</p>
        
        <div className={styles.posterPricing}>
          {hasDiscount ? (
            <>
              <span className={styles.discountedPrice}>
                {formatPrice(discountedPrice, displayPoster.pricing?.currency)}
              </span>
              <span className={styles.originalPrice}>
                {formatPrice(basePrice, displayPoster.pricing?.currency)}
              </span>
              <span className={styles.discountBadge}>
                {displayPoster.pricing?.discountType === 'percentage' 
                  ? `${displayPoster.pricing?.discount}% OFF` 
                  : `${formatPrice(displayPoster.pricing?.discount, displayPoster.pricing?.currency)} OFF`}
              </span>
            </>
          ) : (
            <span className={styles.price}>
              {formatPrice(basePrice, displayPoster.pricing?.currency)}
            </span>
          )}
        </div>
        
        <div className={styles.posterActions}>
          <a 
            href={displayPoster.url || '#'} 
            className={styles.viewButton}
            target={displayPoster.url?.startsWith('http') ? '_blank' : '_self'}
            rel={displayPoster.url?.startsWith('http') ? 'noopener noreferrer' : ''}
          >
            <span>{displayPoster.buttonText || getContent('posters.viewPoster', 'View Poster')}</span>
            <i className="fas fa-eye"></i>
          </a>
          
          {displayPoster.availability?.stock > 0 && (
            <button className={styles.purchaseButton}>
              <span>{getContent('posters.purchase', 'Purchase')}</span>
              <i className="fas fa-shopping-cart"></i>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PosterDisplay;