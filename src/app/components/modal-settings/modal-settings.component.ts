import { Component } from '@angular/core';
import { StateService } from '../../shared/services/state.service';

@Component({
  selector: 'app-modal-settings',
  standalone: true,
  imports: [],
  templateUrl: './modal-settings.component.html',
  styleUrl: './modal-settings.component.scss',
})
export class ModalSettingsComponent {
  // ANCHOR: Constructor
  constructor(public stateSvc: StateService) {}
}
