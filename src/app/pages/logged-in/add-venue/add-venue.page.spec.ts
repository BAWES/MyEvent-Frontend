import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { AddVenuePage } from './add-venue.page';

describe('AddVenuePage', () => {
  let component: AddVenuePage;
  let fixture: ComponentFixture<AddVenuePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddVenuePage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(AddVenuePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
