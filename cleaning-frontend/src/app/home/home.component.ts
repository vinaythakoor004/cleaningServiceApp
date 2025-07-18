import { Component, inject, OnInit } from '@angular/core';
import { SearchComponent } from "../search/search.component";
import { CommonModule } from '@angular/common';
import { HomeService } from './service/home.service';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { bookingData } from './model/bookingData';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { PopupService } from '../common/service/popup/popup.service';
import { AlertService } from '../common/service/alert/alert.service';
import { CommonService } from '../common/service/common/common.service';
import { BubbleChartComponent } from './bubble-chart/bubble-chart.component';
// import { ScrollingModule } from '@angular/cdk/scrolling';
import { WebsocketService } from './service/websocket.service';

@Component({
  selector: 'app-home',
  imports: [CommonModule, SearchComponent, MatButtonModule, BubbleChartComponent ], //ScrollingModule ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})

export class HomeComponent implements OnInit {
  allBookingData: Array<bookingData> = [];
  bookingData: Array<bookingData> = [];
  pageSize: Array<number> = [];
  currentPage: number = 1;
  totalCount: number = 0;
  searchTxt: string = "";
  readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);
  subscriptions: Array<Subscription> = [];
  loggedInUser: any = {};
  public isLoading: boolean = true;
  public errorMessage: string | null = null;
  constructor(private homeService: HomeService, private popupService: PopupService,
    private alertService: AlertService,
    private ws: WebsocketService,
    private commonService: CommonService) { }

  ngOnInit(): void {
    this.getServiceData(1);
    this.loggedInUser = this.commonService.loggedInUser;
    this.subscriptions.push(this.ws.listenToBooking().subscribe(booking => {
    alert('📢 New booking received:\n' + JSON.stringify(booking));
    // or push to a bookings array if you're displaying a list
  }));
  }

  ngOnDestroy(): void {
    this.subscriptions?.forEach(item => item.unsubscribe());
  }

  getServiceData(currentPage: number, searchTxt?: string): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.homeService.getServiceData(currentPage, 10, searchTxt || "").subscribe({
      next: (data: any) => {
        if (data?.bookings) {
          this.isLoading = false;
          this.allBookingData = data.bookings;
          this.bookingData = data.bookings;
          this.totalCount = data.total
          this.getPageSize(this.totalCount);
          // this.getPageData(currentPage);
        }
      },
      error: (err) => {
        console.log(err)
        this.allBookingData = [];
        this.bookingData = [];
        this.totalCount = 0
        this.getPageSize(this.totalCount);
        // this.getPageData(currentPage);
        this.errorMessage = 'Failed to load booking data. Please try again later.';
        this.isLoading = false;
      }
    }
    )
  }

  getPageSize(total: number): Array<number> {
    // let limit = Math.ceil(this.allBookingData.length / 10);
    let limit = Math.ceil(total / 10);
    return this.pageSize = [...Array(limit)].map((a, i) => i + 1)
  }

  getPageData(page: number, e?: any, searchTxt?: any): void {
    this.currentPage = page;
    if (e) {
      e.preventDefault();
    }
    // let start = (page - 1) * 10;
    // let end = start + 10;
    this.getServiceData(this.currentPage, searchTxt);
    // const newArr = this.allBookingData.slice(start, end);
    // this.bookingData = structuredClone(newArr);
  }

  getSearch(e: any): void {
    // this.allBookingData = e.allBookingData;
    this.searchTxt = e?.search || "";
    this.getPageData(1, null, e?.search || "");
    this.getPageSize(this.totalCount);
  }

  getPageClass(page: number): string {
    return page === 1 ? 'active' : '';
  }

  identify(index: any, item: any) {
    return item.bookingId;
  }

  openDetailsDialog(item: bookingData): void {
    const data = {
        bookingData: item,
        isBookingDetails: true,
    }
    this.popupService.openDialog(data, '40rem', 'custom-dialog-container');
  }

  deleteRow(item: bookingData): void {
    const data = {
      isDelete: true,
      isConfirmDialog: true,
      selectdItem: item
    }
    this.popupService.openDialog(data, '30rem', 'custom-dialog-container', () => {
      this.deleteBooking(item);
    });
   }

  deleteBooking(item: bookingData): void {
    this.homeService.deleteBooking(item.id).subscribe({
      next: (data: any) => {
        this.currentPage = this.bookingData.length == 1 && this.bookingData[0].bookingId == item.bookingId && this.currentPage != 1 ? this.currentPage - 1 : this.currentPage;
        this.getServiceData(this.currentPage);
        this.alertService.openSnackBar('Row: ' + item.bookingId + ' deleted successfully');
      },
      error: (err: any) => {
        this.alertService.openSnackBar('Delete booking failed!');
      }
    })
  }

   editRow(item: bookingData): void {
    const data = {
      isEdit: true,
      isConfirmDialog: true,
      selectdItem: item
    }
    this.popupService.openDialog(data, '30rem', 'custom-dialog-container', () => {
      this.homeService.isEdit = true;
      this.homeService.editItem = item;
      const url = '/services/book-service/appointment';
      const params = {
          queryParams: {
              name: item.bookingDetails.serviceName
          }
      };
      this.router.navigate([url], params);
    });
   }
}
