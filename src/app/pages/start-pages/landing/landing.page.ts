import { Component, OnInit } from '@angular/core';
import { Platform, Events, ModalController, NavController, IonNav, AlertController } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
//pages
import { LoginPage } from '../login/login.page';
import { AuthService } from 'src/app/services/auth/auth.service';
import { RegisterPage } from '../register/register.page';
import { TranslateLabelService } from 'src/app/services/translate-label/translate-label.service';


@Component({
  selector: 'app-landing',
  templateUrl: './landing.page.html',
  styleUrls: ['./landing.page.scss']
})
export class LandingPage implements OnInit {

  //Loading indicator
  public loading: boolean = false;
  public googleLoading: boolean = false;

  constructor(
    public authService: AuthService,
    public _platform: Platform,
    public _alertCtrl: AlertController,
    public _events: Events,
    public nav: IonNav,
    public modalCtrl: ModalController,
    public route: ActivatedRoute,
    public translate: TranslateLabelService,
    public router: Router
  ) { }

  ngOnInit() { }

  /**
   * Display register page 
   */
  register() {
    this.nav.push(RegisterPage)
  }

  /**
   * Proceed with Authorizing Google
   */
  googleLogin() {
    this.googleLoading = true;

    if (this._platform.is('hybrid')) {
      // login with google on  mobile devices
      this.nativeGoogleLogin();
    } else {
      // login with google on  desktop 
      this.webGoogleLogin();
    }
  }

  /**
   *  Native Google Login Options
   */
  async nativeGoogleLogin(){

    this.authService.nativeGoogleLogin().then(async (response) => {
      this.googleLoading = false;

      if (response)
        this.dismiss();
        
    }).catch(async err =>{

      const alert = await this._alertCtrl.create({
        message: err.message,
        buttons: [this.translate.transform('OK')],
      });
      await alert.present();
    })

  }

  /**
   * login with google on desktop
   */
  async webGoogleLogin() {
    
    try {
      this.authService.webGoogleLogin().then(async (response) => {
        this.googleLoading = false;
        
        if (response)
          this.dismiss();
      })

    } catch (err) {
      const alert = await this._alertCtrl.create({
        message: err.message,
        buttons: [this.translate.transform('OK')],
      });
      await alert.present();
      this.googleLoading = false;
    }
  }

  /**
   * Open login page 
   */
  loginByEmail() {
    this.nav.push(LoginPage);
  }

  /**
   * Goto previous page 
   */
  dismiss() {
    this.modalCtrl.dismiss();
  }
}
