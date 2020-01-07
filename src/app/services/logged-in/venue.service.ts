import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../auth.service';
import { AuthHttpService } from './authhttp.service';

@Injectable({
  providedIn: 'root'
})
export class VenueService implements CanActivate {

  public _venueEndpoint: string = "/venue";

  constructor(
    public authService: AuthService,
    public _authhttp: AuthHttpService
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

      if (this.authService.isLogin) {
        resolve(true);
      }
      else {
        resolve(false);
      }

    });
  }

  /**
   * Create a new venue
   * @returns {Observable<any>}
   */
  createVenue(params): Observable<any> {
    let url = this._venueEndpoint;
    return this._authhttp.post(url,params)
  }

}
