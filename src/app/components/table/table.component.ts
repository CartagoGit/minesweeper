import { ChangeDetectionStrategy, Component } from '@angular/core';
import { StateService } from '../../shared/services/state.service';
import { CommonModule } from '@angular/common';
import { IPosition } from '../../shared/interfaces/game.interface';

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './table.component.html',
  styleUrl: './table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableComponent {
  // ANCHOR : Constructor
  constructor(public stateSvc: StateService) {}

  ngOnInit(): void {
    this.stateSvc.startGame();
  }

  // ANCHOR : Methods
  public clickCell(position: IPosition): void {
    const { row, col } = position;
    const table = this.stateSvc.table();
    const cell = table[row][col];
    if (cell.value === 'empty') {
      this.stateSvc.showNearCells(position);
    } else {
      cell.state = 'visible';
    }
  }

  public clickRightCell(
    position: IPosition & {
      event: MouseEvent;
    }
  ): void {
    const { row, col, event } = position;
    event.preventDefault();
    const cell = this.stateSvc.table()[row][col];
    if (cell.state === 'hidden') {
      this.stateSvc.flags.set(this.stateSvc.flags() + 1);
      cell.state = 'flag';
    } else if (cell.state === 'flag') {
      this.stateSvc.flags.set(this.stateSvc.flags() - 1);
      cell.state = 'question';
    } else if (cell.state === 'question') cell.state = 'hidden';
  }
}
