import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-server-error',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="error-container">
      <h1>Server Error</h1>
      <p>Sorry, something went wrong on our server.</p>
      <button (click)="goHome()">Return to Home</button>
    </div>
  `,
  styles: [`
    .error-container {
      text-align: center;
      padding: 50px;
      max-width: 600px;
      margin: 0 auto;
    }
    button {
      padding: 8px 16px;
      background-color: #1890ff;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    button:hover {
      background-color: #40a9ff;
    }
  `]
})
export class ServerErrorComponent {
  constructor(private router: Router) {}

  // Navigate back to the home page
  goHome(): void {
    this.router.navigate(['/']);
  }
} 