import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
} from '@angular/core';
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
  constructor(public stateSvc: StateService, private _cd: ChangeDetectorRef) {
    this.stateSvc.cdTable = this._cd;
  }

  ngOnInit(): void {
    this.stateSvc.startGame();
  }

  // ANCHOR : Methods
  public clickCell(position: IPosition): void {
    if (this.stateSvc.gameStatus() !== 'playing') return;
    const { row, col } = position;
    const table = this.stateSvc.table();
    const cell = table[row][col];
    if(cell.state !== 'hidden') return;
    if (cell.value === 'empty') this.stateSvc.showNearCells(position);
    else if (cell.value === 'bomb') {
      cell.value = 'explosion';
      this.stateSvc.stopGame('lost');
    } else {
      cell.state = 'visible';
      this.stateSvc.cleanedCells.set(this.stateSvc.cleanedCells() + 1);
    }
  }

  public clickRightCell(
    position: IPosition & {
      event: MouseEvent;
    }
  ): void {
    const { row, col, event } = position;
    event.preventDefault();
    if (this.stateSvc.gameStatus() !== 'playing') return;
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
