import { Component, OnInit, ViewChild, Optional } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AlertController, Platform, Events, ModalController, IonNav } from '@ionic/angular';
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

  public googleIdToken: string;

  public createAccountSubscription: Subscription;

  @ViewChild('input', { static: true }) input;

  constructor(
    public route: ActivatedRoute,
    public _formService: FormBuilder,
    public _authService: AuthService,
    public _alertCtrl: AlertController,
    public modalCtrl: ModalController,
    public _platform: Platform,
    public storage: Storage,
    public events: Events,
    @Optional() public nav: IonNav,//for testing perpose 
  ) {
  } 

  ngOnInit() {
    this.registerForm = this._formService.group({
      username: [this.route.snapshot.paramMap.get('username'), Validators.required],
      email: [this.route.snapshot.paramMap.get('email'), [Validators.required, CustomValidator.emailValidator]],
      password: ['', [Validators.required,Validators.minLength(7),Validators.maxLength(30)]]
    });

  }

  ngOnDestroy() {
    if(!!this.createAccountSubscription) {
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
    setTimeout(() => {
      if(this.input)
        this.input.setFocus();
    }, 200);
  } 

  /**
   * Submit form to register 
   */
  registerSubmit() {

    if (!this.registerForm.valid)
      return false;

    this.isLoading = true;

    this.createAccountSubscription = this._authService.createAccount(this.registerForm.value).subscribe(res => {

      if (res.operation == "success") {

        this.storage.set("unVerifiedToken", res.unVerifiedToken);
        
        this.modalCtrl.dismiss({ 
          from: 'native-back-btn'
        });

        this.events.publish('verify-email', { 
          email: this.registerForm.controls.email.value,
          candidate_uuid: res.candidate_uuid
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