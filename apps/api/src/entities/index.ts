import { Assessment } from './assessment.entity';
import { Message } from './message.entity';
import { Session } from './session.entity';
import { InterviewSession } from '../interviews/interview-session.entity';

export { Assessment, InterviewSession, Message, Session };
export const ENTITIES = [Assessment, Session, Message, InterviewSession];
