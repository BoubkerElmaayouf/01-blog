import { Component, OnInit } from "@angular/core";
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { NavbarComponent } from "../../shared/components/navbar/navbar.component";
import { AdminService, User, Post, Report } from "../../services/admin.service";

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    CommonModule,
    NavbarComponent,
    MatToolbarModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatChipsModule,
    MatSnackBarModule
  ],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
  totalUsers = 0;
  bannedUsers = 0;
  totalPosts = 0;
  pendingReports = 0;

  users: User[] = [];
  posts: Post[] = [];
  reports: Report[] = [];

  userColumns = ['id', 'username', 'email', 'joinDate', 'postsCount', 'status', 'actions'];
  postColumns = ['id', 'title', 'author', 'publishDate', 'views', 'status', 'actions'];
  reportColumns = ['id', 'reporter', 'reportedItem', 'itemType', 'reason', 'reportDate', 'status', 'actions'];

  constructor(
    private adminService: AdminService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadAllData();
  }

  loadAllData() {
    this.loadUsers();
    this.loadPosts();
    this.loadReports();
  }

  // Users
  loadUsers() {
    this.adminService.getUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.updateStatistics();
      },
      error: () => this.showMessage('Error loading users')
    });
  }

  banUser(user: User) {
    this.adminService.banUser(user.id).subscribe({
      next: () => {
        user.status = 'banned';
        this.updateStatistics();
        this.showMessage('User banned successfully');
      },
      error: () => this.showMessage('Error banning user')
    });
  }

  unbanUser(user: User) {
    this.adminService.unbanUser(user.id).subscribe({
      next: () => {
        user.status = 'active';
        this.updateStatistics();
        this.showMessage('User unbanned successfully');
      },
      error: () => this.showMessage('Error unbanning user')
    });
  }

  deleteUser(userId: number) {
    if (!confirm('Are you sure you want to delete this user?')) return;
    this.adminService.deleteUser(userId).subscribe({
      next: () => {
        // this.users = this.users.filter(u => u.id !== userId);
        this.updateStatistics();
        this.showMessage('User deleted successfully');
      },
      error: (error) =>  {
        this.showMessage('Error deleting user')
        console.log(error);
      }
    });
  }

  // Posts
  loadPosts() {
    this.adminService.getPosts().subscribe({
      next: (posts) => {
        this.posts = posts;
        this.updateStatistics();
      },
      error: () => this.showMessage('Error loading posts')
    });
  }

  removePost(post: Post) {
    this.adminService.removePost(post.id).subscribe({
      next: () => {
        this.posts = this.posts.filter(p => p.id !== post.id);
        this.updateStatistics();
        this.showMessage('Post removed successfully');
      },
      error: () => this.showMessage('Error removing post')
    });
  }

  restorePost(post: Post) {
    this.adminService.restorePost(post.id).subscribe({
      next: () => {
        post.status = 'published';
        this.updateStatistics();
        this.showMessage('Post restored successfully');
      },
      error: () => this.showMessage('Error restoring post')
    });
  }

  deletePost(postId: number) {
    if (!confirm('Are you sure you want to delete this post?')) return;
    this.adminService.deletePost(postId).subscribe({
      next: () => {
        this.posts = this.posts.filter(p => p.id !== postId);
        this.updateStatistics();
        this.showMessage('Post deleted successfully');
      },
      error: () => this.showMessage('Error deleting post')
    });
  }

  // Reports
  loadReports() {
    this.adminService.getReports().subscribe({
      next: (reports) => {
        this.reports = reports;
        this.updateStatistics();
      },
      error: () => this.showMessage('Error loading reports')
    });
  }

  resolveReport(report: Report) {
    this.adminService.resolveReport(report.id).subscribe({
      next: () => {
        report.status = 'resolved';
        this.updateStatistics();
        this.showMessage('Report resolved successfully');
      },
      error: () => this.showMessage('Error resolving report')
    });
  }

  dismissReport(reportId: number) {
    if (!confirm('Are you sure you want to dismiss this report?')) return;
    this.adminService.dismissReport(reportId).subscribe({
      next: () => {
        this.reports = this.reports.filter(r => r.id !== reportId);
        this.updateStatistics();
        this.showMessage('Report dismissed successfully');
      },
      error: () => this.showMessage('Error dismissing report')
    });
  }

  // Utils
  updateStatistics() {
    this.totalUsers = this.users.length;
    this.bannedUsers = this.users.filter(u => u.status === 'banned').length;
    this.totalPosts = this.posts.length;
    this.pendingReports = this.reports.filter(r => r.status === 'pending').length;
  }

  showMessage(message: string) {
    this.snackBar.open(message, 'Close', { duration: 3000 });
  }
}
