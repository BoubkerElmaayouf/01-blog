import { Component, OnInit } from "@angular/core";
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { NavbarComponent } from "../../shared/components/navbar/navbar.component";

export interface User {
  id: number;
  username: string;
  email: string;
  joinDate: Date;
  postsCount: number;
  status: 'active' | 'banned';
}

export interface Post {
  id: number;
  title: string;
  author: string;
  publishDate: Date;
  views: number;
  status: 'published' | 'removed';
}

export interface Report {
  id: number;
  reporterUsername: string;
  reportedItem: string;
  itemType: 'user' | 'post';
  reason: string;
  reportDate: Date;
  status: 'pending' | 'resolved';
}

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
        MatChipsModule
    ],
    templateUrl: './admin.component.html',
    styleUrls: ['./admin.component.css']
})

export class AdminComponent implements OnInit {
  // Statistics
  totalUsers = 0;
  bannedUsers = 0;
  totalPosts = 0;
  pendingReports = 0;

  // Table data
  users: User[] = [];
  posts: Post[] = [];
  reports: Report[] = [];

  // Table columns
  userColumns: string[] = ['id', 'username', 'email', 'joinDate', 'postsCount', 'status', 'actions'];
  postColumns: string[] = ['id', 'title', 'author', 'publishDate', 'views', 'status', 'actions'];
  reportColumns: string[] = ['id', 'reporter', 'reportedItem', 'itemType', 'reason', 'reportDate', 'status', 'actions'];

  ngOnInit() {
    this.loadMockData();
    this.updateStatistics();
  }

  loadMockData() {
    // Mock users data
    this.users = [
      {
        id: 1,
        username: 'john_doe',
        email: 'john@example.com',
        joinDate: new Date('2024-01-15'),
        postsCount: 12,
        status: 'active'
      },
      {
        id: 2,
        username: 'jane_smith',
        email: 'jane@example.com',
        joinDate: new Date('2024-02-20'),
        postsCount: 8,
        status: 'active'
      },
      {
        id: 3,
        username: 'spam_user',
        email: 'spam@example.com',
        joinDate: new Date('2024-03-10'),
        postsCount: 25,
        status: 'banned'
      },
      {
        id: 4,
        username: 'alice_writer',
        email: 'alice@example.com',
        joinDate: new Date('2024-01-05'),
        postsCount: 18,
        status: 'active'
      },
      {
        id: 5,
        username: 'toxic_user',
        email: 'toxic@example.com',
        joinDate: new Date('2024-04-01'),
        postsCount: 3,
        status: 'banned'
      }
    ];

    // Mock posts data
    this.posts = [
      {
        id: 1,
        title: 'Getting Started with Angular',
        author: 'john_doe',
        publishDate: new Date('2024-08-15'),
        views: 1250,
        status: 'published'
      },
      {
        id: 2,
        title: 'Advanced TypeScript Techniques',
        author: 'jane_smith',
        publishDate: new Date('2024-08-20'),
        views: 890,
        status: 'published'
      },
      {
        id: 3,
        title: 'Inappropriate Content Example',
        author: 'spam_user',
        publishDate: new Date('2024-09-01'),
        views: 45,
        status: 'removed'
      },
      {
        id: 4,
        title: 'Best Practices for Web Development',
        author: 'alice_writer',
        publishDate: new Date('2024-09-05'),
        views: 2100,
        status: 'published'
      },
      {
        id: 5,
        title: 'Spam Post Title',
        author: 'spam_user',
        publishDate: new Date('2024-09-10'),
        views: 12,
        status: 'removed'
      }
    ];

    // Mock reports data
    this.reports = [
      {
        id: 1,
        reporterUsername: 'jane_smith',
        reportedItem: 'spam_user',
        itemType: 'user',
        reason: 'Spam and inappropriate behavior',
        reportDate: new Date('2024-09-08'),
        status: 'resolved'
      },
      {
        id: 2,
        reporterUsername: 'john_doe',
        reportedItem: 'Inappropriate Content Example',
        itemType: 'post',
        reason: 'Offensive content',
        reportDate: new Date('2024-09-09'),
        status: 'resolved'
      },
      {
        id: 3,
        reporterUsername: 'alice_writer',
        reportedItem: 'toxic_user',
        itemType: 'user',
        reason: 'Harassment and toxic behavior',
        reportDate: new Date('2024-09-11'),
        status: 'pending'
      }
    ];
  }

  updateStatistics() {
    this.totalUsers = this.users.length;
    this.bannedUsers = this.users.filter(user => user.status === 'banned').length;
    this.totalPosts = this.posts.length;
    this.pendingReports = this.reports.filter(report => report.status === 'pending').length;
  }

  // User management actions
  banUser(user: User) {
    user.status = 'banned';
    this.updateStatistics();
  }

  unbanUser(user: User) {
    user.status = 'active';
    this.updateStatistics();
  }

  deleteUser(userId: number) {
    this.users = this.users.filter(user => user.id !== userId);
    this.updateStatistics();
  }

  // Post management actions
  removePost(post: Post) {
    post.status = 'removed';
    this.updateStatistics();
  }

  restorePost(post: Post) {
    post.status = 'published';
    this.updateStatistics();
  }

  deletePost(postId: number) {
    this.posts = this.posts.filter(post => post.id !== postId);
    this.updateStatistics();
  }

  // Report management actions
  resolveReport(report: Report) {
    report.status = 'resolved';
    this.updateStatistics();
  }

  dismissReport(reportId: number) {
    this.reports = this.reports.filter(report => report.id !== reportId);
    this.updateStatistics();
  }
}