import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

export interface NameplateSpec {
  label: string;
  value: string;
}

/**
 * Styled after the stamped metal rating plate found on motors, panels, and appliances
 * (the one that reads VOLTAGE / CURRENT / FREQUENCY / RATING). Used both decoratively
 * (hero section) and functionally (product spec display on the PDP).
 */
@Component({
  selector: 'app-nameplate',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './nameplate.component.html',
})
export class NameplateComponent {
  @Input() title = 'ELECTROMART';
  @Input() subtitle = '';
  @Input() specs: NameplateSpec[] = [];
}
