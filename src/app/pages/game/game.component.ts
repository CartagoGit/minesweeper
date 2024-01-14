import { ChangeDetectionStrategy, Component } from '@angular/core';
import { HeaderComponent } from './../../components/header/header.component';
import { TableComponent } from '../../components/table/table.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { StateService } from '../../shared/services/state.service';
import { TableHeaderComponent } from '../../components/table-header/table-header.component';

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [
    HeaderComponent,
    TableHeaderComponent,
    TableComponent,
    FooterComponent,
  ],
  templateUrl: './game.component.html',
  styleUrl: './game.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameComponent {
  constructor(public stateSvc: StateService) {}
}
