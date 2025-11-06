import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Article {
  userId: number;
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
  likeCount: number;
  commentCount: number;
  isLiked: boolean;
}

export interface PaginatedResponse {
  content: Article[];
  currentPage: number;
  totalPages: number;
  totalElements: number;
  hasNext: boolean;
}

export interface Comment {
  id: number;
  content: string;
  createdAt: string;
  firstName: string;
  lastName: string;
  profilePic: string;
  likeCount: number;
  isLiked: boolean;
}

export interface UserProfile {
  id: number;
  firstName: string;
  lastName: string;
  profilePic: string;
  bio: string;
  email: string;
  role: string;
  postCount: number;
  commentCount: number;
  likeCount: number;
  followersCount: number;
  followingCount: number;
}

@Injectable({
  providedIn: 'root'
})
export class ArticleService {
  private apiUrl = 'http://localhost:8080/api/post';
  private userUrl = 'http://localhost:8080/api/auth'

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') || '';

    return new HttpHeaders({ 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // --- Posts ---
  getAllPosts(page: number = 0, size: number = 10): Observable<PaginatedResponse> {
    return this.http.get<any>(`${this.apiUrl}/all?page=${page}&size=${size}`, { 
      headers: this.getAuthHeaders() 
    }).pipe(
      map(response => ({
        ...response,
        content: response.content.map((post: any) => ({
          ...post,
          isLiked: post.liked || false
        }))
      }))
    );
  }

  getMyPosts(): Observable<Article[]> {
    return this.http.get<any[]>(`${this.apiUrl}/mine`, { 
      headers: this.getAuthHeaders() 
    }).pipe(
      map(posts => posts.map(post => ({
        ...post,
        isLiked: post.liked || false
      })))
    );
  }

  getArticleById(postId: number): Observable<Article> {
    return this.http.get<any>(`${this.apiUrl}/${postId}`, { 
      headers: this.getAuthHeaders() 
    }).pipe(
      map(post => ({
        ...post,
        isLiked: post.liked || false
      }))
    );
  }

  getPostsByUserId(userId: number): Observable<Article[]> {
    return this.http.get<any[]>(`${this.apiUrl}/user/${userId}`, { 
      headers: this.getAuthHeaders() 
    }).pipe(
      map(posts => posts.map(post => ({
        ...post,
        isLiked: post.liked || false
      })))
    );
  }

  createPost(post: Partial<Article>): Observable<Article> {
    return this.http.post<any>(`${this.apiUrl}/create`, post, { 
      headers: this.getAuthHeaders() 
    }).pipe(
      map(createdPost => ({
        ...createdPost,
        isLiked: createdPost.liked || false
      }))
    );
  }

  updatePost(postId: number, post: Partial<Article>): Observable<Article> {
    return this.http.patch<any>(`${this.apiUrl}/edit/${postId}`, post, { 
      headers: this.getAuthHeaders() 
    }).pipe(
      map(updatedPost => ({
        ...updatedPost,
        isLiked: updatedPost.liked || false
      }))
    );
  }

  deletePost(postId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete/${postId}`, { 
      headers: this.getAuthHeaders() 
    });
  }

  likePost(postId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/like/${postId}`, {}, { 
      headers: this.getAuthHeaders() 
    });
  }

  searchBar(title: String, firstName: String) : Observable<any> {
    return this.http.get(`${this.apiUrl}/search?title=${title}&firstName=${firstName}`, { 
      headers: this.getAuthHeaders() 
    });
  }

  // --- Comments ---
  getComments(postId: number): Observable<Comment[]> {
    return this.http.get<Comment[]>(`${this.apiUrl}/${postId}/comments`, {
      headers: this.getAuthHeaders()
    });
  }

  addComment(postId: number, content: string): Observable<Comment> {
    return this.http.post<Comment>(`${this.apiUrl}/${postId}/comment`, 
      { content }, 
      { headers: this.getAuthHeaders() }
    );
  }

  likeComment(commentId: number): Observable<Comment> {
    return this.http.post<Comment>(`${this.apiUrl}/comment/${commentId}/like`, {}, {
      headers: this.getAuthHeaders()
    });
  }

  deleteComment(commentId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/comment/${commentId}`, {
      headers: this.getAuthHeaders()
    })
  }

  // --- User Profile ---
  getUserInfo(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.userUrl}/user`, { 
      headers: this.getAuthHeaders() 
    });
  }

  getUserById(userId: number): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.userUrl}/user/${userId}`, { 
      headers: this.getAuthHeaders() 
    });
  }

  updateUserInfo(user: Partial<UserProfile>): Observable<UserProfile> {
    if (!user.id) {
      throw new Error('User Id is requied to upate user info')
    }
    return this.http.patch<UserProfile>(`${this.userUrl}/user/${user.id}`, user, {
      headers: this.getAuthHeaders()
    })
  }

  changePassword(passwordData: { oldPassword: string; newPassword: string }): Observable<any> {
    const url = `${this.userUrl}/user/change-password`;
    const headers = this.getAuthHeaders();
    return this.http.patch(url, passwordData, { headers });
  }

  // --- Follow/Unfollow ---
  followUser(userId: number): Observable<any> {
    return this.http.post(`${this.userUrl}/follow/${userId}`, {}, { 
      headers: this.getAuthHeaders() 
    });
  }

  unfollowUser(userId: number): Observable<any> {
    return this.http.delete(`${this.userUrl}/follow/${userId}`, { 
      headers: this.getAuthHeaders() 
    });
  }

  isFollowing(userId: number): Observable<{ isFollowing: boolean }> {
    return this.http.get<{ isFollowing: boolean }>(`${this.userUrl}/follow/status/${userId}`, { 
      headers: this.getAuthHeaders() 
    });
  }

  // --- Report User ---
  reportUser(userId: number, reason: string): Observable<any> {
    return this.http.post(`${this.userUrl}/report/${userId}`, { reason }, { 
      headers: this.getAuthHeaders() 
    });
  }

  submitReport(reportData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/reports`, reportData);
  }


}