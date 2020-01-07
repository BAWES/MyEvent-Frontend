import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AddVenuePageRoutingModule } from './add-venue-routing.module';

import { AddVenuePage } from './add-venue.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AddVenuePageRoutingModule
  ],
  declarations: [AddVenuePage]
})
export class AddVenuePageModule {}
