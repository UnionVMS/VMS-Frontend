import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TracksPanelComponent } from './tracks-panel.component';

describe('TracksPanelComponent', () => {
  let component: TracksPanelComponent;
  let fixture: ComponentFixture<TracksPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TracksPanelComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TracksPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
