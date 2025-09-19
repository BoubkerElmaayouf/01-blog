import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { Router } from '@angular/router';
import { LoaderComponent } from '../../shared/components/loader/loader.component';

interface Post {
  id: number;
  title: string;
  topic: string;
  banner: string;
  description: string;
  videos: string[];
  createdAt: string;
  firstName: string;
  lastName: string;
  profilePic: string;
  // Added interaction counts
  likes?: number;
  comments?: number;
  saves?: number;
  isLiked?: boolean;
  isSaved?: boolean;
}

@Component({
  selector: 'app-explore',
  standalone: true,
  templateUrl: './explore.component.html',
  styleUrls: ['./explore.component.css'],
  imports: [
    NavbarComponent,
    CommonModule,
    HttpClientModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatMenuModule,
    MatSnackBarModule,
    LoaderComponent
  ]
})
export class ExploreComponent implements OnInit {
  selectedCategory = 'Tech';
  categories = ['Tech', 'Education', 'Products', 'SaaS', 'Gaming'];
   isLoading: boolean = true;

  posts: Post[] = [];
  filteredPosts: Post[] = [];

  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit() {
    this.fetchPosts();
  }

  fetchPosts() {
    this.http.get<Post[]>('http://localhost:8080/api/post/all')
      .subscribe({
        next: (data) => {
          // Mock interaction data since it's not in your API
          this.posts = data.map(post => ({
            ...post,
            likes: Math.floor(Math.random() * 500) + 10,
            comments: Math.floor(Math.random() * 50) + 1,
            saves: Math.floor(Math.random() * 100) + 5,
            isLiked: Math.random() > 0.7,
            isSaved: Math.random() > 0.8
          }));
          console.log('Fetched posts:', this.posts);
          this.isLoading = false;
          this.filterPosts();
        },
        error: (err) => console.error('Error fetching posts:', err)
      });
  }

  selectCategory(category: string) {
    this.selectedCategory = category;
    this.filterPosts();
  }

  filterPosts() {
    this.filteredPosts = this.posts.filter(
      post => post.topic.toLowerCase() === this.selectedCategory.toLowerCase()
    );
  }

  onLike(post: Post, event: Event) {
    event.preventDefault();
    event.stopPropagation();
    
    if (post.isLiked) {
      post.likes = (post.likes || 0) - 1;
      post.isLiked = false;
    } else {
      post.likes = (post.likes || 0) + 1;
      post.isLiked = true;
    }
    
    console.log('Liked post:', post.title, 'Total likes:', post.likes);
  }

  onSave(post: Post, event: Event) {
    event.preventDefault();
    event.stopPropagation();
    
    if (post.isSaved) {
      post.saves = (post.saves || 0) - 1;
      post.isSaved = false;
      this.snackBar.open('Removed from saved posts', '', { duration: 2000 });
    } else {
      post.saves = (post.saves || 0) + 1;
      post.isSaved = true;
      this.snackBar.open('Post saved!', '', { duration: 2000 });
    }
    
    console.log('Saved post:', post.title, 'Total saves:', post.saves);
  }

  onComment(post: Post, event: Event) {
    event.preventDefault();
    event.stopPropagation();
    console.log('Navigate to comments for post:', post.title);
    // Navigate to post detail page with comments section
  }

  onReport(post: Post) {
    console.log('Report post:', post.title);
    this.snackBar.open('Post reported', '', { duration: 2000 });
  }

  onUpdate(post: Post) {
    console.log('Update post:', post.title);
    // Navigate to edit post page
  }

  onDelete(post: Post) {
    console.log('Delete post:', post.title);
    // Show confirmation dialog and delete
    this.snackBar.open('Post deleted', '', { duration: 2000 });
  }

  onPostClick(post: Post) {
    this.router.navigate(['/explore', post.id]);
    console.log('Navigate to post:', post.id);
    // Navigate to a post detail page if you have routing
  }

  formatCount(count: number = 0): string {
    if (count >= 1000) {
      return (count / 1000).toFixed(1) + 'k';
    }
    return count.toString();
  }
}