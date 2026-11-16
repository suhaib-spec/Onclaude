import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Put } from '@nestjs/common';
import { HintDrafter } from '../ai/hint-drafter';
import { AssessmentsService } from './assessments.service';

/** Interviewer endpoints for building assessments and creating invites (spec §4). */
@Controller('assessments')
export class AssessmentsController {
  constructor(
    private readonly service: AssessmentsService,
    private readonly drafter: HintDrafter,
  ) {}

  @Get()
  list() {
    return this.service.list();
  }

  // Declared before ':id' routes so "draft-hints" is never parsed as an id.
  @Post('draft-hints')
  async draftHints(@Body() body: any) {
    const hintLadder = await this.drafter.draft({
      problemStatement: String(body?.problemStatement ?? ''),
      referenceAnswer: String(body?.referenceAnswer ?? ''),
      materials: Array.isArray(body?.materials) ? body.materials : [],
    });
    return { hintLadder };
  }

  @Get(':id')
  get(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.get(id);
  }

  @Post()
  create(@Body() body: any) {
    return this.service.create(body);
  }

  @Put(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() body: any) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(id);
  }

  @Post(':id/invites')
  invite(@Param('id', ParseUUIDPipe) id: string, @Body() body: any) {
    return this.service.createInvite(id, body?.candidateName);
  }

  @Get(':id/sessions')
  sessions(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.listSessions(id);
  }
}
