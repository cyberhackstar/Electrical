import { Component, OnInit, inject } from '@angular/core';
import { SeoService } from '../../../core/services/seo.service';

@Component({
  selector: 'app-privacy-policy',
  standalone: true,
  templateUrl: './privacy-policy.component.html',
})
export class PrivacyPolicyComponent implements OnInit {
  private seoService = inject(SeoService);

  ngOnInit(): void {
    this.seoService.updateMetaTags({
      title: 'Privacy Policy',
      description: 'How ElectroMart collects, uses, and protects your personal information.',
      url: '/privacy-policy',
    });
  }
}
