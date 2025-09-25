import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';
import { MatDividerModule } from '@angular/material/divider';
import { Router, RouterModule } from '@angular/router';
import { ArticleService, UserProfile } from '../../../services/article.service';

export interface Notification {
  id: string;
  type: 'like' | 'comment' | 'follow' | 'mention' | 'post';
  userId: string;
  userName: string;
  avatar: string;
  content?: string;
  postTitle?: string;
  timestamp: Date;
  read: boolean;
}

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatMenuModule,
    MatBadgeModule,
    MatTooltipModule,
    FormsModule,
    MatDividerModule,
    RouterModule
  ],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  searchQuery: string = '';
  isMobileMenuOpen: boolean = false;

  // User profile data
  userProfile : UserProfile | null = null;

  // Sample notifications data
  notifications: Notification[] = [
    {
      id: '1',
      type: 'like',
      userId: 'user1',
      userName: 'Sarah Johnson',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b789?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      postTitle: 'My thoughts on modern web development',
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      read: false
    },
    {
      id: '2',
      type: 'comment',
      userId: 'user2',
      userName: 'Mike Chen',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      content: 'Great insights! I completely agree with your perspective.',
      postTitle: 'The future of AI in healthcare',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      read: false
    },
    {
      id: '3',
      type: 'follow',
      userId: 'user3',
      userName: 'Emily Rodriguez',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
      read: true
    },
    {
      id: '4',
      type: 'mention',
      userId: 'user4',
      userName: 'David Kim',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      content: 'mentioned you in a comment',
      postTitle: 'Best practices for team collaboration',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8), // 8 hours ago
      read: true
    },
    {
      id: '5',
      type: 'post',
      userId: 'user5',
      userName: 'Lisa Wang',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      content: 'published a new article',
      postTitle: 'Understanding React Server Components',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12), // 12 hours ago
      read: false
    }
  ];

  constructor (private articleService: ArticleService, private router: Router) {}


  ngOnInit(): void {
    // Initialize component
    this.sortNotifications();
    this.loadUserProfile();
  }

   private loadUserProfile(): void {
      this.articleService.getUserInfo().subscribe({
        next: (profile) => {
          this.userProfile = profile
          console.log('Fetched user profile:', profile)
        },
        error: (err) => {
          console.error('Error fetching user profile:', err);
        }
      });
    }

  get unreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  onSearch(): void {
    if (this.searchQuery.trim()) {
      console.log('Searching for:', this.searchQuery);
      // Implement search functionality here
    }
  }

  onNotificationClick(): void {
    console.log('Notification button clicked');
    // Additional logic when notification button is clicked
  }

  onNotificationItemClick(notification: Notification): void {
    console.log('Notification clicked:', notification);
    
    // Mark as read if not already read
    if (!notification.read) {
      notification.read = true;
    }
    
    // Navigate based on notification type
    this.navigateToNotificationTarget(notification);
  }

  toggleReadStatus(notification: Notification): void {
    notification.read = !notification.read;
    console.log(`Notification ${notification.id} marked as ${notification.read ? 'read' : 'unread'}`);
  }

  markAllAsRead(): void {
    this.notifications.forEach(notification => {
      notification.read = true;
    });
    console.log('All notifications marked as read');
  }

  getNotificationMessage(notification: Notification): string {
    switch (notification.type) {
      case 'like':
        return `liked your post "${notification.postTitle}"`;
      case 'comment':
        return `commented on your post "${notification.postTitle}": "${notification.content}"`;
      case 'follow':
        return 'started following you';
      case 'mention':
        return `mentioned you in "${notification.postTitle}"`;
      case 'post':
        return `published a new article: "${notification.postTitle}"`;
      default:
        return 'interacted with your content';
    }
  }

  getTimeAgo(timestamp: Date): string {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - timestamp.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return 'just now';
    }
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    }
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
      return `${diffInDays}d ago`;
    }
    
    const diffInWeeks = Math.floor(diffInDays / 7);
    return `${diffInWeeks}w ago`;
  }

  trackByNotificationId(index: number, notification: Notification): string {
    return notification.id;
  }

  private navigateToNotificationTarget(notification: Notification): void {
    // Implement navigation logic based on notification type
    switch (notification.type) {
      case 'like':
      case 'comment':
      case 'mention':
        // Navigate to the specific post
        console.log(`Navigating to post: ${notification.postTitle}`);
        // this.router.navigate(['/post', notification.postId]);
        break;
      case 'follow':
        // Navigate to the user's profile
        console.log(`Navigating to user profile: ${notification.userName}`);
        // this.router.navigate(['/profile', notification.userId]);
        break;
      case 'post':
        // Navigate to the new post
        console.log(`Navigating to new post: ${notification.postTitle}`);
        // this.router.navigate(['/post', notification.postId]);
        break;
      default:
        console.log('Unknown notification type');
    }
  }

  private sortNotifications(): void {
    // Sort notifications by timestamp (newest first) and unread status
    this.notifications.sort((a, b) => {
      // Unread notifications first
      if (a.read !== b.read) {
        return a.read ? 1 : -1;
      }
      // Then by timestamp (newest first)
      return b.timestamp.getTime() - a.timestamp.getTime();
    });
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  onLogout(): void {
    this.isMobileMenuOpen = false;
    window.location.href = '/login';
    window.localStorage.removeItem('token');
    
    console.log('Logout clicked');
    // Handle logout functionality
  }
}