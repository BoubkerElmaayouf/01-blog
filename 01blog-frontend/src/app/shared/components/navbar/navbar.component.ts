import { Component, OnInit, OnDestroy } from '@angular/core';
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
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router, RouterModule } from '@angular/router';
import { ArticleService, UserProfile } from '../../../services/article.service';
import { SearchService, SearchUserPostResponse } from '../../../services/search.service';
import { NotificationService, Notification } from '../../../services/notification.service';
import { Subject, Subscription, interval } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, filter, startWith } from 'rxjs/operators';

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
    MatProgressSpinnerModule,
    RouterModule
  ],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit, OnDestroy {
  searchQuery: string = '';
  isMobileMenuOpen: boolean = false;
  isAdmin: boolean = false;
  
  // Search functionality
  searchResults: SearchUserPostResponse[] = [];
  showSearchResults: boolean = false;
  isSearching: boolean = false;
  private searchSubject = new Subject<string>();
  private searchSubscription?: Subscription;

  // User profile data
  userProfile: UserProfile | null = null;

  // Notifications
  notifications: Notification[] = [];
  private notificationSubscription?: Subscription;
  private notificationPollingSubscription?: Subscription;

  constructor(
    private articleService: ArticleService,
    private searchService: SearchService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUserProfile();
    this.initializeSearch();
    this.loadNotifications();
    this.startNotificationPolling();
  }

  ngOnDestroy(): void {
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
    if (this.notificationSubscription) {
      this.notificationSubscription.unsubscribe();
    }
    if (this.notificationPollingSubscription) {
      this.notificationPollingSubscription.unsubscribe();
    }
  }

  private initializeSearch(): void {
    this.searchSubscription = this.searchSubject.pipe(
      debounceTime(700),
      distinctUntilChanged(),
      filter(query => query.trim().length > 0),
      switchMap(query => {
        this.isSearching = true;
        return this.searchService.searchBar(query);
      })
    ).subscribe({
      next: (results) => {
        if (Array.isArray(results)) {
          this.searchResults = results;
        } else if (results && typeof results === 'object') {
          this.searchResults = (results as any).data || [];
          console.warn('API returned object instead of array:', results);
        } else {
          this.searchResults = [];
        }
        this.showSearchResults = true;
        this.isSearching = false;
        console.log('Search results:', this.searchResults);
      },
      error: (err) => {
        console.error('Search error:', err);
        this.searchResults = [];
        this.isSearching = false;
        this.showSearchResults = false;
      }
    });
  }

  private loadUserProfile(): void {
    this.articleService.getUserInfo().subscribe({
      next: (profile) => {
        this.userProfile = profile;
        if (profile && profile.role == 'ADMIN') {
          this.isAdmin = true;
        }else {
          this.isAdmin = false;
        }
        console.log('Fetched user profile:', profile);
      },
      error: (err) => {
        console.error('Error fetching user profile:', err);
      }
    });
  }

  private loadNotifications(): void {
    this.notificationSubscription = this.notificationService.getAllNotifications().subscribe({
      next: (notifications) => {
        this.notifications = this.sortNotifications(notifications);
        console.log('Fetched notifications:', notifications);
      },
      error: (err) => {
        console.error('Error fetching notifications:', err);
        this.notifications = [];
      }
    });
  }

  private startNotificationPolling(): void {
    // Poll for new notifications every 30 seconds
    this.notificationPollingSubscription = interval(30000).pipe(
      startWith(0)
    ).subscribe(() => {
      this.notificationService.getAllNotifications().subscribe({
        next: (notifications) => {
          this.notifications = this.sortNotifications(notifications);
        },
        error: (err) => {
          console.error('Error polling notifications:', err);
        }
      });
    });
  }

  onSearchInput(): void {
    const query = this.searchQuery.trim();
    
    if (query.length === 0) {
      this.showSearchResults = false;
      this.searchResults = [];
      this.isSearching = false;
      return;
    }
    
    this.searchSubject.next(query);
  }

  onSearchFocus(): void {
    if (this.searchQuery.trim().length > 0 && this.searchResults.length > 0) {
      this.showSearchResults = true;
    }
  }

  onSearchBlur(): void {
    setTimeout(() => {
      this.showSearchResults = false;
    }, 200);
  }

  onSearchResultClick(result: SearchUserPostResponse): void {
    this.showSearchResults = false;
    this.searchQuery = '';
    this.searchResults = [];
    console.log('Clicked search result:', result.postId);
    this.router.navigate(['/explore', result.postId]);
  }

  onUserClick(result: SearchUserPostResponse, event: Event): void {
    event.stopPropagation();
    this.showSearchResults = false;
    this.searchQuery = '';
    this.searchResults = [];
    console.log('Clicked user result:', result.userId);
    this.router.navigate(['/profile', result.userId]);
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.searchResults = [];
    this.showSearchResults = false;
    this.isSearching = false;
  }

  getTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
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
    if (diffInDays < 30) {
      return `${diffInDays}d ago`;
    }
    
    const diffInMonths = Math.floor(diffInDays / 30);
    return `${diffInMonths}mo ago`;
  }

  get unreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  onSearch(): void {
    if (this.searchQuery.trim()) {
      console.log('Searching for:', this.searchQuery);
    }
  }

  onNotificationClick(): void {
    console.log('Notification button clicked');
    // Refresh notifications when menu is opened
    this.loadNotifications();
  }


  onNotificationItemClick(notification: Notification): void {
    if (!notification.read) {
      this.notificationService.markAsRead(notification.id).subscribe(() => {
        notification.read = true;
      });
    }

    if (notification.type === 'POST') {
      this.router.navigate(['/explore', notification.postId]);
    } else if (notification.type === 'PROFILE') {
      this.router.navigate(['/explore', notification.commentId]);
    } else if (notification.type === 'COMMENT') {
      // Example route for comment
      this.router.navigate(['/explore', notification.id]);
    }
  }


  toggleReadStatus(notification: Notification): void {
    if (notification.read) {
      // Mark as unread (locally only - you may need an API endpoint for this)
      notification.read = false;
      console.log(`Notification ${notification.id} marked as unread (locally)`);
    } else {
      this.notificationService.markAsRead(notification.id).subscribe({
        next: () => {
          notification.read = true;
          console.log(`Notification ${notification.id} marked as read`);
        },
        error: (err) => {
          console.error('Error marking notification as read:', err);
        }
      });
    }
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead().subscribe({
      next: () => {
        this.notifications.forEach(notification => {
          notification.read = true;
        });
        console.log('All notifications marked as read');
      },
      error: (err) => {
        console.error('Error marking all notifications as read:', err);
      }
    });
  }

  getNotificationMessage(notification: Notification): string {
    return notification.message;
  }

  getNotificationTimeAgo(timestamp: string): string {
    // Parse ISO timestamp format: "2025-10-04T22:10:28.163821"
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    // Less than a minute
    if (diffInSeconds < 60) {
      return 'just now';
    }
    
    // Less than an hour
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return diffInMinutes === 1 ? '1 minute ago' : `${diffInMinutes} minutes ago`;
    }
    
    // Less than a day
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return diffInHours === 1 ? '1 hour ago' : `${diffInHours} hours ago`;
    }
    
    // Less than a week
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
      return diffInDays === 1 ? '1 day ago' : `${diffInDays} days ago`;
    }
    
    // Less than a month
    if (diffInDays < 30) {
      const diffInWeeks = Math.floor(diffInDays / 7);
      return diffInWeeks === 1 ? '1 week ago' : `${diffInWeeks} weeks ago`;
    }
    
    // Less than a year
    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) {
      return diffInMonths === 1 ? '1 month ago' : `${diffInMonths} months ago`;
    }
    
    // Over a year
    const diffInYears = Math.floor(diffInDays / 365);
    return diffInYears === 1 ? '1 year ago' : `${diffInYears} years ago`;
  }

  trackByNotificationId(index: number, notification: Notification): number {
    return notification.id;
  }

  trackBySearchResult(index: number, result: SearchUserPostResponse): number {
    return result.postId;
  }

  private sortNotifications(notifications: Notification[]): Notification[] {
    return notifications.sort((a, b) => {
      // Unread notifications first
      if (a.read !== b.read) {
        return a.read ? 1 : -1;
      }
      // Then sort by createdAt (newest first)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  onLogout(): void {
    this.isMobileMenuOpen = false;
    window.localStorage.removeItem('token');
    window.location.href = '/login';
    console.log('Logout clicked');
  }
}