import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {

  constructor() { }

  private socket: Socket = io({ 'path': '/socket.io', transports: ['websocket'], withCredentials: true }); // adjust URL if needed

  listenToBooking(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('new-booking', data => {
        observer.next(data);
      });
    });
  }
}
