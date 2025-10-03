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
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, filter } from 'rxjs/operators';

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
    MatProgressSpinnerModule,
    RouterModule
  ],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit, OnDestroy {
  searchQuery: string = '';
  isMobileMenuOpen: boolean = false;
  
  // Search functionality
  searchResults: SearchUserPostResponse[] = [];
  showSearchResults: boolean = false;
  isSearching: boolean = false;
  private searchSubject = new Subject<string>();
  private searchSubscription?: Subscription;

  // User profile data
  userProfile: UserProfile | null = null;

  // Sample notifications data
  notifications: Notification[] = [
    {
      id: '1',
      type: 'like',
      userId: 'user1',
      userName: 'Sarah Johnson',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b789?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      postTitle: 'My thoughts on modern web development',
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
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
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      read: false
    },
    {
      id: '3',
      type: 'follow',
      userId: 'user3',
      userName: 'Emily Rodriguez',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5),
      read: true
    },
  ];

  constructor(
    private articleService: ArticleService,
    private searchService: SearchService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.sortNotifications();
    this.loadUserProfile();
    this.initializeSearch();
  }

  ngOnDestroy(): void {
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
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
        // Ensure results is always an array
        if (Array.isArray(results)) {
          this.searchResults = results;
        } else if (results && typeof results === 'object') {
          // If the API returns an object with a data property containing the array
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
        console.log('Fetched user profile:', profile);
      },
      error: (err) => {
        console.error('Error fetching user profile:', err);
      }
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
    // Delay to allow click events on search results
    setTimeout(() => {
      this.showSearchResults = false;
    }, 200);
  }

  onSearchResultClick(result: SearchUserPostResponse): void {
    this.showSearchResults = false;
    this.searchQuery = '';
    this.searchResults = [];
    
    // Navigate to the post
    this.router.navigate(['/post', result.postId]);
  }

  onUserClick(result: SearchUserPostResponse, event: Event): void {
    event.stopPropagation();
    this.showSearchResults = false;
    this.searchQuery = '';
    this.searchResults = [];
    
    // Navigate to user profile
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
  }

  onNotificationItemClick(notification: Notification): void {
    console.log('Notification clicked:', notification);
    
    if (!notification.read) {
      notification.read = true;
    }
    
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

  getNotificationTimeAgo(timestamp: Date): string {
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

  trackBySearchResult(index: number, result: SearchUserPostResponse): number {
    return result.postId;
  }

  private navigateToNotificationTarget(notification: Notification): void {
    switch (notification.type) {
      case 'like':
      case 'comment':
      case 'mention':
        console.log(`Navigating to post: ${notification.postTitle}`);
        break;
      case 'follow':
        console.log(`Navigating to user profile: ${notification.userName}`);
        break;
      case 'post':
        console.log(`Navigating to new post: ${notification.postTitle}`);
        break;
      default:
        console.log('Unknown notification type');
    }
  }

  private sortNotifications(): void {
    this.notifications.sort((a, b) => {
      if (a.read !== b.read) {
        return a.read ? 1 : -1;
      }
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
  }
}