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
import { ConfirmDialogComponent } from "../../shared/components/confirm-dialog/confirm-component";
import { MatDialog } from "@angular/material/dialog";

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
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.loadAllData();
  }

  loadAllData() {
    this.loadUsers();
    this.loadPosts();
    this.loadReports();
  }

  // ------------------ Generic Confirmation ------------------
  confirmAction(message: string, action: () => void, event?: Event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: { message }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        action();
      }
    });
  }

  // ------------------ Users ------------------
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

  openDeleteUserDialog(user: User, event: Event) {
    this.confirmAction(
      `Are you sure you want to delete "${user.username}"?`,
      () => this.deleteUser(user.id),
      event
    );
  }

  deleteUser(userId: number) {
    this.adminService.deleteUser(userId).subscribe({
      next: () => {
        this.users = this.users.filter(u => u.id !== userId);
        this.updateStatistics();
        this.showMessage('User deleted successfully');
      },
      error: (error) => {
        this.showMessage('Error deleting user');
        console.error(error);
      }
    });
  }

  // ------------------ Posts ------------------
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

  openDeletePostDialog(post: Post, event: Event) {
    this.confirmAction(
      `Are you sure you want to delete "${post.title}"?`,
      () => this.deletePost(post.id),
      event
    );
  }

  deletePost(postId: number) {
    this.adminService.deletePost(postId).subscribe({
      next: () => {
        this.posts = this.posts.filter(p => p.id !== postId);
        this.updateStatistics();
        this.showMessage('Post deleted successfully');
      },
      error: () => this.showMessage('Error deleting post')
    });
  }

  // ------------------ Reports ------------------
  loadReports() {
    this.adminService.getReports().subscribe({
      next: (reports) => {
        this.reports = reports;
        this.updateStatistics();
      },
      error: () => this.showMessage('Error loading reports')
    });
  }

  onResolveReport(report: Report, event: Event) {
    this.confirmAction(
      `Are you sure you want to resolve this report?`,
      () => this.resolveReport(report),
      event
    );
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

  openDismissReportDialog(report: Report, event: Event) {
    this.confirmAction(
      `Are you sure you want to dismiss this report?`,
      () => this.dismissReport(report.id),
      event
    );
  }

  dismissReport(reportId: number) {
    this.adminService.dismissReport(reportId).subscribe({
      next: () => {
        this.reports = this.reports.filter(r => r.id !== reportId);
        this.updateStatistics();
        this.showMessage('Report dismissed successfully');
      },
      error: () => this.showMessage('Error dismissing report')
    });
  }

  // ------------------ Utils ------------------
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
