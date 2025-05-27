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

export class InventoryManagementComponent {
  detectedItems: { class: string; quantity: number }[] = [];
  loading = false;

  previewUrl: string | ArrayBuffer | null = null;
  selectedFile: File | null = null;

  private readonly apiKey = 'kOMqAVhkOoiAg4BbctHK';
  private readonly modelId = 'smart-fridge-mvi88/smart-fridge-co7ul-instant-3';
  private readonly detectionEndpoint = `https://detect.roboflow.com/${this.modelId}?api_key=${this.apiKey}`;

  constructor(private http: HttpClient) {}

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile = input.files[0];

      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl = reader.result;
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  detectItems() {
    if (!this.selectedFile) {
      alert("Please select an image first.");
      return;
    }

    this.loading = true;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Image = (reader.result as string).split(',')[1]; 

      const payload = {
        image: base64Image
      };

      this.http.post<any>(this.detectionEndpoint, payload, {
        headers: new HttpHeaders({ 'Content-Type': 'application/json' })
      }).subscribe({
        next: response => {
          this.detectedItems = this.aggregateItems(response.predictions || []);
          this.loading = false;
          console.log('Roboflow response:', response);
        },
        error: err => {
          console.error('Detection failed', err);
          this.loading = false;

        }
      });
    };

    reader.readAsDataURL(this.selectedFile);
  }

  aggregateItems(predictions: any[]) {
    const itemMap: { [key: string]: number } = {};
    for (const pred of predictions) {
      const name = pred.class.toLowerCase();
      itemMap[name] = (itemMap[name] || 0) + 1;
    }
    return Object.entries(itemMap).map(([key, value]) => ({ class: key, quantity: value }));
  }
}
