import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NgxPushapeComponent } from './ngx-pushape.component';

describe('NgxPushapeComponent', () => {
  let component: NgxPushapeComponent;
  let fixture: ComponentFixture<NgxPushapeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NgxPushapeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NgxPushapeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
