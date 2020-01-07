import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { VenueFormPage } from './venue-form.page';

const routes: Routes = [
  {
    path: '',
    component: VenueFormPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class VenueFormPageRoutingModule {}
