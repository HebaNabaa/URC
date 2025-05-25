import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { AIAssistantComponent } from './features/AIAssistant/aiassistant.component';
import { InventoryManagementComponent } from './features/Inventory-Management/inventory-management.component';
import { WastePreventionComponent } from './features/waste-prevention/waste-prevention.component';

export const routes: Routes = [
    {path:'', component:HomeComponent},
    {path: "AIAssistant", component: AIAssistantComponent },
    {path:'Inventory-Management', component:InventoryManagementComponent  },    
    {path:'waste-prevention',component:WastePreventionComponent},
];
