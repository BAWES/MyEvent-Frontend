import { Component, OnInit, ViewChild, Optional } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, Platform, Events, ModalController, IonNav, ToastController, NavController } from '@ionic/angular';
import { CustomValidator } from 'src/app/validators/custom.validator';
import { Storage } from '@ionic/storage';
import { Subscription } from 'rxjs';
//services
import { AuthService } from 'src/app/services/auth.service';


@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {

  // Disable submit button if loading response
  public isLoading: boolean = false;
  public type = 'password';
  public showPass = false;

  registerForm: FormGroup;
  submitAttempt: boolean = false;

  public createAccountSubscription: Subscription;

  @ViewChild('input', { static: true }) input;

  constructor(
    public route: ActivatedRoute,
    public _formService: FormBuilder,
    public _authService: AuthService,
    public navCtrl: NavController,
    public toastController: ToastController,
    public _alertCtrl: AlertController,
    public modalCtrl: ModalController,
    public _platform: Platform,
    public router: Router,
    public storage: Storage,
    public events: Events,
    @Optional() public nav: IonNav,//for testing perpose 
  ) {
  }

  ngOnInit() {
    this._initForm();
  }

  /**
 * Initialise Register form 
 */
  _initForm() {
    this.registerForm = this._formService.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, CustomValidator.emailValidator]],
      password: ['', [Validators.required, Validators.minLength(7), Validators.maxLength(30)]]
    });
  }

  ngOnDestroy() {
    if (!!this.createAccountSubscription) {
      this.createAccountSubscription.unsubscribe();
    }
  }

  /**
   * close the model
   */
  close() {
    let data = {};
    this.modalCtrl.dismiss(data);
  }


  ionViewDidEnter() {
    //Set cursor
    setTimeout(() => {
      if (this.input)
        this.input.setFocus();
    }, 200);
  }

  /**
   * Submit form to create an account 
   */
  registerSubmit() {

    if (!this.registerForm.valid)
      return false;

    this.isLoading = true;

    this.createAccountSubscription = this._authService.createAccount(this.registerForm.value).subscribe(async res => {

      if (res.operation == "success") {

        //Save user's data 
        this.storage.set("unVerifiedToken", res.unVerifiedToken);

        const toast = await this.toastController.create({
          message: res.message,
          duration: 2000
        });

        await toast.present();

        //Go to Landing page
        this.navCtrl.navigateBack('/landing');

        this.events.publish('verify-email', {
          email: this.registerForm.controls.email.value,
          user_uuid: res.user_uuid
        });
      }
      else if (res.operation == "error") {
        this._handleError(res);
      }
    },
      err => {
      },
      () => {
        this.isLoading = false;
      });
  }

  /**
   * Handle error 
   * @param res 
   */
  async _handleError(res) {

    const prompt = await this._alertCtrl.create({
      message: 'ok',
      buttons: ['ok']
    });
    prompt.present();
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