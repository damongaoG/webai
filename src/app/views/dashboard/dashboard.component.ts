import { Component, signal } from "@angular/core";
import { CommonModule } from "@angular/common";

// Interface for user credits data
interface UserCredits {
  totalCredits: number;
  usedCredits: number;
  remainingCredits: number;
  subscriptionPlan: string;
  nextResetDate: Date;
}

@Component({
  selector: "app-dashboard",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="credits-dashboard-container min-h-screen bg-gradient-to-br from-gray-900 to-black p-6"
    >
      <div class="max-w-6xl mx-auto">
        <!-- Header Section -->
        <div class="mb-8">
          <h1 class="text-4xl font-bold text-white mb-2">Credits Dashboard</h1>
          <p class="text-gray-400">Track your usage and manage your credits</p>
        </div>

        <!-- Credits Overview Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <!-- Total Credits Card -->
          <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-semibold text-white">Total Credits</h3>
              <div
                class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center"
              >
                <span class="text-white text-sm font-bold">T</span>
              </div>
            </div>
            <p class="text-3xl font-bold text-blue-400">
              {{ userCredits().totalCredits | number }}
            </p>
            <p class="text-sm text-gray-400 mt-2">Monthly allocation</p>
          </div>

          <!-- Used Credits Card -->
          <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-semibold text-white">Used Credits</h3>
              <div
                class="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center"
              >
                <span class="text-white text-sm font-bold">U</span>
              </div>
            </div>
            <p class="text-3xl font-bold text-orange-400">
              {{ userCredits().usedCredits | number }}
            </p>
            <p class="text-sm text-gray-400 mt-2">This period</p>
          </div>

          <!-- Remaining Credits Card -->
          <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-semibold text-white">Remaining</h3>
              <div
                class="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center"
              >
                <span class="text-white text-sm font-bold">R</span>
              </div>
            </div>
            <p class="text-3xl font-bold text-green-400">
              {{ userCredits().remainingCredits | number }}
            </p>
            <p class="text-sm text-gray-400 mt-2">Available now</p>
          </div>

          <!-- Usage Percentage Card -->
          <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-semibold text-white">Usage</h3>
              <div
                class="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center"
              >
                <span class="text-white text-sm font-bold">%</span>
              </div>
            </div>
            <p class="text-3xl font-bold text-purple-400">
              {{ getUsagePercentage() }}%
            </p>
            <p class="text-sm text-gray-400 mt-2">Of total credits</p>
          </div>
        </div>

        <!-- Progress Bar -->
        <div class="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-8">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-white">
              Credit Usage Progress
            </h3>
            <span class="text-sm text-gray-400"
              >{{ getUsagePercentage() }}% used</span
            >
          </div>
          <div class="w-full bg-gray-700 rounded-full h-4">
            <div
              class="bg-gradient-to-r from-blue-500 to-purple-500 h-4 rounded-full transition-all duration-300"
              [style.width.%]="getUsagePercentage()"
            ></div>
          </div>
          <div class="flex justify-between text-sm text-gray-400 mt-2">
            <span>0</span>
            <span>{{ userCredits().totalCredits | number }}</span>
          </div>
        </div>

        <!-- Subscription Info -->
        <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 class="text-lg font-semibold text-white mb-4">
            Subscription Details
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p class="text-sm text-gray-400 mb-1">Current Plan</p>
              <p class="text-xl font-semibold text-white">
                {{ userCredits().subscriptionPlan }}
              </p>
            </div>
            <div>
              <p class="text-sm text-gray-400 mb-1">Next Reset</p>
              <p class="text-xl font-semibold text-white">
                {{ userCredits().nextResetDate | date: "short" }}
              </p>
            </div>
          </div>
        </div>

        <!-- Placeholder for future features -->
        <div class="mt-8 text-center">
          <p class="text-gray-500 text-sm">More features coming soon...</p>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .credits-dashboard-container {
        min-height: 100vh;
      }

      /* Custom scrollbar */
      ::-webkit-scrollbar {
        width: 8px;
      }

      ::-webkit-scrollbar-track {
        background: #1f2937;
      }

      ::-webkit-scrollbar-thumb {
        background: #4b5563;
        border-radius: 4px;
      }

      ::-webkit-scrollbar-thumb:hover {
        background: #6b7280;
      }
    `,
  ],
})
export class DashboardComponent {
  // Signal for reactive user credits data
  userCredits = signal<UserCredits>({
    totalCredits: 10000,
    usedCredits: 3750,
    remainingCredits: 6250,
    subscriptionPlan: "Professional",
    nextResetDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
  });

  getUsagePercentage(): number {
    const credits = this.userCredits();
    if (credits.totalCredits === 0) return 0;
    return Math.round((credits.usedCredits / credits.totalCredits) * 100);
  }
}
