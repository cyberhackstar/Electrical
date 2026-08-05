import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-star-rating',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './star-rating.component.html',
})
export class StarRatingComponent {
  @Input() rating = 0;
  @Input() count: number | null = null;
  @Input() size: 'sm' | 'md' = 'sm';

  get stars(): number[] {
    return [1, 2, 3, 4, 5];
  }

  fillPercent(star: number): number {
    const diff = this.rating - (star - 1);
    if (diff >= 1) return 100;
    if (diff <= 0) return 0;
    return Math.round(diff * 100);
  }
}
