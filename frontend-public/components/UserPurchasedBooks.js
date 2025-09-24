import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import styles from '../styles/UserPurchasedBooks.module.css';
import { useTranslations } from 'next-intl';

const UserPurchasedBooks = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const t = useTranslations('common');
  
  const [purchasedBooks, setPurchasedBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    // Redirect to login if not authenticated
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/account/purchases');
      return;
    }
    
    if (status === 'authenticated' && session?.user?.id) {
      fetchUserPurchases();
    }
  }, [status, session]);
  
  const fetchUserPurchases = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/purchased-books?userId=${session.user.id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch purchase history');
      }
      
      const data = await response.json();
      setPurchasedBooks(data.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending':
        return styles.statusPending;
      case 'processing':
        return styles.statusProcessing;
      case 'shipped':
        return styles.statusShipped;
      case 'delivered':
        return styles.statusDelivered;
      default:
        return styles.statusPending;
    }
  };
  
  if (status === 'loading') {
    return <div className={styles.loading}>{t('loading')}</div>;
  }
  
  if (error) {
    return <div className={styles.error}>{error}</div>;
  }
  
  return (
    <div className={styles.purchasedBooksContainer}>
      <h2 className={styles.title}>{t('myPurchases')}</h2>
      
      {loading ? (
        <div className={styles.loading}>{t('loading')}</div>
      ) : purchasedBooks.length === 0 ? (
        <div className={styles.emptyState}>
          <p>{t('noPurchasesYet')}</p>
          <button 
            className={styles.browseButton}
            onClick={() => router.push('/books')}
          >
            {t('browseBooks')}
          </button>
        </div>
      ) : (
        <div className={styles.purchasesList}>
          {purchasedBooks.map((purchase) => (
            <div key={purchase._id} className={styles.purchaseCard}>
              <div className={styles.orderHeader}>
                <div>
                  <span className={styles.orderLabel}>{t('orderNumber')}: </span>
                  <span className={styles.orderNumber}>{purchase.orderId}</span>
                </div>
                <div className={styles.orderDate}>
                  {new Date(purchase.createdAt).toLocaleDateString()}
                </div>
              </div>
              
              <div className={styles.statusContainer}>
                <span className={styles.statusLabel}>{t('status')}: </span>
                <span className={`${styles.statusBadge} ${getStatusBadgeClass(purchase.shipping?.status)}`}>
                  {t(purchase.shipping?.status || 'pending')}
                </span>
              </div>
              
              <div className={styles.booksContainer}>
                {purchase.books.map((book) => (
                  <div key={book._id} className={styles.bookItem}>
                    <div className={styles.bookInfo}>
                      <h4>{book.title}</h4>
                      <p>
                        <span className={styles.quantity}>{t('quantity')}: {book.quantity}</span>
                        <span className={styles.price}>{t('price')}: RM {book.price.toFixed(2)}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className={styles.totalContainer}>
                <span className={styles.totalLabel}>{t('total')}: </span>
                <span className={styles.totalAmount}>RM {purchase.totals.total.toFixed(2)}</span>
              </div>
              
              {purchase.shipping?.trackingNumber && (
                <div className={styles.trackingContainer}>
                  <span className={styles.trackingLabel}>{t('trackingNumber')}: </span>
                  <span className={styles.trackingNumber}>{purchase.shipping.trackingNumber}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserPurchasedBooks;