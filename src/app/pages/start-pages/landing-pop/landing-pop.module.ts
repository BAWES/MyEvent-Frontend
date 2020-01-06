import { NgModule } from '@angular/core'; 

import { IonicModule } from '@ionic/angular';

import { LandingPopPage } from './landing-pop.page';
import { LandingPopRoutingModule } from './landing-pop.router.module';


@NgModule({
  imports: [ 
    IonicModule,
    LandingPopRoutingModule
  ],
  declarations: [
    LandingPopPage,
  ]
})
export class LandingPopPageModule {}
 