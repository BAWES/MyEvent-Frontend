import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Events } from '@ionic/angular';
import { Observable, empty, throwError } from 'rxjs';
import { catchError, take, map, retryWhen } from 'rxjs/operators';
import { genericRetryStrategy } from '../../util/genericRetryStrategy';
//services
import { environment } from 'src/environments/environment';
import { AuthService } from '../auth.service';


/**
 * Handles all Authorized HTTP functions with Bearer Token
 */
@Injectable({
  providedIn: 'root'
})
export class AuthHttpService {

  constructor(
    public _http: HttpClient,
    public _auth: AuthService,
    public _events: Events,
  ) { }

  /**
   * Requests via GET verb
   * @param {string} endpointUrl
   * @param {string} withHeader
   * @returns {Observable<any>}
   */
  get(endpointUrl: string, withHeader: boolean = false): Observable<any> {

    const url = environment.apiEndpoint + endpointUrl;

    let response = this._http.get(url, { headers: this._buildAuthHeaders(), observe:'response' })
      .pipe(
        retryWhen(genericRetryStrategy()),
        catchError((err) => this._handleError(err)),
        take(1)
      );

    if (!withHeader) {
      return response.pipe(map((res) => { 
        return res.body 
      }));
    }

    return response;
  }

  /**
   * Requests via POST verb
   * @param endpointUrl
   * @param params
   * @param withHeader
   */
  post(endpointUrl: string, params: any, withHeader: boolean = false): Observable<any> {
    const url = environment.apiEndpoint + endpointUrl;

    let response = this._http.post(url, JSON.stringify(params), { headers: this._buildAuthHeaders(),observe:'response' })
      .pipe(
        retryWhen(genericRetryStrategy()),
        catchError((err) => this._handleError(err)),
        take(1)
      );

    if (!withHeader) {
      return response.pipe(map((res) => {return res.body }));
    }
    return response.pipe(map((res) => {return res }));
  }

  /**
   * Requests via PATCH verb
   * @param {string} endpointUrl
   * @param {*} params
   * @returns {Observable<any>}
   */
  patch(endpointUrl: string, params: any): Observable<any> {
    const url = environment.apiEndpoint + endpointUrl;

    return this._http.patch(url, JSON.stringify(params), { headers: this._buildAuthHeaders() })
      .pipe(
        retryWhen(genericRetryStrategy()),
        catchError((err) => this._handleError(err)),
        take(1),
        map((res) => {return res;})
      );
  }

  /**
   * Requests via DELETE verb. Params should be a part of the url string 
   * similar to get requests.
   * @param {string} endpointUrl
   * @returns {Observable<any>}
   */
  delete(endpointUrl: string): Observable<any> {
    const url = environment.apiEndpoint + endpointUrl;

    return this._http.delete(url, { headers: this._buildAuthHeaders() })
      .pipe(
        retryWhen(genericRetryStrategy()),
        catchError((err) => this._handleError(err)),
        take(1),
        map((res) => { return res } )
      );
  }

  /**
   * Build the Auth Headers for All Verb Requests
   * @returns {HttpHeaders}
   */
  public _buildAuthHeaders() {
    // Get Bearer Token from Auth Service
    
    const bearerToken = this._auth.getAccessToken(); 

    // Build Headers with Bearer Token
    return new HttpHeaders({
      "Authorization": "Bearer " + bearerToken,
      "Content-Type": "application/json",
    });
  }

  /**
   * Handles Caught Errors from All Authorized Requests Made to Server
   * @returns {Observable} 
   */
  public _handleError(error: any): Observable<any> {

    let errMsg = (error.message) ? error.message :
      error.status ? `${error.status} - ${error.statusText}` : 'Server error';

    // Handle Bad Requests
    // This error usually appears when agent attempts to handle an 
    // account that he's been removed from assigning
    if (error.status === 400) {
      this._events.publish("accountAssignment:removed");
      return empty();
    }

    // Handle No Internet Connection Error

    if (error.status == 0 || error.status == 504) {
      this._events.publish("internet:offline");
      //this._auth.logout("Unable to connect to Pogi servers. Please check your internet connection.");
      return empty();
    }
    
    if(!navigator.onLine) {
      this._events.publish('internet:offline');
      return empty();
    }

    // Handle Expired Session Error
    if (error.status === 401) {
      this._auth.logout('Session expired, please log back in.');
      return empty();
    }

    // Handle internal server error - 500  
    if (error.status === 500) {
      this._events.publish("error:500");
      return empty();
    }

    // Handle page not found - 404 error 
    if (error.status === 404) {
      this._events.publish("error:404");
      return empty();
    }

    console.error(JSON.stringify(error));
 
    return throwError(errMsg);
  }
}
