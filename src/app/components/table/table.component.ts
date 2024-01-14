import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [],
  templateUrl: './table.component.html',
  styleUrl: './table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableComponent {
  private _minTable = {
    x: 5,
    y: 5,
  };
  public table = { ...this._minTable };

  constructor() {}

  public createTable(data: { x: number; y: number }) {}
}
