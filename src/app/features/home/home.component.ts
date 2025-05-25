
import { Component } from '@angular/core';
import { MContainerComponent } from '../../m-framework/components/m-container/m-container.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, MContainerComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  constructor(public router: Router){

  }
InventoryManagement(){

    this.router.navigateByUrl('/inventory-management');

  }
 AIAssitant(){
    this.router.navigateByUrl('/AIAssistant');
  }

  WastePrevention(){
    this.router.navigateByUrl('/waste-prevention');
  }

}