import { CommonModule, Location } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CommonService } from './common/service/common/common.service';
import { PopupService } from './common/service/popup/popup.service';
import {MatTooltipModule} from '@angular/material/tooltip';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  imports: [ CommonModule, RouterLink, RouterOutlet, RouterLinkActive, MatTooltipModule ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'AngularApp';
  routeName: string = "home"; 
  currentRoute: string = "";
  isLoggedUserIn: boolean = false;
  loginUserDetails: any= {};

  constructor(
    private router: Router, private location: Location, private commonService: CommonService, private popupService: PopupService,
    private translate: TranslateService,

  ) {
    this.currentRoute = "";
    this.currentRoute = this.location.path();
    this.isLoggedUserIn = this.commonService.isLoggedIn;
  }

  ngOnInit(): void {
  }
  
  ngDoCheck() {
    this.loginUserDetails = this.commonService.loggedInUser;
  }

  navigatePage(e: any, routeName: any) {
    this.currentRoute = '/' + routeName;
  }

  isLoggedIn(): boolean {
    return this.commonService.isLoggedIn;
  }

  openAccountPopup(): void {
    const data = {
    }
    this.popupService.openDialog(data, '40rem', 'account-dialog-container');
  }

  logoutUser(): void {
    const data = {
      isLogoutDialog: true
    } 
    this.popupService.openDialog(data, '30rem', 'custom-dialog-container', () => {
      this.commonService.isLoggedIn = false;
      this.commonService.loggedInUser = {};
      this.router.navigate(['/login']);    
    });
  }
 
}
