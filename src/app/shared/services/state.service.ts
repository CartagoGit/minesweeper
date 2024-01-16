import {
  Injectable,
  WritableSignal,
  computed,
  effect,
  signal,
  untracked,
} from '@angular/core';
import {
  ICellState,
  IGameStatus,
  IPosition,
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
  public sizeTable: WritableSignal<ISizeTable> = signal(this._minTable);
  public table: WritableSignal<ICellState[][]> = signal([]);

  // Bombs
  private _minBombs = 1;
  private _maxBombs = computed(() => {
    const { rows, cols } = this.sizeTable();
    return Math.floor(rows * cols - 1);
  });
  public bombs: WritableSignal<number> = signal(0);

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
  public gameStatus: WritableSignal<IGameStatus> = signal('paused');

  // ANCHOR : Constructor
  constructor(private _localstorageSvc: LocalStorageService) {
    this._getDataFromLocalStorage();
    // MaxBombs effect
    effect(
      () => {
        const bombs = untracked(this.bombs);
        if (bombs > this._maxBombs() || bombs < this._minBombs)
          this.bombs.set(this._getDefaultBombs());
      },
      { allowSignalWrites: true }
    );
  }

  ngOnInit(): void {
    this.table.set(this._newEmptyTable());
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
    return Math.floor((rows * cols) / 5);
  }

  private _createTable(): ICellState[][] {
    const { rows, cols } = this.sizeTable();
    const table = this._newEmptyTable();
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
        table[row][col] = {
          ...table[row][col],
          value: counter ? counter : 'empty',
        };
      }
    }
    return table;
  }

  private _newEmptyTable(): ICellState[][] {
    const { rows, cols } = this.sizeTable();
    const table: ICellState[][] = new Array(rows)
      .fill([])
      .map(() =>
        new Array<ICellState>(cols).fill({ value: 'empty', state: 'hidden' })
      );
    return table;
  }

  // ANCHOR : Public Methods

  public resetGame(): void {
    this.stopGame('paused');
    this.table.set(this._newEmptyTable());
  }

  public startGame(): void {
    this.gameStatus.set('playing');
    this.table.set(this._createTable());

    this.inervalSubscription = interval(1000).subscribe(() =>
      this._gameTimeInt.set(this._gameTimeInt() + 1)
    );
  }

  public stopGame(newStatus: Omit<IGameStatus, 'playing'>): void {
    this.gameStatus.set(newStatus as IGameStatus);
    this.inervalSubscription?.unsubscribe();
    this.inervalSubscription = undefined;
    this._gameTimeInt.set(0);
    if (this.points() > this.maxPoints()) {
      this.maxPoints.set(this.points());
      this._localstorageSvc.saveMaxPoint(this.maxPoints());
    }
    this.points.set(0);
  }

  public showNearCells(position: IPosition): void {
    const { rows, cols } = this.sizeTable();
    const { row, col } = position;
    let table = this.table();
    let cell = table[row][col];
    if (cell.state === 'visible') return;
    cell.state = 'visible';
    this.asignTable({ row, col, ...cell });
    for (let i = row - 1; i <= row + 1; i++) {
      if (i < 0 || i >= rows) continue;
      for (let j = col - 1; j <= col + 1; j++) {
        if (j < 0 || j >= cols) continue;
        const nearCell = this.table()[i][j];
        if (nearCell.state === 'visible') continue;
        if (cell.value === 'empty') this.showNearCells({ row: i, col: j });
      }
    }
  }

  public asignTable(data: IPosition & ICellState): void {
    const { row, col, ...cell } = data;
    const table = this.table();
    table[row][col] = cell;
    this.table.set(table);
  }
}
