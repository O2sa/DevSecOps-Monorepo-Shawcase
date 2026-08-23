import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: []
})
export class LoginComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  username = '';
  password = '';
  isLoading = false;
  errorMessage: string | null = null;
  returnUrl = '/dashboard';

  ngOnInit(): void {
    const errorParam = this.route.snapshot.queryParamMap.get('error');
    if (errorParam === 'forbidden') {
      this.errorMessage = 'Access denied: Your account does not have administrator privileges.';
    }

    const returnUrlParam = this.route.snapshot.queryParamMap.get('returnUrl');
    if (returnUrlParam) {
      this.returnUrl = returnUrlParam;
    }

    if (this.authService.isAdmin()) {
      this.router.navigate([this.returnUrl]);
    }
  }

  onSubmit(): void {
    this.errorMessage = null;

    if (!this.username.trim() || !this.password) {
      this.errorMessage = 'Please enter both username and password.';
      return;
    }

    this.isLoading = true;
    this.authService.login({
      username: this.username.trim(),
      password: this.password
    }).subscribe({
      next: () => {
        this.isLoading = false;
        if (this.authService.isAdmin()) {
          this.router.navigate([this.returnUrl]);
        } else {
          this.authService.logout();
          this.errorMessage = 'Access denied: Authenticated user does not possess administrative role (admin).';
        }
      },
      error: (err) => {
        this.isLoading = false;
        if (err.status === 401) {
          this.errorMessage = 'Invalid username or password.';
        } else if (err.status === 0) {
          this.errorMessage = 'Unable to reach Django Identity Service on port 8001. Please verify the service is running.';
        } else {
          this.errorMessage = err.error?.detail || err.error?.message || 'An error occurred during authentication.';
        }
      }
    });
  }
}
