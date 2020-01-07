
import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import { Events } from '@ionic/angular';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { Storage } from '@ionic/storage';
// Services
import { AuthHttpService } from './authhttp.service';
import { AuthService } from '../auth.service';


/**
 * Manages Cv builder Functionality on the server
 */
@Injectable({
  providedIn: 'root'
})
export class UserService {

  public loading: boolean = false;

  public user;


  public _userEndpoint: string = "/user";

  constructor(
    public _authhttp: AuthHttpService,
    public events: Events,
    public router: Router,
    public storage: Storage,
    public _authService: AuthService
  ) {
    this.eventsSubscription();

    if (this._authService.isLogin && !this.user)
      this.loadData();

  }

  loadData(refresh = false) {

    return new Promise((resolve, reject) => {

      if (this.user && !refresh) {
        return resolve(this.user);
      }

      this.loading = true;

      this.view().subscribe(response => {

        this.user = response;
        resolve(this.user);
      }, () => {
        this.loading = false;
      });
    });
  }


  /**
   * Get job detail 
   * @returns {Observable<any>}
   */
  view(): Observable<any> {
    let url = this._userEndpoint;
    return this._authhttp.get(url);
  }


  /**
   * Catch events related to user data update 
   */
  async eventsSubscription() {

    this.events.subscribe('user:logout', _ => {
      this.user = null;
    });

    this.events.subscribe('user:login', data => {
      this.loadData();
    });


    /**
     * reload profile after profile complete
     */
    // this.events.subscribe('user:updated', data => {

    //     if (!this._authService.isLogin) {
    //         return this.user = null;
    //     }

    //     if (data) {
    //         this.user = data;
    //     } else {
    //         //this.user = null;
    //         this.loadData(true);
    //     }
    // });

  }


  /**
   * Change password 
   * @param oldPassword
   * @param newPassword
   * @param confirmPassword
   */
  // changePassword(oldPassword, newPassword, confirmPassword): Observable<any> {
  //     let url = this._userEndpoint + '/change-password';
  //     let params = {
  //         oldPassword: oldPassword,
  //         newPassword: newPassword,
  //         confirmPassword: confirmPassword
  //     };
  //     return this._authhttp.patch(url, params);
  // }

  /**
   * Update email address 
   * @param user user 
   */
  // updateEmail(user: user): Observable<any> {
  //     let url = this._userEndpoint + '/update-email';
  //     return this._authhttp.post(url, { email: user.email }).pipe(map(res => {
  //         if (res.operation == 'success')
  //             this.events.publish('user:updated', user);
  //         return res;
  //     }));
  // }

  /**
   * Update basic detail 
   * @param user 
   */
  // updateBasic(user: any): Observable<any> {
  //     let url = this._userEndpoint + '/update-basic';
  //     let params = {
  //         firstname: user.firstname,
  //         lastname: user.lastname
  //     }
  //     return this._authhttp.post(url, params).pipe(map((res) => {
  //         if (res.operation == 'success')
  //             this.events.publish('user:updated', user);
  //         return res;
  //     }));
  // }



}