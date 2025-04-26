import { Component } from '@angular/core'
import { LucideAngularModule } from 'lucide-angular'
import { tools } from '../data'

@Component({
  selector: 'business-tools',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './tools.component.html',
  styles: ``,
})
export class ToolsComponent {
  tools = tools
}
