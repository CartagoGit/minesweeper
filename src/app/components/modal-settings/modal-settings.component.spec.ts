import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalSettingsComponent } from './modal-settings.component';

describe('ModalSettingsComponent', () => {
  let component: ModalSettingsComponent;
  let fixture: ComponentFixture<ModalSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalSettingsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ModalSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
