
export type IGameStatus = 'playing' | 'won' | 'lost' | 'stoped';

export interface ISizeTable {
  rows: number;
  cols: number;
}

export interface IPosition {
  row: number;
  col: number;
}

export interface ICellState {
  value: number | 'bomb' | 'empty';
  state: 'visible' | 'hidden' | 'flag' | 'question';
}


