import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IdentityApiService } from '../../core/api/identity-api.service';
import { User } from '../../core/models/auth.model';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './users.component.html',
  styleUrls: [],
})
export class UsersComponent implements OnInit {
  private identityApi = inject(IdentityApiService);

  users: User[] = [];
  isLoading = true;
  errorMessage: string | null = null;

  ngOnInit(): void {
    this.fetchUsers();
  }

  fetchUsers(): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.identityApi.getUsers().subscribe({
      next: (data) => {
        this.users = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage =
          err.error?.detail ||
          err.error?.message ||
          'Failed to retrieve user directory from Identity Service.';
      },
    });
  }
}
