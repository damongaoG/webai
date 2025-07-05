import { Component, ChangeDetectionStrategy } from "@angular/core";
import { LucideAngularModule } from "lucide-angular";

interface PrivacyFeature {
  icon: string;
  title: string;
  description: string;
}

@Component({
  selector: "privacy-protection",
  standalone: true,
  templateUrl: "./privacy-protection.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideAngularModule],
})
export class PrivacyProtectionComponent {
  // Privacy features data following the design pattern from other components
  protected readonly privacyFeatures: PrivacyFeature[] = [
    {
      icon: "shield-check",
      title: "Your data is private — and always will be.",
      description:
        "We never store, share, or use your content for training. Everything you generate stays 100% confidential and is immediately discarded after use.",
    },
    {
      icon: "file-text",
      title: "No AI content label — your writing feels natural and human.",
      description:
        "Our advanced language generation techniques ensure your essays are rewritten in a way that avoids detection by AI checkers and plagiarism tools. The result: fluent, natural-sounding content that passes as human-written.",
    },
    {
      icon: "lock",
      title: "Secure, anonymous, and risk-free.",
      description:
        "No sign-up required to try. No tracking. No hidden data collection. Just the tools you need — with complete peace of mind.",
    },
  ];
}
