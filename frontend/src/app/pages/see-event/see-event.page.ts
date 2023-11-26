import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Storage } from '@ionic/storage-angular';
import { jwtDecode } from 'jwt-decode';
import { EventService } from 'src/app/services/event.service';
import { LocationService } from 'src/app/services/location.service';
import { SubscribeUserEventService } from 'src/app/services/subscribe-user-event.service';

@Component({
  selector: 'app-see-event',
  templateUrl: './see-event.page.html',
  styleUrls: ['./see-event.page.scss'],
})
export class SeeEventPage implements OnInit {
  event: any;
  location: any;
  id: number;
  constructor(
    private eventService: EventService,
    private locationService: LocationService,
    private subscribeUserEvent: SubscribeUserEventService,
    private activatedRoute: ActivatedRoute,
    private storage: Storage
  ) {
    this.id = this.activatedRoute.snapshot.params['id'];
  }

  ngOnInit() {
    this.getEvent();
  }

  getEvent() {
    this.eventService.getOneEvent(this.id).subscribe(
      (event) => {
        this.event = event;
        this.locationService
          .getOneLocation(this.event.locationId)
          .subscribe((location) => {
            this.location = location;
            this.event.locationName = this.location.name;
          });
      },
      (error) => {
        console.error('Error obteniendo el evento:', error);
      }
    );
  }

  async subscribe() {
    let token = await this.storage.get('token');
    let decode = jwtDecode(token) as any;
    let userId = decode.id;
    console.log(userId, this.id);
    this.subscribeUserEvent
      .subscribe({ userId: userId, eventId: this.id })
      .subscribe((data) => {});
  }
}
