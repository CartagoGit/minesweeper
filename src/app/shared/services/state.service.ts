import { Injectable, WritableSignal, computed, signal } from '@angular/core';
import {
  ICellState,
  IGameStatus,
  ISizeTable,
} from '../interfaces/game.interface';
import { Subscription, interval } from 'rxjs';
import { LocalStorageService } from './local-storage.service';

@Injectable({
  providedIn: 'root',
})
export class StateService {
  // ANCHOR : Properties
  public readonly title = "Cartago's Minesweeper";

  // Table
  private _minTable: ISizeTable = {
    rows: 5,
    cols: 5,
  };
  public sizeTable!: WritableSignal<ISizeTable>;
  public table: WritableSignal<ICellState[][]> = signal([]);

  // Bombs
  private _minBombs = 1;
  private _maxBombs = computed(() => {
    const { rows, cols } = this.sizeTable();
    const maxBombs = Math.floor(rows * cols - 1);
    if (this.bombs() > maxBombs || this.bombs() < this._minBombs)
      this.bombs.set(this._getDefaultBombs());
    return Math.floor(rows * cols - 1);
  });
  public bombs!: WritableSignal<number>;

  // Points
  public maxPoints = signal(0);
  public points = signal(0);

  // Timer
  private _gameTimeInt = signal(0);
  public gameTime = computed(() =>
    this._gameTimeInt().toString().padStart(3, '0')
  );
  public inervalSubscription: Subscription | undefined = undefined;

  // Status
  public gameStatus: IGameStatus = 'paused';

  // ANCHOR : Constructor
  constructor(private _localstorageSvc: LocalStorageService) {
    this._getDataFromLocalStorage();
    this.table.set(this._createTable());
  }
  // ANCHOR : Methods

  private _getDataFromLocalStorage(): void {
    this.maxPoints.set(this._localstorageSvc.getMaxPoint() || 0);
    this.sizeTable.set(
      this._getValidSizeTable(this._localstorageSvc.getTableSize())
    );
    this.bombs.set(this._localstorageSvc.getBombs() || this.bombs());
  }

  private _getValidSizeTable(size: ISizeTable | null): ISizeTable {
    if (!size)
      return {
        cols: 10,
        rows: 10,
      };
    if (size.cols < this._minTable.cols) size.cols = this._minTable.cols;
    if (size.rows < this._minTable.rows) size.rows = this._minTable.rows;
    return size;
  }

  private _getDefaultBombs(): number {
    const { rows, cols } = this.sizeTable();
    return Math.floor((rows * cols) / 3);
  }

  private _createTable(): ICellState[][] {
    const { rows, cols } = this.sizeTable();
    const table = new Array(rows)
      .fill([])
      .map(() =>
        new Array<ICellState>(cols).fill({ value: 'empty', state: 'hidden' })
      );
    let settedBombs = this.bombs();
    while (settedBombs > 0) {
      const randomRow = Math.floor(Math.random() * rows);
      const randomCol = Math.floor(Math.random() * cols);
      const cell = table[randomRow][randomCol];
      if (cell.value === 'empty') {
        table[randomRow][randomCol] = { ...cell, value: 'bomb' };
        settedBombs--;
      }
    }
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        if (table[row][col].value === 'bomb') continue;
        let counter = 0;
        for (let i = row - 1; i <= row + 1; i++) {
          for (let j = col - 1; j <= col + 1; j++) {
            if (i < 0 || i >= rows || j < 0 || j >= cols) continue;
            if (table[i][j].value === 'bomb') counter++;
          }
        }
        table[row][col] = { ...table[row][col], value: counter };
      }
    }
    return table;
  }

  public startGame(): void {
    this.gameStatus = 'playing';

    this.inervalSubscription = interval(1000).subscribe(() =>
      this._gameTimeInt.set(this._gameTimeInt() + 1)
    );
  }

  public stopGame(): void {
    this.inervalSubscription?.unsubscribe();
    this._gameTimeInt.set(0);
    if (this.points > this.maxPoints) {
      this.maxPoints = this.points;
      this._localstorageSvc.saveMaxPoint(this.maxPoints());
    }
    this.inervalSubscription = undefined;
    this.points.set(0);
    this.table.set(this._createTable());
  }

  public resetStatus(): void {
    this.gameStatus = 'paused';
    this.stopGame();
  }
}
