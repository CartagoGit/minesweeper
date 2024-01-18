import { Component, computed, untracked } from '@angular/core';
import { StateService } from '../../shared/services/state.service';
import { CommonModule } from '@angular/common';
import { LocalStorageService } from '../../shared/services/local-storage.service';

@Component({
  selector: 'app-modal-settings',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal-settings.component.html',
  styleUrl: './modal-settings.component.scss',
})
export class ModalSettingsComponent {
  // ANCHOR : Properties
  public isValidForm = computed(() => {
    const {
      minTable: { cols: minCols, rows: minRows },
      maxTable: { cols: maxCols, rows: maxRows },
      minBombs,
      maxBombs: sigMaxBombs,
      bombs: signBombs,
      sizeTable: signSizeTable,
    } = this.stateSvc;
    const maxBombs = sigMaxBombs();
    const bombs = signBombs();
    const { rows, cols } = signSizeTable();
    const size = rows * cols;
    if (size <= 1) return false;
    if (rows < minRows || cols < minCols || bombs < minBombs) return false;
    if (rows > maxRows || cols > maxCols || bombs > maxBombs) return false;
    if (size <= bombs) return false;
    return true;
  });

  private _initValues = computed(() => {
    const { rows, cols } = untracked(this.stateSvc.sizeTable);
    const bombs = untracked(this.stateSvc.bombs);
    return { rows, cols, bombs };
  });

  // ANCHOR: Constructor
  constructor(
    public stateSvc: StateService,
    private _localStorageSvc: LocalStorageService
  ) {}

  // ANCHOR: Methods
  private _limitLength(event: Event): string {
    const target = event.target as HTMLInputElement;
    target.value = target.value.slice(0, 3);
    const { value } = target;
    return value;
  }

  public changeRows(event: Event): void {
    const value = this._limitLength(event);
    this.stateSvc.sizeTable.set({ ...this.stateSvc.sizeTable(), rows: +value });
  }

  public changeCols(event: Event): void {
    const value = this._limitLength(event);
    this.stateSvc.sizeTable.set({ ...this.stateSvc.sizeTable(), cols: +value });
  }

  public changeBombs(event: Event): void {
    const value = this._limitLength(event);
    this.stateSvc.bombs.set(+value);
  }

  public saveChanges(): void {
    if (!this.isValidForm()) return;
    this._localStorageSvc.saveBombs(this.stateSvc.bombs());
    this._localStorageSvc.saveTableSize(this.stateSvc.sizeTable());
    this.stateSvc.showModal.set(false);
    this.stateSvc.startGame();
  }

  public cancelChanges(): void {
    const { rows, cols, bombs } = this._initValues();
    this.stateSvc.sizeTable.set({ rows, cols });
    this.stateSvc.bombs.set(bombs);
    this.stateSvc.showModal.set(false);
  }

  public defaultBombs(): void {
    this.stateSvc.bombs.set(this.stateSvc.getDefaultBombs());
  }

  public defaultSize(): void {
    const { rows, cols } = this.stateSvc.defaultSize;
    this.stateSvc.sizeTable.set({ rows, cols });
  }
}
