import { Component, OnInit, inject } from '@angular/core';
import { SeoService } from '../../../core/services/seo.service';

@Component({
  selector: 'app-shipping-policy',
  standalone: true,
  templateUrl: './shipping-policy.component.html',
})
export class ShippingPolicyComponent implements OnInit {
  private seoService = inject(SeoService);

  ngOnInit(): void {
    this.seoService.updateMetaTags({
      title: 'Shipping & Returns',
      description: 'ElectroMart shipping timelines, charges, and return policy.',
      url: '/shipping-policy',
    });
  }
}
