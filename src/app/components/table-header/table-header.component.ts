import { ChangeDetectionStrategy, Component } from '@angular/core';
import { StateService } from '../../shared/services/state.service';

@Component({
  selector: 'app-table-header',
  standalone: true,
  imports: [],
  templateUrl: './table-header.component.html',
  styleUrl: './table-header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableHeaderComponent {
  constructor(public stateSvc: StateService) {}
}
