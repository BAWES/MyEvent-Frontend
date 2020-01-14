import { Injectable } from '@angular/core';
import { AuthHttpService } from './logged-in/authhttp.service';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OccasionService {

  public _occasionEndpoint: string = "/occasion";

  constructor(
    public _authhttp: AuthHttpService
  ) { }


  /**
   * Create a new venue
   * @returns {Observable<any>}
   */
  listAllOccasions(): Observable<any> {
    let url = this._occasionEndpoint;
    return this._authhttp.get(url)
  }

}
