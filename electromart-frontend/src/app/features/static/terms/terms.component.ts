import { Component, OnInit, inject } from '@angular/core';
import { SeoService } from '../../../core/services/seo.service';

@Component({
  selector: 'app-terms',
  standalone: true,
  templateUrl: './terms.component.html',
})
export class TermsComponent implements OnInit {
  private seoService = inject(SeoService);

  ngOnInit(): void {
    this.seoService.updateMetaTags({
      title: 'Terms of Service',
      description: 'Terms and conditions for using ElectroMart and purchasing products.',
      url: '/terms',
    });
  }
}
