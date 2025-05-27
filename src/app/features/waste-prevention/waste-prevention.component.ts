import { Component, OnInit } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
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
export class WastePreventionComponent implements OnInit {
  items2nd: string[] = [];
  time2nd: string = '';
  items3rd: string[] = [];
  time3rd: string = '';
  expiredItems: { name: string, daysExpired: number }[] = [];
  nearExpiryItems: { name: string, daysRemaining: number }[] = [];
 
  expirationMap: { [key: string]: number } = {
    'Milk': 5,
    'Cheese': 10,
    'Yogurt': 7,
    'Butter': 14,
    'Eggs': 21,
    'Carrot': 14,
    'Cucumber': 7,
    'Lettuce': 5,
    'Tomato': 7,
    'Water Bottle': 180
  };
 
  ngOnInit(): void {
    this.loadData();
  }
 
  async loadData() {
    const app = initializeApp(firebaseConfig);
    const firestore = getFirestore(app);
 
    try {
      const docRef2 = doc(firestore, 'users', 'user123', 'images', '2nd');
      const docRef3 = doc(firestore, 'users', 'user123', 'images', '3rd');
 
      const [snap2, snap3] = await Promise.all([getDoc(docRef2), getDoc(docRef3)]);
 
      if (snap2.exists() && snap3.exists()) {
        const data2 = snap2.data();
        const data3 = snap3.data();
 
        this.items2nd = data2['detectedItems'] || [];
        this.items3rd = data3['detectedItems'] || [];
 
        const t2 = data2['time']?.seconds;
        const t3 = data3['time']?.seconds;
 
        if (t2 && t3) {
          const date2 = new Date(t2 * 1000);
          const date3 = new Date(t3 * 1000);
          this.time2nd = date2.toLocaleString();
          this.time3rd = date3.toLocaleString();
 
          const msDiff = date3.getTime() - date2.getTime();
          const daysPassed = Math.max(1, Math.round(msDiff / (1000 * 60 * 60 * 24)));
 
          this.evaluateExpiration(daysPassed);
        }
      }
    } catch (error) {
      console.error('Error loading Firestore data:', error);
    }
  }
 
  evaluateExpiration(daysPassed: number) {
    this.expiredItems = [];
    this.nearExpiryItems = [];
 
    this.items2nd.forEach(item => {
      const shelfLife = this.expirationMap[item];
      if (shelfLife !== undefined) {
        const remaining = shelfLife - daysPassed;
 
        if (remaining <= 0) {
          this.expiredItems.push({ name: item, daysExpired: -remaining });
        } else if (remaining <= 2) {
          this.nearExpiryItems.push({ name: item, daysRemaining: remaining });
        }
      }
    });
  }
}
 