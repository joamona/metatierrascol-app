import { TestBed } from '@angular/core/testing';

import { EnviarPredioService } from './enviar-predio.service';

describe('EnviarPredioService', () => {
  let service: EnviarPredioService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EnviarPredioService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
