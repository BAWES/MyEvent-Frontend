import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { IonNav } from '@ionic/angular';


@Component({
  selector: 'app-landing-pop',
  templateUrl: './landing-pop.page.html',
  styleUrls: ['./landing-pop.page.scss'],
})
export class LandingPopPage implements OnInit {

  @ViewChild(IonNav) nav;

  @Input() activatedRoutePath;
  @Input() activatedRoutePathProps;

  constructor(
  ) { }

  ngOnInit() {
    this.nav.setRoot(this.activatedRoutePath, this.activatedRoutePathProps);
  }
}
