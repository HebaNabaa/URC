import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WastePreventionComponent } from './waste-prevention.component';

describe('WastePreventionComponent', () => {
  let component: WastePreventionComponent;
  let fixture: ComponentFixture<WastePreventionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WastePreventionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WastePreventionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
