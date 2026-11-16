import { Controller, Get, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { SessionsService } from './sessions.service';

/** Interviewer review endpoints (full meta, reference answer included). */
@Controller('sessions')
export class SessionsController {
  constructor(private readonly service: SessionsService) {}

  @Get(':id')
  detail(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.detail(id);
  }

  /**
   * Re-runs evaluation + insights. Returns the review shape of GET /sessions/:id
   * ({session, assessment, messages}) with the session's own fields also spread at the top level,
   * so clients expecting either "the session" or the review payload both work.
   */
  @Post(':id/evaluate')
  async evaluate(@Param('id', ParseUUIDPipe) id: string) {
    await this.service.evaluate(id);
    const detail = await this.service.detail(id);
    return { ...detail.session, ...detail };
  }
}
