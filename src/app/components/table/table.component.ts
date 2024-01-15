import { ChangeDetectionStrategy, Component } from '@angular/core';
import { StateService } from '../../shared/services/state.service';
import { CommonModule } from '@angular/common';

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
  public clickCell(data: { row: number; col: number }): void {
    const { row, col } = data;
    this.stateSvc.table()[row][col].state = 'visible';
  }

  public clickRightCell(data: { row: number; col: number, event: MouseEvent }): void {
    const { row, col, event } = data;
    event.preventDefault();
    const cell = this.stateSvc.table()[row][col];
    if (cell.state === 'hidden') cell.state = 'flag';
    else if (cell.state === 'flag') cell.state = 'question';
    else if (cell.state === 'question') cell.state = 'hidden';
  }
}
