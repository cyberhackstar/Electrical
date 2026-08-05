import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NameplateComponent, NameplateSpec } from '../../../shared/components/nameplate/nameplate.component';
import { SeoService } from '../../../core/services/seo.service';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [RouterLink, NameplateComponent],
  templateUrl: './about.component.html',
})
export class AboutComponent implements OnInit {
  private seoService = inject(SeoService);

  readonly specs: NameplateSpec[] = [
    { label: 'Founded', value: '2019' },
    { label: 'Products Listed', value: '3,000+' },
    { label: 'Orders Shipped', value: '50,000+' },
    { label: 'Cities Served', value: '400+' },
  ];

  ngOnInit(): void {
    this.seoService.updateMetaTags({
      title: 'About Us',
      description: 'Learn about ElectroMart — genuine electrical supplies sourced from authorized distributors, serving homes and contractors across India.',
      url: '/about',
    });
  }
}
