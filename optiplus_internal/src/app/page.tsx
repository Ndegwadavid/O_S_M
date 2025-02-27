'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import styles from './page.module.css';

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const totalSlides = 5;

  // Auto-rotate slides
  useEffect(() => {
    const slideInterval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }, 5000);
    
    return () => clearInterval(slideInterval);
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.heroSection}>
        {/* Image Slideshow */}
        <div className={styles.slideshow}>
          {[1, 2, 3, 4, 5].map((num, index) => (
            <div 
              key={num} 
              className={`${styles.slide} ${currentSlide === index ? styles.activeSlide : ''}`}
              style={{ backgroundImage: `url(/home/home${num}.png)` }}
            />
          ))}
          
          {/* Slide indicators */}
          <div className={styles.slideIndicators}>
            {[...Array(totalSlides)].map((_, index) => (
              <button 
                key={index} 
                className={`${styles.indicator} ${currentSlide === index ? styles.activeIndicator : ''}`}
                onClick={() => setCurrentSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
        
        {/* Glass overlay */}
        <div className={styles.glassOverlay}></div>
        
        <div className={styles.content}>
          <div className={styles.logo}>
            <Image 
              src="/logo.png" 
              alt="Optiplus Logo" 
              width={150} 
              height={50} 
              priority 
              className={styles.logoImage}
            />
          </div>
          <h1>OPTIPLUS</h1>
          <h2>Love your eyes</h2>
          <p>Free Eyecare Consultations, Eye examinations </p>
          
          <div className={styles.buttonContainer}>
            <Link href="/admin-login" className={styles.glassButton}>
              <span className={styles.btnIcon}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={styles.svgIcon}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </span>
              <span>Admin Portal</span>
            </Link>
            <Link href="/staff-login" className={styles.glassButton}>
              <span className={styles.btnIcon}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={styles.svgIcon}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </span>
              <span>Staff Access</span>
            </Link>
          </div>
        </div>
      </div>

      <section className={styles.showcaseSection}>
        <div className={styles.glassCard}>
          <h2>The OptiPlus Experience</h2>
          <div className={styles.showcaseContent}>
            <div className={styles.showcaseItem}>
              <div className={styles.glassCircle}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={styles.svgIcon}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              </div>
              <p>Seamless Integration</p>
            </div>
            
            <div className={styles.showcaseItem}>
              <div className={styles.glassCircle}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={styles.svgIcon}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <p>Lightning Fast</p>
            </div>
            
            <div className={styles.showcaseItem}>
              <div className={styles.glassCircle}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={styles.svgIcon}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <p>Enterprise Security</p>
            </div>
            
            <div className={styles.showcaseItem}>
              <div className={styles.glassCircle}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={styles.svgIcon}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <p>Smart Workflows</p>
            </div>
          </div>
        </div>
        
        <div className={styles.waveDecoration}></div>
      </section>
      
      <section className={styles.infoSection}>
        <div className={styles.infoContainer}>
          <div className={styles.glassInfoCard}>
            <h3>Unified Platform</h3>
            <p>Experience the revolution in optometry management with one powerful, intuitive interface.</p>
          </div>
          
          <div className={styles.glassInfoCard}>
            <h3>Cloud Powered</h3>
            <p>Access your business from anywhere with state-of-the-art scalable infrastructure</p>
          </div>
          
          <div className={styles.glassInfoCard}>
            <h3>Intelligent Design</h3>
            <p>OptiPlus adapts to how you work, not the other way around.</p>
          </div>
        </div>
      </section>
      
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerLogo}>
            <Image 
              src="/logo.png" 
              alt="Optiplus Logo" 
              width={100} 
              height={35} 
              className={styles.logoImage}
            />
            <p>Elevating Vision Care</p>
          </div>
          <div className={styles.footerLinks}>
            <a href="#">Help Center</a>
            <a href="#">Resources</a>
            <a href="#">Legal</a>
          </div>
        </div>
        <div className={styles.copyright}>
          © {new Date().getFullYear()} OptiPlus. All rights reserved.
        </div>
      </footer>
    </div>
  );
}