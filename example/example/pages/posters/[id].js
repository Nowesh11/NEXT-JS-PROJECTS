import { useRouter } from 'next/router';
import Head from 'next/head';
import { useContent } from '../../contexts/ContentContext';
import Navigation from '../../components/Navigation';
import Footer from '../../components/Footer';
import PosterDisplay from '../../components/PosterDisplay';
import styles from '../../styles/PosterDetail.module.css';
import { usePoster } from '../../hooks/usePosters';

export default function PosterDetail() {
  const router = useRouter();
  const { id } = router.query;
  const { poster, loading, error } = usePoster(id);
  const { getContent } = useContent();

  // Handle back navigation
  const handleBack = () => {
    router.back();
  };

  return (
    <>
      <Head>
        <title>
          {poster ? `${poster.title} - ${getContent('posters.pageTitle', 'Posters')}` : getContent('posters.loading', 'Loading...')}
        </title>
        <meta 
          name="description" 
          content={poster?.description || getContent('posters.pageDescription', 'View and purchase posters from Tamil Language Society.')}
        />
      </Head>

      <Navigation />

      <main className={styles.main}>
        <div className={styles.container}>
          <button 
            onClick={handleBack}
            className={styles.backButton}
          >
            <i className="fas fa-arrow-left"></i>
            <span>{getContent('posters.backToPosters', 'Back to Posters')}</span>
          </button>

          {loading ? (
            <div className={styles.loadingContainer}>
              <div className={styles.spinner}></div>
              <p>{getContent('posters.loading', 'Loading poster...')}</p>
            </div>
          ) : error ? (
            <div className={styles.errorContainer}>
              <i className="fas fa-exclamation-triangle"></i>
              <p>{error}</p>
              <button 
                onClick={() => router.push('/posters')}
                className={styles.browseButton}
              >
                {getContent('posters.browseOtherPosters', 'Browse Other Posters')}
              </button>
            </div>
          ) : poster ? (
            <div className={styles.posterDetailContainer}>
              <PosterDisplay poster={poster} />
              
              {/* Additional poster details */}
              <div className={styles.additionalDetails}>
                <h2>{getContent('posters.additionalDetails', 'Additional Details')}</h2>
                
                <div className={styles.detailsGrid}>
                  {poster.dimensions && (
                    <div className={styles.detailItem}>
                      <h3>{getContent('posters.dimensions', 'Dimensions')}</h3>
                      <p>{`${poster.dimensions.width} × ${poster.dimensions.height} ${poster.dimensions.unit}`}</p>
                    </div>
                  )}
                  
                  {poster.printOptions && (
                    <div className={styles.detailItem}>
                      <h3>{getContent('posters.printOptions', 'Print Options')}</h3>
                      <ul className={styles.optionsList}>
                        {poster.printOptions.paperTypes?.map((type, index) => (
                          <li key={`paper-${index}`}>{type}</li>
                        ))}
                        {poster.printOptions.finishOptions?.map((option, index) => (
                          <li key={`finish-${index}`}>{option}</li>
                        ))}
                        {poster.printOptions.framingAvailable && (
                          <li>{getContent('posters.framingAvailable', 'Framing Available')}</li>
                        )}
                      </ul>
                    </div>
                  )}
                  
                  {poster.tags && poster.tags.length > 0 && (
                    <div className={styles.detailItem}>
                      <h3>{getContent('posters.tags', 'Tags')}</h3>
                      <div className={styles.tagsList}>
                        {poster.tags.map((tag, index) => (
                          <span key={`tag-${index}`} className={styles.tag}>{tag}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className={styles.errorContainer}>
              <p>{getContent('posters.notFound', 'Poster not found')}</p>
              <button 
                onClick={() => router.push('/posters')}
                className={styles.browseButton}
              >
                {getContent('posters.browseOtherPosters', 'Browse Other Posters')}
              </button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}