import { Injectable } from '@angular/core';
import { ISizeTable } from '../interfaces/game.interface';

@Injectable({
  providedIn: 'root',
})
export class LocalStorageService {
  // ANCHOR : Properties

  // ANCHOR : Constructor
  constructor() {}

  // ANCHOR : Methods
  public saveMaxPoint(maxPoints: number | string): void {
    localStorage.setItem('maxPoints', maxPoints.toString());
  }
  public getMaxPoint(): number | null {
    const maxPoints = localStorage.getItem('maxPoints');
    if (maxPoints) return Number(maxPoints);
    return null;
  }

  public saveTableSize(size: ISizeTable): void {
    localStorage.setItem('tableSize', JSON.stringify(size));
  }

  public getTableSize(): ISizeTable | null {
    const size = localStorage.getItem('tableSize');
    if (size) return JSON.parse(size);
    return null;
  }

  public saveBombs = (bombs: number): void => {
    localStorage.setItem('bombs', bombs.toString());
  };

  public getBombs = (): number | null => {
    const bombs = localStorage.getItem('bombs');
    if (bombs) return Number(bombs);
    return null;
  };
}
