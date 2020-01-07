import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { throwError, empty, Observable } from 'rxjs';
import { catchError, first, take, map, retryWhen } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Platform, Events, AlertController, LoadingController, ModalController } from '@ionic/angular';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { genericRetryStrategy } from '../util/genericRetryStrategy';

import { Storage } from '@ionic/storage';

/**
 * Handles all Auth functions
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService implements CanActivate {

  // Logged in agent details
  public _accessToken;

  public isLogin = false;

  public loading: any;

  public _urlBasicAuth = '/auth/login';
  public _urlRegistration = '/auth/create-account';
  public _urlRequestResetPassword = '/auth/request-reset-password';
  public _urlUpdatePassword = '/auth/update-password';
  public _urlVerifyEmail = '/auth/verify-email';
  public _urlresendVerificationEmail = '/auth/resend-verification-email';

  constructor(
    public _http: HttpClient,
    public router: Router,
    public _platform: Platform,
    public _storage: Storage,
    public _events: Events,
    public _alertCtrl: AlertController,
    public _loadingCtrl: LoadingController,
    public modalCtrl: ModalController
  ) { }


  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
  /**
   * new router changes don't wait for startup service
   * https://github.com/angular/angular/issues/14615
   */
  return new Promise(resolve => {

    if (this.isLogin) {
      resolve(true);
    }

    this._storage.get('loggedInUser').then(data => {
      if (
          data &&
          data.token &&
          data.user_uuid &&
          data.user_name
      ) {

        // to enable page to call restricted apis
        this.isLogin = true;
        this._accessToken = data.token;

        // set token without redirect if not already setting
        // this.setAccessToken(data, false);
        resolve(true);
      } else {
        resolve(false);
        this.logout('invalid access');
      }
    });
  });
}


  /**
   * Logs a user out by setting logged in to false and clearing token from storage
   * @param {string} [reason]
   */
  logout(reason?: string) {


    // if(!this._accessToken)
    //  return null;

    this.isLogin = false;

    this._accessToken = null;

    this._storage.remove('loggedInUser').then(_ => {
      this._events.publish('user:logout', reason ? reason : false);
    });

  }


  /**
   * This is the method you want to call at bootstrap
   */
  load(): Promise<any> {

    const promises = [
      this._storage.get('loggedInUser'),
    ];

    return Promise.all(promises)
      .then(data => {

        if (data[0]) {
          this.setAccessToken(
            data[0]
          );
        }
      })
      .then(data => {
        // return this.logout('promise fail');
      });
  }

  /**
   * Set the access token
   */
  setAccessToken(data, redirect = null) {

    this.isLogin = true;

    this._accessToken = data.token;


    // Save to Storage for future reference
    
    this._storage.set('loggedInUser', {
      token: data.token,
      user_uuid: data.user_uuid,
      user_name: data.user_name,
      user_email: data.user_email
    });


    // Log User )In by Triggering Event that Access Token has been Set
    this._events.publish('user:login');

    return this._accessToken;
  }


  /**
   * load access token from storage
   * @param redirect
   */
  async loadAccessToken(redirect) {

    const data = await this._storage.get('loggedInUser');

    if (data && data.token) {

      this.setAccessToken(
        data,
        redirect
      );

      return data.token;
    }
  }

  /**
   * Get Access Token from Service or Cookie
   * @returns {string} token
   */
  getAccessToken(redirect = null) {

    // Return Access Token if set already
    if (this._accessToken) {
      return this._accessToken;
    }

    // Check Native Storage and Try Again

    this.loadAccessToken(redirect);

    return this._accessToken;
  }

  /**
   * Basic auth, exchanges access details for a bearer access token to use in
   * subsequent requests.
   * @param  {string} email
   * @param  {string} password
   */
  basicAuth(email: string, password: string): Observable<any> {
    // Add Basic Auth Header with Base64 encoded email and password
    const authHeader = new HttpHeaders({
      'Authorization': 'Basic ' + btoa(`${email}:${password}`),
    });
    const url = environment.apiEndpoint + this._urlBasicAuth;

    return this._http.get(url, {
      headers: authHeader
    }).pipe(
      retryWhen(genericRetryStrategy()),
      // catchError((err) => this._handleError(err)),
      first(),
      map((res) => { return res; })
    );
  }

  /**
   * Create account
   * @param params
   */
  createAccount(params) {

    const url = environment.apiEndpoint + this._urlRegistration;
    const headers = this._buildAuthHeaders();
    return this._http.post(url, params, { headers: headers }).pipe(
      retryWhen(genericRetryStrategy()),
      catchError((err) => this._handleError(err)),
      first(),
      map((res) => { return res; })
    );
  }


  /**
   * Sign in with email and password
   * @param email
   * @param password
   */
  signInWithEmailAndPassword(email, password) {
    this.basicAuth(email, password).subscribe(async res => {

      if (res.operation == 'success') {
        const view = (res.new_user == 1) ? 'welcome' : 'view';
        this.setAccessToken(res, view);
      }
      else if (res.operation == 'error' && res.errorType == 'email-not-verified') {
        this._storage.set('unVerifiedToken', res.unVerifiedToken);

        this.router.navigateByUrl('/verify-email', { state: { email: email } });
      }
      else {
        const alert = await this._alertCtrl.create({
          header: 'Unable to Log In',
          message: res.message,
          buttons: ['Ok'],
        });
        await alert.present();
      }

    }, async err => {

      // Incorrect email or password
      if (err.status == 401) {
        const alert = await this._alertCtrl.create({
          header: 'Invalid login credential',
          message: 'The information entered is incorrect. Please try again.',
          buttons: ['Try Again'],
        });
        await alert.present();

      } else {
        /**
         * Error not accounted for. Show Message
         */
        const alert = await this._alertCtrl.create({
          header: 'Unable to Log In',
          message: 'There seems to be an issue connecting to servers. Please contact us if the issue persists.',
          buttons: ['Ok'],
        });
        await alert.present();
      }
    });
  }


  /**
   * Request password reset token
   * @param email
   */
  requestResetPassword(email: string) {
    const url = environment.apiEndpoint + this._urlRequestResetPassword;
    const headers = this._buildAuthHeaders();
    return this._http.post(url, JSON.stringify({
      'email': email
    }), {
      headers: headers
    }).pipe(
      retryWhen(genericRetryStrategy()),
      catchError((err) => this._handleError(err)),
      first(),
      map((res) => { return res; })
    );
  }

  /**
   * Update password
   * @param params
   */
  updatePassword(params) {
    const url = environment.apiEndpoint + this._urlUpdatePassword;
    const headers = this._buildAuthHeaders();
    return this._http.patch(url, params, { headers: headers }).pipe(
      retryWhen(genericRetryStrategy()),
      catchError((err) => this._handleError(err)),
      first(),
      map((res) => { return res; })
    );
  }

  /**
   * Resend verification email
   * @param email
   */
  resendVerificationEmail(email: string) {
    const url = environment.apiEndpoint + this._urlresendVerificationEmail;
    const headers = this._buildAuthHeaders();
    return this._http.post(url, { 'email': email }, { headers: headers }).pipe(
      retryWhen(genericRetryStrategy()),
      catchError((err) => this._handleError(err)),
      first(),
      map((res) => { return res; })
    );
  }

  /**
   * Verify email
   * @param email 
   * @param code
   */
  verifyEmail(email: string, code: string) {
    const url = environment.apiEndpoint + this._urlVerifyEmail;
    const headers = this._buildAuthHeaders();
    return this._http.post(url, { email: email, 'code': code }, { headers: headers }).pipe(
      retryWhen(genericRetryStrategy()),
      catchError((err) => this._handleError(err)),
      first(),
      map((res) => { return res; })
    );
  }

  /**
   * Build the Auth Headers for All Verb Requests
   * @returns {HttpHeaders}
   */
  public _buildAuthHeaders() {
    // Get Bearer Token from Auth Service

    // Build Headers with Bearer Token
    return new HttpHeaders({
      "Content-Type": "application/json",
    });
  }

  /**
   * Handles Caught Errors from All Authorized Requests Made to Server
   * @returns {Observable}
   */
  public _handleError(error: any): Observable<any> {
    const errMsg = (error.message) ? error.message :
      error.status ? `${error.status} - ${error.statusText}` : 'Server error';


    // Handle No Internet Connection Error

    if (error.status == 0 || error.status == 504) {
      this._events.publish('internet:offline');
      // this._auth.logout("Unable to connect to Pogi servers. Please check your internet connection.");
      return empty();
    }

    if (!navigator.onLine || error.status === 504) {
      this._events.publish('internet:offline');
      return empty();
    }

    // Handle Expired Session Error
    if (error.status === 401) {
      this.logout('Session expired, please log back in.');
      return empty();
    }

    // Handle internal server error - 500
    if (error.status === 500) {
      this._events.publish('error:500');
      return empty();
    }

    // Handle page not found - 404 error
    if (error.status === 404) {
      this._events.publish('error:404');
      return empty();
    }

    console.error(JSON.stringify(error));

    return throwError(errMsg);
  }
}
