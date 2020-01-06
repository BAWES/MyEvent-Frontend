import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { LandingPage } from './landing.page';
import { LoginPage } from '../login/login.page';
import { LoginPageModule } from '../login/login.module';
import { FormsModule } from '@angular/forms';
import { RegisterPage } from '../register/register.page';
import { RegisterPageModule } from '../register/register.module';
import { TranslateModule } from '@ngx-translate/core';

const routes: Routes = [
  {
    path: '',
    component: LandingPage
  }
];

@NgModule({
  entryComponents: [
    LandingPage,
    LoginPage,
    RegisterPage
  ],
  imports: [
    RegisterPageModule,
    LoginPageModule,
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule.forChild(),
    RouterModule.forChild(routes)
  ],
  declarations: [
    LandingPage
  ]
})
export class LandingPageModule {}
