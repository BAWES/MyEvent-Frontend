import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { VenueFormPageRoutingModule } from './venue-form-routing.module';

import { VenueFormPage } from './venue-form.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    VenueFormPageRoutingModule
  ],
  declarations: [VenueFormPage]
})
export class VenueFormPageModule {}
