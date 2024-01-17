import {
  ChangeDetectorRef,
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
  public minTable: ISizeTable = {
    rows: 1,
    cols: 1,
  };
  public maxTable: ISizeTable = {
    rows: 20,
    cols: 50,
  };
  public sizeTable: WritableSignal<ISizeTable> = signal(this.minTable);
  public table: WritableSignal<ICellState[][]> = signal([]);

  // Bombs
  private _minBombs = 1;
  public maxBombs = computed(() => {
    const { rows, cols } = this.sizeTable();
    return Math.floor(rows * cols - 1);
  });
  public bombs: WritableSignal<number> = signal(0);
  public flags = signal(0);
  private _diffBombsFlags = computed(() => this.bombs() - this.flags());
  public diffBombsFlags = computed(() => {
    const diff = this._diffBombsFlags();
    if (diff < 0) return `-${Math.abs(diff).toString().padStart(2, '0')}`;
    else return this._diffBombsFlags().toString().padStart(3, '0');
  });

  // Points
  public maxPoints = signal(0);
  public points = signal(0);
  public ratePoints = computed(() => {
    const { rows, cols } = this.sizeTable();
    const sizeRate = (rows * cols) / 10;
    const rate = Math.floor(this.bombs() / sizeRate);
    return rate;
  });

  // Timer
  private _maxTime = 999;
  private _gameTimeInt = signal(this._maxTime);
  public gameTime = computed(() =>
    this._gameTimeInt().toString().padStart(3, '0')
  );
  public inervalSubscription: Subscription | undefined = undefined;

  // Status
  public gameStatus: WritableSignal<IGameStatus> = signal('playing');
  public isClicking = signal(false);
  public isRightClicking = signal(false);
  public cdTable: ChangeDetectorRef | undefined = undefined;
  public cleanedCells = signal(0);
  public showModal = signal(true);

  // ANCHOR : Constructor
  constructor(private _localstorageSvc: LocalStorageService) {
    this._getDataFromLocalStorage();
    // MaxBombs effect
    effect(
      () => {
        const bombs = untracked(this.bombs);
        if (bombs > this.maxBombs() || bombs < this._minBombs)
          this.bombs.set(this._getDefaultBombs());
      },
      { allowSignalWrites: true }
    );

    // Won game
    effect(
      () => {
        if (this.cleanedCells() === 0) return;
        const { rows, cols } = untracked(this.sizeTable);
        if (this.cleanedCells() === rows * cols - untracked(this.bombs)) {
          this.stopGame('won');
        }
      },
      { allowSignalWrites: true }
    );

    // Time lost
    effect(
      () => {
        if (untracked(this.gameStatus) !== 'playing') return;
        if (this._gameTimeInt() <= 0) this.stopGame('lost');
      },
      { allowSignalWrites: true }
    );

    // Points
    effect(
      () => {
        if (untracked(this.gameStatus) !== 'playing') return;
        const rate = untracked(this.ratePoints);
        this.points.set(this.cleanedCells() * rate);
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
    const defaultSize = {
      rows: 10,
      cols: 10,
    };
    if (!size) return defaultSize;
    if (size.cols < this.minTable.cols || size.cols > this.maxTable.cols)
      size.cols = defaultSize.cols;
    if (size.rows < this.minTable.rows || size.rows > this.maxTable.rows)
      size.rows = defaultSize.rows;
    return size;
  }

  private _getDefaultBombs(): number {
    const { rows, cols } = this.sizeTable();
    return Math.floor((rows * cols) / 5) || 1;
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

  public startGame(): void {
    this.gameStatus.set('playing');
    this._gameTimeInt.set(this._maxTime);
    this.points.set(0);
    this.table.set(this._createTable());
    this.flags.set(0);
    this.cleanedCells.set(0);

    this.inervalSubscription = interval(1000).subscribe(() =>
      this._gameTimeInt.set(this._gameTimeInt() - 1)
    );
  }

  public async stopGame(newStatus: IGameStatus): Promise<void> {
    this.gameStatus.set(newStatus);
    this.inervalSubscription?.unsubscribe();
    this.inervalSubscription = undefined;
    if (newStatus === 'won') {
      const playedPoints = this.points();
      const totalPoints =
        playedPoints + this._gameTimeInt() * this.ratePoints();
      this.points.set(totalPoints);
    }
    if (this.points() > this.maxPoints()) {
      this.maxPoints.set(this.points());
      this._localstorageSvc.saveMaxPoint(this.maxPoints());
    }
    if (newStatus === 'won') return;

    // Delay to show table slowly
    const delayTime = 1;
    for (let row of this.table()) {
      for (let cell of row) {
        if (cell.state === 'visible') continue;
        await new Promise((resolve) => setTimeout(resolve, delayTime));
        cell.state = 'visible';
        this.cdTable?.detectChanges();
      }
    }
  }

  public showNearCells(position: IPosition): void {
    const { rows, cols } = this.sizeTable();
    const { row, col } = position;
    let table = this.table();
    let cell = table[row][col];
    if (cell.state === 'visible') return;
    this.cleanedCells.set(this.cleanedCells() + 1);
    cell.state = 'visible';
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
}
