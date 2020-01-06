import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LandingPopPage } from './landing-pop.page';

describe('LandingPopPage', () => {
  let component: LandingPopPage;
  let fixture: ComponentFixture<LandingPopPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LandingPopPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LandingPopPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
