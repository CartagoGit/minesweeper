import { Injectable } from '@angular/core';
import { IGameStatus } from '../interfaces/game.interface';

@Injectable({
  providedIn: 'root',
})
export class StateService {
  public readonly title = "Cartago's Minesweeper";
  public table = [];
  public maxPoints = 0;
  public points = 0;
  public gameStatus: IGameStatus = 'paused';

  constructor() {
    this._getDataFromLocalStorage();
  }

  private _getDataFromLocalStorage(): void {
    const maxPoints = localStorage.getItem('maxPoints');
    if (maxPoints) this.maxPoints = parseInt(maxPoints, 10);
  }
}
