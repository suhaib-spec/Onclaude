import { Component, OnInit, computed, effect, inject } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';
import { AppState, Role, ToastService } from './core/ui-state';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  state = inject(AppState);
  toast = inject(ToastService);
  private router = inject(Router);

  private url = toSignal(
    this.router.events.pipe(
      filter((e) => e instanceof NavigationEnd),
      map((e) => (e as NavigationEnd).urlAfterRedirects),
    ),
    { initialValue: '' },
  );
  /** The candidate workspace uses its own full-height top bar. */
  isWorkspace = computed(() => this.url().startsWith('/take/'));

  constructor() {
    // Keep the role switch in sync with where the user actually is.
    effect(() => {
      const u = this.url();
      if (u.startsWith('/take/') || u.startsWith('/candidate')) this.state.setRole('candidate');
      else if (u.startsWith('/interviewer')) this.state.setRole('interviewer');
    });
  }

  ngOnInit() {
    this.state.checkHealth();
    setInterval(() => this.state.checkHealth(), 20000);
  }

  switchRole(r: Role) {
    this.state.setRole(r);
    this.router.navigateByUrl(r === 'interviewer' ? '/interviewer' : '/candidate');
  }
}
