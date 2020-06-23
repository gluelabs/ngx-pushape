import { TestBed } from '@angular/core/testing';

import { NgxPushapeService } from './ngx-pushape.service';

describe('NgxPushapeService', () => {
  let service: NgxPushapeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NgxPushapeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
