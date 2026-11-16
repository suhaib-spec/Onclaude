import { Body, Controller, Get, HttpCode, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { CreateInterviewInput, InterviewsService } from './interviews.service';

/** Live AI interview endpoints (T-021, docs/mvp/LIVE_INTERVIEW_SPEC.md). */
@Controller('interviews')
export class InterviewsController {
  constructor(private readonly service: InterviewsService) {}

  @Get('demo-jd')
  demoJd() {
    return this.service.demoJd();
  }

  @Get()
  list() {
    return this.service.list();
  }

  @Post()
  create(@Body() body: CreateInterviewInput) {
    return this.service.create(body ?? {});
  }

  @Get(':id')
  get(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.get(id);
  }

  @Post(':id/answer')
  @HttpCode(200)
  answer(@Param('id', ParseUUIDPipe) id: string, @Body() body: { text?: string }) {
    return this.service.answer(id, body?.text ?? '');
  }

  @Post(':id/finish')
  @HttpCode(200)
  finish(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.finish(id);
  }
}
