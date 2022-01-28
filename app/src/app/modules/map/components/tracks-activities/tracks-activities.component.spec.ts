import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TracksActivitiesComponent } from './tracks-activities.component';

describe('TracksActivitiesComponent', () => {
  let component: TracksActivitiesComponent;
  let fixture: ComponentFixture<TracksActivitiesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TracksActivitiesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TracksActivitiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
