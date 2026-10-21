import { useTranslation } from 'react-i18next';
import styles from './Pagination.module.css';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

function Pagination({ currentPage, totalPages, onPageChange }) {
  const { t } = useTranslation();
  const pages = Array.from(
    { length: totalPages },
    (_, index) => index + 1
  );

  return (
    <div className={styles.pagination}>
      {/* Botón anterior */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={styles.navButton}
      >
        <FiChevronLeft />
        {t('reservations.previous')}
      </button>

      {/* Números */}
      {pages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`${styles.pageButton} ${
            currentPage === page ? styles.active : ''
          }`}
        >
          {page}
        </button>
      ))}

      {/* Botón siguiente */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={styles.navButton}
      >
        {t('reservations.next')}
        <FiChevronRight />
      </button>
    </div>
  );
}

export default Pagination;