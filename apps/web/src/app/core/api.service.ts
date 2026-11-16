import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, firstValueFrom } from 'rxjs';
import {
  Assessment,
  AssessmentInput,
  AssessmentSummary,
  ChatResponse,
  DraftHintsRequest,
  DemoJd,
  Health,
  InterviewInput,
  InterviewSession,
  InterviewSummary,
  HintStep,
  InviteResponse,
  PublicMessage,
  Session,
  SessionDetail,
  SessionRow,
  TakeView,
} from './api.models';

const API = '/api';

/** Typed client for the Hintwise REST API (docs/mvp/MVP_SPEC.md §4). All methods return Promises. */
@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);

  private p<T>(o: Observable<T>): Promise<T> {
    return firstValueFrom(o);
  }

  // ---- meta ----
  health() {
    return this.p(this.http.get<Health>(`${API}/health`));
  }
  resetDemo() {
    return this.p(this.http.post<unknown>(`${API}/demo/reset`, {}));
  }

  // ---- interviewer ----
  listAssessments() {
    return this.p(this.http.get<AssessmentSummary[]>(`${API}/assessments`));
  }
  getAssessment(id: string) {
    return this.p(this.http.get<Assessment>(`${API}/assessments/${id}`));
  }
  createAssessment(body: AssessmentInput) {
    return this.p(this.http.post<Assessment>(`${API}/assessments`, body));
  }
  updateAssessment(id: string, body: AssessmentInput) {
    return this.p(this.http.put<Assessment>(`${API}/assessments/${id}`, body));
  }
  deleteAssessment(id: string) {
    return this.p(this.http.delete<unknown>(`${API}/assessments/${id}`));
  }
  draftHints(body: DraftHintsRequest) {
    return this.p(this.http.post<{ hintLadder: HintStep[] }>(`${API}/assessments/draft-hints`, body));
  }
  createInvite(assessmentId: string, candidateName?: string) {
    return this.p(
      this.http.post<InviteResponse>(`${API}/assessments/${assessmentId}/invites`, candidateName ? { candidateName } : {}),
    );
  }
  listSessions(assessmentId: string) {
    return this.p(this.http.get<SessionRow[]>(`${API}/assessments/${assessmentId}/sessions`));
  }
  getSession(id: string) {
    return this.p(this.http.get<SessionDetail>(`${API}/sessions/${id}`));
  }
  evaluateSession(id: string) {
    return this.p(this.http.post<Session>(`${API}/sessions/${id}/evaluate`, {}));
  }

  // ---- candidate ----
  getTake(token: string) {
    return this.p(this.http.get<TakeView>(`${API}/take/${encodeURIComponent(token)}`));
  }
  startTake(token: string, candidateName: string) {
    return this.p(this.http.post<TakeView>(`${API}/take/${encodeURIComponent(token)}/start`, { candidateName }));
  }
  getMessages(token: string) {
    return this.p(this.http.get<PublicMessage[]>(`${API}/take/${encodeURIComponent(token)}/messages`));
  }
  chat(token: string, message: string) {
    return this.p(this.http.post<ChatResponse>(`${API}/take/${encodeURIComponent(token)}/chat`, { message }));
  }
  hint(token: string) {
    return this.p(this.http.post<ChatResponse>(`${API}/take/${encodeURIComponent(token)}/hint`, {}));
  }
  saveAnswer(token: string, answer: string) {
    return this.p(this.http.put<{ ok: true }>(`${API}/take/${encodeURIComponent(token)}/answer`, { answer }));
  }
  submit(token: string) {
    return this.p(this.http.post<{ status: 'submitted' }>(`${API}/take/${encodeURIComponent(token)}/submit`, {}));
  }

  // ---- live AI interview (T-021) ----
  demoJd() {
    return this.p(this.http.get<DemoJd>(`${API}/interviews/demo-jd`));
  }
  createInterview(body: InterviewInput) {
    return this.p(this.http.post<InterviewSession>(`${API}/interviews`, body));
  }
  listInterviews() {
    return this.p(this.http.get<InterviewSummary[]>(`${API}/interviews`));
  }
  getInterview(id: string) {
    return this.p(this.http.get<InterviewSession>(`${API}/interviews/${id}`));
  }
  answerInterview(id: string, text: string) {
    return this.p(this.http.post<InterviewSession>(`${API}/interviews/${id}/answer`, { text }));
  }
  finishInterview(id: string) {
    return this.p(this.http.post<InterviewSession>(`${API}/interviews/${id}/finish`, {}));
  }
  voiceStart(id: string) {
    return this.p(this.http.post<{ accessToken: string; callId: string }>(`${API}/interviews/${id}/voice/start`, {}));
  }
  voiceSync(id: string, transcript: { role: string; content: string }[], ended = false) {
    return this.p(this.http.post<InterviewSession>(`${API}/interviews/${id}/voice/sync`, { transcript, ended }));
  }
}

/** Turns any HTTP error into a friendly one-line message. */
export function errorMessage(err: unknown, fallback = 'Something went wrong.'): string {
  if (err instanceof HttpErrorResponse) {
    if (err.status === 0 || err.status === 502 || err.status === 503 || err.status === 504) {
      return 'Can’t reach the Hintwise API. Is the backend running on port 3000?';
    }
    const body = err.error as { message?: string | string[] } | string | null;
    const msg = typeof body === 'string' ? body : Array.isArray(body?.message) ? body?.message.join(', ') : body?.message;
    if (err.status === 404) return msg || 'Not found.';
    if (err.status === 409) return msg || 'This session is already submitted.';
    return msg ? `${msg}` : `${fallback} (HTTP ${err.status})`;
  }
  return fallback;
}
