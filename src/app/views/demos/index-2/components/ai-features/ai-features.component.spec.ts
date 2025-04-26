import { ComponentFixture, TestBed } from '@angular/core/testing'

import { AiFeaturesComponent } from './ai-features.component'

describe('AiFeaturesComponent', () => {
  let component: AiFeaturesComponent
  let fixture: ComponentFixture<AiFeaturesComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AiFeaturesComponent],
    }).compileComponents()

    fixture = TestBed.createComponent(AiFeaturesComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
