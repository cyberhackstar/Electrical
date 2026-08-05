import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { SeoService } from '../../../core/services/seo.service';

interface FaqItem {
  question: string;
  answer: string;
}

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './faq.component.html',
})
export class FaqComponent implements OnInit {
  private seoService = inject(SeoService);

  openIndex = signal<number | null>(0);

  readonly faqs: FaqItem[] = [
    {
      question: 'Are your products genuine?',
      answer: 'Yes. Every product is sourced directly from authorized distributors — never grey-market imports or unmarked repacks. What\'s on the rating plate is what you get.',
    },
    {
      question: 'How fast is delivery?',
      answer: 'Orders placed before 3 PM ship the same day. Most metro cities receive delivery within 2-4 business days; other regions may take a little longer.',
    },
    {
      question: 'Do you offer Cash on Delivery?',
      answer: 'Yes, COD is available for orders up to ₹50,000. Orders above that value require online payment via Razorpay (UPI, cards, netbanking, or wallets).',
    },
    {
      question: 'What is your return policy?',
      answer: 'Unused items in original packaging can be returned within 7 days of delivery. Electrical items showing signs of installation or use cannot be returned for safety reasons — see our Shipping & Returns page for details.',
    },
    {
      question: 'Do you offer bulk pricing for contractors?',
      answer: 'Yes. Electricians and contractors ordering in bulk get tiered pricing. Reach out to sales@electromart.com with your requirements.',
    },
    {
      question: 'How do I track my order?',
      answer: 'Once logged in, go to My Orders to see real-time status — Placed, Confirmed, Packed, Shipped, and Delivered.',
    },
  ];

  ngOnInit(): void {
    this.seoService.updateMetaTags({
      title: 'Frequently Asked Questions',
      description: 'Answers to common questions about ElectroMart orders, shipping, returns, and bulk pricing.',
      url: '/faq',
    });

    this.seoService.setJsonLd({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: this.faqs.map(f => ({
        '@type': 'Question',
        name: f.question,
        acceptedAnswer: { '@type': 'Answer', text: f.answer },
      })),
    }, 'jsonld-faq');
  }

  toggle(index: number): void {
    this.openIndex.set(this.openIndex() === index ? null : index);
  }
}
