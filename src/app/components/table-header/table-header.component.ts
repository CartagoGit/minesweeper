import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
} from '@angular/core';
import { StateService } from '../../shared/services/state.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-table-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './table-header.component.html',
  styleUrl: './table-header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableHeaderComponent {
  // ANCHOR : Constructor
  constructor(public stateSvc: StateService, private _cd: ChangeDetectorRef) {}

  // ANCHOR : Methods
  public clickFace(): void {
    if (this.stateSvc.gameStatus() === 'playing')
      this.stateSvc.stopGame('stoped');
    else this.stateSvc.startGame();
  }
}
