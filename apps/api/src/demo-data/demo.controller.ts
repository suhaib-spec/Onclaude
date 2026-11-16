import { Controller, HttpCode, Post } from '@nestjs/common';
import { SeederService } from './seeder.service';

@Controller('demo')
export class DemoController {
  constructor(private readonly seeder: SeederService) {}

  /** Wipes all data and reseeds the demo assessments, sessions and fixed invites. */
  @Post('reset')
  @HttpCode(200)
  async reset() {
    const result = await this.seeder.reset();
    return { ok: true, ...result };
  }
}
