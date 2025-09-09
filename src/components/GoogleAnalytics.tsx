import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Google Analytics tracking ID - replace with your actual GA4 ID
const GA_TRACKING_ID = 'G-XXXXXXXXXX'; // Replace with your actual GA4 tracking ID

// Initialize Google Analytics
export const initGA = () => {
  // Add Google Analytics script
  const script1 = document.createElement('script');
  script1.async = true;
  script1.src = `https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`;
  document.head.appendChild(script1);

  // Add gtag configuration
  const script2 = document.createElement('script');
  script2.innerHTML = 
    `window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${GA_TRACKING_ID}', {
      page_title: document.title,
      page_location: window.location.href,
    });`;
  document.head.appendChild(script2);
};

// Track page views
export const trackPageView = (url: string, title: string) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('config', GA_TRACKING_ID, {
      page_title: title,
      page_location: url,
    });
  }
};

// Track custom events
export const trackEvent = (action: string, category: string, label?: string, value?: number) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

// Track service interactions
export const trackServiceInteraction = (serviceType: string, action: string, details?: any) => {
  trackEvent(action, 'Service Interaction', `${serviceType}${details ? ` - ${details}` : ''}`);
};

// Track user engagement
export const trackUserEngagement = (engagementType: string, details?: string) => {
  trackEvent(engagementType, 'User Engagement', details);
};

// Component to automatically track page views
const GoogleAnalytics = () => {
  const location = useLocation();

  useEffect(() => {
    // Initialize GA on first load
    const gaScript = "script[src*='googletagmanager.com/gtag/js?id=" + GA_TRACKING_ID + "']";
    if (!document.querySelector(gaScript)) {
      initGA();
    }
  }, []);

  useEffect(() => {
    // Track page view on route change
    const pageTitle = document.title;
    const pageUrl = window.location.href;
    trackPageView(pageUrl, pageTitle);
  }, [location]);

  return null; // This component doesn't render anything
};

export default GoogleAnalytics;
