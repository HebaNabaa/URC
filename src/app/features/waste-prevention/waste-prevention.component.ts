import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set } from 'firebase/database';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { MContainerComponent } from '../../m-framework/components/m-container/m-container.component';

const firebaseConfig = {
  apiKey: "AIzaSyAQTjdzso3IVsUVXpE-o5NUuZAw81ug8Nk",
  authDomain: "smart-fridge-d2345.firebaseapp.com",
  projectId: "smart-fridge-d2345",
  storageBucket: "smart-fridge-d2345.appspot.com",
  messagingSenderId: "754008605260",
  appId: "1:754008605260:web:83b6ad68e3442fec67eae9",
  measurementId: "G-PVD2YRQQ9H",
  databaseURL: "https://smart-fridge-d2345-default-rtdb.firebaseio.com"
};

@Component({
  selector: 'app-waste-prevention',
  standalone: true,
  imports: [FormsModule, HttpClientModule, CommonModule, MContainerComponent],
  templateUrl: './waste-prevention.component.html',
  styleUrls: ['./waste-prevention.component.css']
})
export class WastePreventionComponent {
  imageUrl: string = '';
  detectedItems: string[] = [];
  expiryWarnings: string[] = [];
  db: any;

  constructor(private http: HttpClient) {
    const app = initializeApp(firebaseConfig);
    this.db = getDatabase(app);
  }

  analyzeImage() {
    if (!this.imageUrl.trim()) {
      alert('Please enter an image URL.');
      return;
    }

    const roboflowKey = 'kOMqAVhkOoiAg4BbctHK';
    const project = 'smart-fridge-mvi88';
    const modelVersion = 'smart-fridge-co7ul-instant-3';

    const apiUrl = `https://detect.roboflow.com/${project}/${modelVersion}?api_key=${roboflowKey}`;

    this.convertImageToBase64(this.imageUrl)
      .then(base64Image => {
        this.http.post(apiUrl, {
          image: base64Image
        }).subscribe({
          next: async (response: any) => {
            const predictions = response?.predictions || [];
            this.detectedItems = predictions.map((p: any) => p.class);

            try {
              await this.saveDataToFirebase();
            } catch (error) {
              console.error('Error saving data to Firebase:', error);
            }
          },
          error: (error) => {
            console.error('Error detecting items:', error);
            alert('Roboflow API error. Check your console for details.');
          }
        });
      })
      .catch(error => {
        console.error('Image conversion error:', error);
        alert('Failed to load or convert the image. Ensure the URL points directly to a JPG/PNG image.');
      });
  }

  convertImageToBase64(imageUrl: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = imageUrl;

      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject('Canvas context not available.');
          return;
        }

        ctx.drawImage(img, 0, 0);
        const dataUrl = canvas.toDataURL('image/jpeg');
        const base64 = dataUrl.replace(/^data:image\/(png|jpeg);base64,/, '');
        resolve(base64);
      };

      img.onerror = () => {
        reject('Image failed to load. Make sure the URL links directly to an image.');
      };
    });
  }

  async saveDataToFirebase() {
    const now = new Date();

    const expiryDays: { [item: string]: number } = {
      'Apple': 21,
      'Banana': 5,
      'Bread': 5,
      'Butter': 30,
      'Carrot': 14,
      'Cucumber': 7,
      'Eggs': 21,
      'Fizzy drink': 30,
      'Juice': 7,
      'Laban': 7,
      'Milk': 5,
      'Tomato': 5,
      'Water Bottle': 90,
      'Yogurt': 7
    };

    const detectedWithExpiry = this.detectedItems.map(item => {
      const cleanItem = item.trim();
      const expiryPeriod = expiryDays[cleanItem] ?? 7;
      const expiryDate = new Date(now);
      expiryDate.setDate(now.getDate() + expiryPeriod);
      return {
        name: cleanItem,
        expiryDate: expiryDate.toISOString().split('T')[0]
      };
    });

    const docId = now.toISOString().slice(0, 16).replace('T', '_').replace(':', '-');
    const dbPath = `users/user123/images/${docId}`;

    const data = {
      imageUrl: this.imageUrl,
      timestamp: now.toISOString(),
      detectedItems: detectedWithExpiry
    };

    await set(ref(this.db, dbPath), data);
    console.log('Data saved to Firebase:', data);

    this.expiryWarnings = [];

    const today = new Date();
    for (const item of detectedWithExpiry) {
      const expiry = new Date(item.expiryDate);
      const diffDays = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays <= 2) {
        const warningMessage = `⚠️ ${item.name} will expire in ${diffDays} day(s)!`;
        this.expiryWarnings.push(warningMessage);
        console.warn(warningMessage);
      }
    }
  }
}
