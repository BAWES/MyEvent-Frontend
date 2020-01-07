import { Component, OnInit, Optional } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Platform, AlertController, Events, NavController, ModalController, IonNav, ToastController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
// services
import { AuthService } from 'src/app/services/auth.service';
// pages
import { Subscription } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { Venue } from 'src/app/models/venue';
import { CustomValidator } from 'src/app/validators/custom.validator';
import { VenueService } from 'src/app/services/logged-in/venue.service';

@Component({
  selector: 'app-venue-form',
  templateUrl: './venue-form.page.html',
  styleUrls: ['./venue-form.page.scss'],
})
export class VenueFormPage implements OnInit {

  public venueForm: FormGroup;

  public type = 'password';

  public venue: Venue;

  public venue_uuid;

  public showPass = false;
  // Disable submit button if loading response
  public isLoading = false;


  public venueSubscription: Subscription;

  constructor(
    public _fb: FormBuilder,
    public events: Events,
    public venueService: VenueService,
    public toastController: ToastController,
    public router: Router,
    public route: ActivatedRoute,
    public _alertCtrl: AlertController,
    public _platform: Platform,
    public storage: Storage,
    public modalCtrl: ModalController
  ) {
    this.venue_uuid = this.route.snapshot.paramMap.get('venue_uuid');

    if (this.venue_uuid) {
      // this.loadData();
      this._initForm();
    } else {
      this.venue = new Venue;
      this._initForm();
    }
  }


  ngOnInit() { }

  /**
  * Initialise Register form 
  */
  _initForm() {
    // Initialize the venue Form
    this.venueForm = this._fb.group({
      venue_name: [this.venue.venue_name, [Validators.required]],
      venue_location: [this.venue.venue_location],
      venue_location_longitude: [this.venue.venue_location_longitude],
      venue_location_latitude: [this.venue.venue_location_latitude],
      venue_description: [this.venue.venue_description],
      venue_contact_email: [this.venue.venue_contact_email, [CustomValidator.emailValidator]],
      venue_contact_phone: [this.venue.venue_contact_phone],
      venue_contact_website: [this.venue.venue_contact_website],
      venue_capacity_minimum: [this.venue.venue_capacity_minimum],
      venue_capacity_maximum: [this.venue.venue_capacity_maximum],
      venue_operating_hours: [this.venue.venue_operating_hours],
      venue_restrictions: [this.venue.venue_restrictions]
    });
  }


  ionViewWillLeave() {
    this.isLoading = false;
  }

  ngOnDestroy() {
    if (!!this.venueSubscription) {
      this.venueSubscription.unsubscribe();
    }
  }

  /**
 * Attempts to venue with the provided email and password
 */
  async onSubmit() {
    if (!this.venueForm.valid) {
      return false;
    }

    this.isLoading = true;


    this.venueSubscription = this.venueService.createVenue(this.venueForm.value).subscribe(async res => {

      this.isLoading = false;

      if (res.operation == 'success') {

        const toast = await this.toastController.create({
          message: res.message,
          duration: 2000
        });

        await toast.present();
        this.router.navigate(['']);

      }  else {
        this._alertCtrl.create({
          header: 'Unable to Create a venue',
          message: res.message,
          buttons: ['ok'],
        }).then(alert => alert.present());
      }

    });
  }


}
