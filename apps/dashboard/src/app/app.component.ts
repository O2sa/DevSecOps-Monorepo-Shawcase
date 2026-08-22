import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'DevSecOps PoC - Admin Dashboard';
  services = [
    { name: 'Public Web', stack: 'Next.js', port: 3000, status: 'Active' },
    { name: 'Identity Service', stack: 'Django', port: 8001, status: 'Active' },
    { name: 'Orders Service', stack: 'Spring Boot', port: 8002, status: 'Active' },
    { name: 'Notification Service', stack: 'Express', port: 8003, status: 'Active' }
  ];
}
