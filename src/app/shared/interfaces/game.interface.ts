export type IGameStatus = 'playing' | 'won' | 'lost' | 'paused';

export interface ISizeTable {
  rows: number;
  cols: number;
}

export interface ICellState {
  value: number | 'bomb' | 'empty';
  state: 'visible' | 'hidden' | 'flag' | 'question';
}
