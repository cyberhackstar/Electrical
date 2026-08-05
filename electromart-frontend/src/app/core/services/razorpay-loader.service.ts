import { PLATFORM_ID, Injectable, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

declare global {
  interface Window {
    Razorpay: any;
  }
}

const SCRIPT_URL = 'https://checkout.razorpay.com/v1/checkout.js';

/** Loads the Razorpay Checkout script once, on demand, only in the browser (never during SSR). */
@Injectable({ providedIn: 'root' })
export class RazorpayLoaderService {
  private platformId = inject(PLATFORM_ID);
  private loadPromise: Promise<void> | null = null;

  load(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) {
      return Promise.reject('Razorpay can only be loaded in the browser');
    }

    if (window.Razorpay) {
      return Promise.resolve();
    }

    if (!this.loadPromise) {
      this.loadPromise = new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = SCRIPT_URL;
        script.onload = () => resolve();
        script.onerror = () => reject('Failed to load Razorpay checkout script');
        document.body.appendChild(script);
      });
    }

    return this.loadPromise;
  }
}
