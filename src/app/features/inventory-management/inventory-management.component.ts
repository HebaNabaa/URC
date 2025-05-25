import { Component } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { MContainerComponent } from '../../m-framework/components/m-container/m-container.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-inventory-management',
  standalone: true,
  imports: [CommonModule,FormsModule, MContainerComponent],
  templateUrl: './inventory-management.component.html',
  styleUrl: './inventory-management.component.css'
})

export class InventoryManagementComponent  {
  detectedItems: { class: string; quantity: number }[] = [];
  loading = false;

  private readonly apiKey = 'YOUR_API_KEY'; // Replace with your actual ML API key 
  private readonly detectionEndpoint = 'https://your-ml-api-endpoint.com/detect'; //URL of the ML server

  constructor(private http: HttpClient) {}

  detectItems() {
    this.loading = true;
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json'
    });

    const payload = {
      image_url: 'https://example.com/fridge_image.jpg' // Replace with actual image data or URL
    };

    this.http.post<any>(this.detectionEndpoint, payload, { headers }).subscribe({
      next: response => {
        this.detectedItems = this.aggregateItems(response.items || []);
        this.loading = false;
      },
      error: err => {
        console.error('Detection failed', err);
        this.loading = false;
      }
    });
  }

  aggregateItems(items: any[]) {
    const itemMap: { [key: string]: number } = {};
    for (const item of items) {
      const name = item.class.toLowerCase();
      itemMap[name] = (itemMap[name] || 0) + 1;
    }
    return Object.entries(itemMap).map(([key, value]) => ({ class: key, quantity: value }));
  }
}
