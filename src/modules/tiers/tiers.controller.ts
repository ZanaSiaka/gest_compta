import { Controller } from '@nestjs/common';
import { TiersService } from './tiers.service';

@Controller('tiers')
export class TiersController {
  constructor(private readonly tiersService: TiersService) {}
}
