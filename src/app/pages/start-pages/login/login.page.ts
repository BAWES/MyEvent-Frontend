import { Component, OnInit, Optional } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Platform, AlertController, Events, NavController, ModalController, IonNav } from '@ionic/angular';
import { Storage } from '@ionic/storage';
// services
import { AuthService } from 'src/app/services/auth.service';
// pages
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';


@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  public loginForm: FormGroup;

  public type = 'password';

  public showPass = false;
  // Disable submit button if loading response
  public isLoading = false;


  // Store number of invalid password attempts to suggest reset password
  public _numberOfLoginAttempts = 0;

  public loading = false;

  public authSubscription: Subscription;

  constructor(
    public _fb: FormBuilder,
    public events: Events,
    public _auth: AuthService,
    public router: Router,
    public _alertCtrl: AlertController,
    public _platform: Platform,
    public storage: Storage,
    @Optional() public nav: IonNav,//for testing perpose 
    public modalCtrl: ModalController
  ) {
    // Initialize the Login Form
    this.loginForm = this._fb.group({
      email: ['', [Validators.required]],
      password: ['', Validators.required]
    });
  }

  ngOnInit() { } 

  ngOnDestroy() {
    if(!!this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  ionViewWillLeave() {
    this.loading = false;
  }
  
  ionViewDidEnter() {
    if (this._auth.isLogin) {
      this.router.navigate(['']);
    }
  }


  /**
   * Attempts to login with the provided email and password
   */
  async onSubmit() {
    if (!this.loginForm.valid) {
      return false;
    }

    this.isLoading = true;

    const email = this.loginForm.value.email;
    const password  = this.loginForm.value.password;

    this.authSubscription = this._auth.basicAuth(email, password).subscribe(res => {

      this.isLoading = false;

      if (res.operation == 'success') {
        
        // Successfully logged in, set the access token within AuthService
        this._auth.setAccessToken(res, 'view');

        this.router.navigate(['']);
      }else if (res.operation == 'error' && res.errorType == 'email-not-verified') {
        this._alertCtrl.create({
          header: 'Unable to Log In',
          message: res.message,
          buttons: ['ok'],
        }).then(alert => alert.present());
      } else {
        this._alertCtrl.create({
          header: 'Unable to Log In',
          message: res.message,
          buttons: ['ok'],
        }).then(alert => alert.present());
      }

    }, err => this.handleLoginError(err));
  }

  /**
   * Handle login error
   * @param err
   */
  async handleLoginError(err) {
    
    // const TryAgain = this.translateService.transform('Try Again');
    // const TroubleLogin = this.translateService.transform('Trouble Logging In?');
    // const InvalidLogin = this.translateService.transform('Invalid login credential');
    // const IncorrectInfo = this.translateService.transform('The information entered is incorrect. Please try again.');
    // const ForgottenPass = this.translateService.transform('If you\'ve forgotten your password, contact us to have it reset.');
    // const ServerIssue = this.translateService.transform('There seems to be an issue connecting to servers.');
    // const ok = this.translateService.transform('ok');
    // const UnableLogin = this.translateService.transform('Unable to Log In');

    this.isLoading = false;

    // Incorrect email or password
    if (err.status == 401) {
      this._numberOfLoginAttempts++;

      // Check how many login attempts this user made, offer to reset password
      if (this._numberOfLoginAttempts > 2) {
        const alert = await this._alertCtrl.create({
          header: 'Trouble Logging In?',
          message: 'If you\'ve forgotten your password, contact us to have it reset.',
          buttons: ['ok'],
        });
        alert.present();
      } else {
        const alert = await this._alertCtrl.create({
          header: 'Invalid login credential',
          message: 'The information entered is incorrect. Please try again.',
          buttons: ['Try Again'],
        });
        alert.present();
      }
    } else {
      /**
       * Error not accounted for. Show Message
       */
      const alert = await this._alertCtrl.create({
        header: 'Unable to Log In',
        message: 'There seems to be an issue connecting to servers.',
        buttons: ['ok'],
      });
      alert.present();
    }
  }


  /**
   * Toggle password visibility for password field
   */
  showPassword() {
    this.showPass = !this.showPass;

    if (this.showPass) {
      this.type = 'text';
    } else {
      this.type = 'password';
    }
  }
}
