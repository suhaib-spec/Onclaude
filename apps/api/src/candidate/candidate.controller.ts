import { Body, Controller, Get, HttpCode, Param, Post, Put } from '@nestjs/common';
import { CandidateService } from './candidate.service';

/** Candidate endpoints, keyed by invite token. Responses are built only from public-view.ts whitelists. */
@Controller('take')
export class CandidateController {
  constructor(private readonly service: CandidateService) {}

  @Get(':token')
  view(@Param('token') token: string) {
    return this.service.view(token);
  }

  @Post(':token/start')
  @HttpCode(200)
  start(@Param('token') token: string, @Body() body: any) {
    return this.service.start(token, body?.candidateName);
  }

  @Get(':token/messages')
  messages(@Param('token') token: string) {
    return this.service.listMessages(token);
  }

  @Post(':token/chat')
  @HttpCode(200)
  chat(@Param('token') token: string, @Body() body: any) {
    return this.service.chat(token, body?.message, false);
  }

  @Post(':token/hint')
  @HttpCode(200)
  hint(@Param('token') token: string) {
    return this.service.chat(token, undefined, true);
  }

  @Put(':token/answer')
  answer(@Param('token') token: string, @Body() body: any) {
    return this.service.saveAnswer(token, body?.answer);
  }

  @Post(':token/submit')
  @HttpCode(200)
  submit(@Param('token') token: string) {
    return this.service.submit(token);
  }
}
