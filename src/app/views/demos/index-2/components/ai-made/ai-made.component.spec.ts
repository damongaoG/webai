import { ComponentFixture, TestBed } from '@angular/core/testing'

import { AiMadeComponent } from './ai-made.component'

describe('AiMadeComponent', () => {
  let component: AiMadeComponent
  let fixture: ComponentFixture<AiMadeComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AiMadeComponent],
    }).compileComponents()

    fixture = TestBed.createComponent(AiMadeComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
