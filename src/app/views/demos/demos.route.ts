import type { Route } from '@angular/router'
import { Index1Component } from './index-1/index-1.component'
import { Index2Component } from './index-2/index-2.component'
import { Index3Component } from './index-3/index-3.component'
import { Index4Component } from './index-4/index-4.component'
import { Index5Component } from './index-5/index-5.component'

export const DEMO_PAGES_ROUTES: Route[] = [
  {
    path: 'index-1',
    component: Index1Component,
    data: { title: 'Index 1' },
  },
  {
    path: 'index-2',
    component: Index2Component,
    data: { title: 'Index 2' },
  },
  {
    path: 'index-3',
    component: Index3Component,
    data: { title: 'Index 3' },
  },
  {
    path: 'index-4',
    component: Index4Component,
    data: { title: 'Index 4' },
  },
  {
    path: 'index-5',
    component: Index5Component,
    data: { title: 'Index 5' },
  },
]
