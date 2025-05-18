import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-dashboard-header',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="header-container flex items-center justify-between p-4 border-b border-gray-700">
      <!-- Title -->
      <div class="text-xl font-medium text-white">Essay02</div>
      
      <!-- Right Side Controls -->
      <div class="flex items-center space-x-4">
        <!-- Notification Icon -->
        <button class="text-white/70 hover:text-white">
          <lucide-angular name="bell" class="h-5 w-5"></lucide-angular>
        </button>
        
        <!-- Settings Icon -->
        <button class="text-white/70 hover:text-white">
          <lucide-angular name="settings" class="h-5 w-5"></lucide-angular>
        </button>
        
        <!-- User Profile -->
        <div class="h-8 w-8 rounded-full bg-cover bg-center" style="background-image: url('assets/images/avatars/01.jpg');"></div>
      </div>
    </div>
  `,
  styles: [`
    .header-container {
      background-color: #121212;
    }
  `]
})
export class DashboardHeaderComponent {} 