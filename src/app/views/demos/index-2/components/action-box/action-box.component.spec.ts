import { ComponentFixture, TestBed } from '@angular/core/testing'

import { ActionBoxComponent } from './action-box.component'

describe('ActionBoxComponent', () => {
  let component: ActionBoxComponent
  let fixture: ComponentFixture<ActionBoxComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActionBoxComponent],
    }).compileComponents()

    fixture = TestBed.createComponent(ActionBoxComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
