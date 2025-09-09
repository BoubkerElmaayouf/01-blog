import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import {NavbarComponent} from '../../shared/components/navbar/navbar.component';

interface Article {
  id: number;
  title: string;
  subtitle: string;
  author: string;
  publication?: string;
  publishDate: string;
  readTime: string;
  claps: number;
  responses: number;
  imageUrl: string;
  category: string;
  featured?: boolean;
}

@Component({
  selector: 'app-explore',
  standalone: true,
  templateUrl: './explore.component.html',
  styleUrls: ['./explore.component.css'],
  imports: [
    NavbarComponent,
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule
  ]
})
export class ExploreComponent implements OnInit {
  selectedCategory = 'Products';
  categories = ['Products', 'SaaS', 'Gaming', 'Tech', 'Education'];
  
  articles: Article[] = [
    {
      id: 1,
      title: 'The 10 Morning Habits That Quietly Make You Unstoppable',
      subtitle: 'I Tried Them for 6 Months — The Results Were Unreal',
      author: 'Utsuk Agarwal',
      publication: 'Write A Catalyst',
      publishDate: 'Aug 11',
      readTime: '2.7K',
      claps: 77,
      responses: 0,
      imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
      category: 'Products',
      featured: true
    },
    {
      id: 2,
      title: "I'll Instantly Know You Used Chat Gpt If I See This",
      subtitle: "Trust me you're not as slick as you think",
      author: 'Ocsai Chrimedum',
      publication: 'Long Sweet, Valuable.',
      publishDate: 'May 16',
      readTime: '22K',
      claps: 1344,
      responses: 0,
      imageUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=300&fit=crop',
      category: 'Products'
    },
    {
      id: 3,
      title: "You Don't Need More Time To Learn. You Need a Learning System",
      subtitle: 'A framework for accelerated learning in the age of information overload',
      author: 'Axel Casas, PhD Candidate',
      publication: 'Cognitive',
      publishDate: 'Jun 23',
      readTime: '4.1K',
      claps: 892,
      responses: 12,
      imageUrl: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop',
      category: 'Education'
    },
    {
      id: 4,
      title: 'The Psychology Behind Successful SaaS Onboarding',
      subtitle: 'How to design user experiences that convert and retain customers',
      author: 'Sarah Chen',
      publication: 'SaaS Weekly',
      publishDate: 'Jul 8',
      readTime: '6.2K',
      claps: 1567,
      responses: 23,
      imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop',
      category: 'SaaS'
    },
    {
      id: 5,
      title: 'Indie Game Development: From Concept to Steam Success',
      subtitle: 'A comprehensive guide to building and launching your first indie game',
      author: 'Marcus Rodriguez',
      publication: 'Game Dev Stories',
      publishDate: 'Aug 2',
      readTime: '8.9K',
      claps: 2341,
      responses: 45,
      imageUrl: 'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=400&h=300&fit=crop',
      category: 'Gaming'
    },
    {
      id: 6,
      title: 'The Future of Web Development: What to Expect in 2024',
      subtitle: 'Emerging trends, technologies, and best practices shaping the industry',
      author: 'David Kim',
      publication: 'Tech Insights',
      publishDate: 'Jul 29',
      readTime: '5.3K',
      claps: 987,
      responses: 18,
      imageUrl: 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=400&h=300&fit=crop',
      category: 'Tech'
    }
  ];

  filteredArticles: Article[] = [];

  ngOnInit() {
    this.filterArticles();
  }

  selectCategory(category: string) {
    this.selectedCategory = category;
    this.filterArticles();
  }

  filterArticles() {
    this.filteredArticles = this.articles.filter(article => 
      article.category === this.selectedCategory
    );
  }

  onBookmark(article: Article, event: Event) {
    event.preventDefault();
    event.stopPropagation();
    console.log('Bookmarked article:', article.title);
  }

  onMore(article: Article, event: Event) {
    event.preventDefault();
    event.stopPropagation();
    console.log('More options for article:', article.title);
  }

  onArticleClick(article: Article) {
    console.log('Navigate to article:', article.title);
    // Handle article navigation here
  }
}