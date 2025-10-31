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
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from "../../shared/components/navbar/navbar.component";
import { AdminService, User, Post, Report } from "../../services/admin.service";
import { ConfirmDialogComponent } from "../../shared/components/confirm-dialog/confirm-component";
import { MatDialog } from "@angular/material/dialog";

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NavbarComponent,
    MatToolbarModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatChipsModule,
    MatSnackBarModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule
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

  filteredUsers: User[] = [];
  filteredPosts: Post[] = [];
  filteredReports: Report[] = [];

  // Search & Filter properties
  userSearchTerm = '';
  postSearchTerm = '';
  reportSearchTerm = '';

  userStatusFilter = 'all';
  postStatusFilter = 'all';
  reportStatusFilter = 'all';
  reportTypeFilter = 'all';

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

  // ==================== SEARCH & FILTER ====================
  onUserSearchChange() {
    this.filterUsers();
  }

  onPostSearchChange() {
    this.filterPosts();
  }

  onReportSearchChange() {
    this.filterReports();
  }

  onUserStatusFilterChange() {
    this.filterUsers();
  }

  onPostStatusFilterChange() {
    this.filterPosts();
  }

  onReportStatusFilterChange() {
    this.filterReports();
  }

  onReportTypeFilterChange() {
    this.filterReports();
  }

  filterUsers() {
    let result = this.users;

    if (this.userSearchTerm) {
      const term = this.userSearchTerm.toLowerCase();
      result = result.filter(u =>
        u.username.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term)
      );
    }

    if (this.userStatusFilter !== 'all') {
      result = result.filter(u => u.status === this.userStatusFilter);
    }

    this.filteredUsers = result;
  }

  filterPosts() {
    let result = this.posts;

    if (this.postSearchTerm) {
      const term = this.postSearchTerm.toLowerCase();
      result = result.filter(p =>
        p.title.toLowerCase().includes(term) ||
        p.author.toLowerCase().includes(term)
      );
    }

    if (this.postStatusFilter !== 'all') {
      result = result.filter(p => p.status === this.postStatusFilter);
    }

    this.filteredPosts = result;
  }

  filterReports() {
    let result = this.reports;

    if (this.reportSearchTerm) {
      const term = this.reportSearchTerm.toLowerCase();
      result = result.filter(r =>
        r.reporterUsername.toLowerCase().includes(term) ||
        r.reportedItem.toLowerCase().includes(term) ||
        r.reason.toLowerCase().includes(term)
      );
    }

    if (this.reportStatusFilter !== 'all') {
      result = result.filter(r => r.status === this.reportStatusFilter);
    }

    if (this.reportTypeFilter !== 'all') {
      result = result.filter(r => r.itemType === this.reportTypeFilter);
    }

    this.filteredReports = result;
  }

  clearUserFilters() {
    this.userSearchTerm = '';
    this.userStatusFilter = 'all';
    this.filterUsers();
  }

  clearPostFilters() {
    this.postSearchTerm = '';
    this.postStatusFilter = 'all';
    this.filterPosts();
  }

  clearReportFilters() {
    this.reportSearchTerm = '';
    this.reportStatusFilter = 'all';
    this.reportTypeFilter = 'all';
    this.filterReports();
  }

  // ==================== GENERIC CONFIRMATION ====================
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

  // ==================== USERS ====================
  loadUsers() {
    this.adminService.getUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.filterUsers();
        this.updateStatistics();
      },
      error: () => this.showMessage('Error loading users')
    });
  }

  onBanManagment(user: User , userStatus : any) {
   this.confirmAction(
     `Are you sure you want to ${userStatus === 'banned' ? 'unban' : 'ban'} "${user.username}"?`,
     () => this.banManagment(user, userStatus)
   )
  }

  banManagment(user: User , userStatus : any) {
    this.adminService.BanMangment(user.id, userStatus).subscribe( {
      next: () => {
        user.status = userStatus;
        this.filterUsers();
        this.updateStatistics();
        if(userStatus == "banned") {
          this.showMessage('User banned successfully');
        } else {
          this.showMessage('User unbanned successfully');
        }
      }, error: () => this.showMessage('Error banning or unbanning user')
    }) 
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
        this.filterUsers();
        this.updateStatistics();
        this.showMessage('User deleted successfully');
      },
      error: (error) => {
        this.showMessage('Error deleting user');
        console.error(error);
      }
    });
  }

  // ==================== POSTS ====================
  loadPosts() {
    this.adminService.getPosts().subscribe({
      next: (posts) => {
        this.posts = posts;
        this.filterPosts();
        console.log("status", this.posts);
        

        this.updateStatistics();
      },
      error: () => this.showMessage('Error loading posts')
    });
  }

  removePost(post: Post) {
    this.adminService.removePost(post.id).subscribe({
      next: () => {
        this.posts = this.posts.filter(p => p.id !== post.id);
        this.filterPosts();
        this.updateStatistics();
        this.showMessage('Post removed successfully');
      },
      error: () => this.showMessage('Error removing post')
    });
  }

  togglePostStatus(post: Post) {
        if (post.status === 'hidden') {
          this.confirmAction(
            `Are you sure you want to restore "${post.title}"?`,
            () => this.restorePost(post)
          );
        } else if (post.status === 'published') {
          this.confirmAction(
            `Are you sure you want to hide "${post.title}"?`,
            () => this.hidePost(post)
          )
        } else {
          this.showMessage('Cannot change status of this post')
        }
  }

  restorePost(post: Post) {
      this.adminService.restorePost(post.id).subscribe({
        next: () => {
          post.status = 'published';
          this.filterPosts();
          this.updateStatistics();
          this.showMessage('Post restored successfully');
        },
        error: () => this.showMessage('Error restoring post')
      });
    }

    hidePost(post: Post) {
      this.adminService.hidePost(post.id).subscribe({
        next: () => {
          post.status = 'hidden'
          this.filterPosts();
          this.updateStatistics();
          this.showMessage('Post hidden successfully');
        },
        error: () => this.showMessage('Error hiding post')
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
        this.filterPosts();
        this.updateStatistics();
        this.showMessage('Post deleted successfully');
      },
      error: () => this.showMessage('Error deleting post')
    });
  }

  // ==================== REPORTS ====================
  loadReports() {
    this.adminService.getReports().subscribe({
      next: (reports) => {
        this.reports = reports;
        this.filterReports();
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
        this.filterReports();
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
        this.filterReports();
        this.updateStatistics();
        this.showMessage('Report dismissed successfully');
      },
      error: () => this.showMessage('Error dismissing report')
    });
  }

  // ==================== UTILS ====================
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