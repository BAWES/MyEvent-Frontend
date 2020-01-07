import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { VenueFormPage } from './venue-form.page';

describe('VenueFormPage', () => {
  let component: VenueFormPage;
  let fixture: ComponentFixture<VenueFormPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VenueFormPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(VenueFormPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
