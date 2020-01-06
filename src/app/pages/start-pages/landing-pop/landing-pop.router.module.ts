import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { LandingPopPage } from './landing-pop.page';


const routes: Routes = [
    {
        path: 'landing-pop',
        component: LandingPopPage,
    }];

@NgModule({
    imports: [
        RouterModule.forChild(routes)
    ],
    exports: [RouterModule]
})
export class LandingPopRoutingModule { } 