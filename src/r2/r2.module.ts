import { Module } from '@nestjs/common';
import { R2Service } from './r2.service';
import { R2 } from './r2';

@Module({
  providers: [R2Service, R2],
  exports: [R2Service]
})
export class R2Module { }
