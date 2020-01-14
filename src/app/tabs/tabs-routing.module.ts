import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'home',
        children: [
          {
            path: '',
            loadChildren: () =>
              import('../tab1/tab1.module').then(m => m.Tab1PageModule)
          }
        ]
      },
      {
        path: 'add-venue',
        children: [
          {
            path: '',
            loadChildren: () =>
              import('../pages/logged-in/venue-form/venue-form.module').then(m => m.VenueFormPageModule)
          }
        ]
      },
      {
        path: 'profile',
        children: [
          {
            path: '',
            loadChildren: () =>
              import('../pages/logged-in/profile/profile.module').then(m => m.ProfilePageModule)
          }
        ]
      },
      {
        path: 'landing',
        children: [
          {
            path: '',
            loadChildren: () =>
              import('../pages/start-pages/landing/landing.module').then(m => m.LandingPageModule)
          },
          {
            path: '',
            loadChildren: () =>
              import('../pages/start-pages/login/login.module').then(m => m.LoginPageModule)
          },
          {
            path: '',
            loadChildren: () =>
              import('../pages/start-pages/register/register.module').then(m => m.RegisterPageModule)
          }
        ]
      },
      {
        path: '',
        redirectTo: '/tabs/home',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    redirectTo: '/tabs/home',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TabsPageRoutingModule {}
