import React from 'react';
import styles from './Footer.module.css';

interface FooterProps {
  className?: string;
}

const Footer: React.FC<FooterProps> = ({ className }) => {
  return (
    <footer className={`${styles.footer} ${className ?? ''}`} role="contentinfo">
      <div className={styles.inner}>
        {/* 회사 정보 */}
        <section className={styles.col} aria-labelledby="footer-company">
          <h3 id="footer-company" className={styles.head}>
            테킷
          </h3>
          <address className={styles.text}>
            팀원 소개?
            <br />
            팀원1
            <br />
            팀원2
          </address>
          <p className={styles.copy}>© 2025 Tekcit Project. All rights reserved.</p>
        </section>

        <section className={styles.col} aria-labelledby="footer-cs">
          <h3 id="footer-cs" className={styles.head}>
            제출 문서 링크?
          </h3>
          <ul className={styles.list}>
            <li className={styles.text}>문서
                {' '}
              |{' '}
              <a href="#" className={styles.link}>
                링크
              </a>
            </li>
          </ul>
        </section>
      </div>
    </footer>
  );
};

export default Footer;
