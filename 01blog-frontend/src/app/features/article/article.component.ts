import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';

interface Article {
  id: number;
  title: string;
  topic: string;
  banner: string;
  description: string;
  videos: any[];
  createdAt: string;
  firstName: string;
  lastName: string;
  profilePic: string;
}

@Component({
  selector: 'app-article',
  imports: [NavbarComponent, CommonModule],
  templateUrl: './article.component.html',
  styleUrls: ['./article.component.css']
})
export class ArticleComponent implements OnInit {
  article: Article = {
    id: 1,
    title: "this is my first post",
    topic: "technology",
    banner: "https://res.cloudinary.com/dsv24pun2/image/upload/v1758050040/rjiott3w7fflfwgr4gjw.jpg",
    description: "<h1>heeader </h1><p><br></p><p class=\"ql-align-center\"><img src=\"https://res.cloudinary.com/dsv24pun2/image/upload/v1758050040/gbb1ed8u7trpdqcec5wn.jpg\"></p><p class=\"ql-align-center\"><br></p><p class=\"ql-align-center\"><strong>this is what this is </strong></p>",
    videos: [],
    createdAt: "2025-09-16T20:14:01.312701",
    firstName: "d",
    lastName: "d",
    profilePic: "https://res.cloudinary.com/dsv24pun2/image/upload/v1758049984/ic4lp85bbjom7fhqhdsy.jpg"
  };

  ngOnInit(): void {
    // In a real app, you would fetch the article data from a service here
    // this.articleService.getArticle(id).subscribe(article => this.article = article);
  }

  getFormattedDate(dateString: string): string {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return date.toLocaleDateString('en-US', options);
  }

  getReadingTime(description: string): number {
    // Remove HTML tags and calculate reading time (average 200 words per minute)
    const text = description.replace(/<[^>]*>/g, '');
    const wordCount = text.split(' ').length;
    return Math.ceil(wordCount / 200);
  }

  onReportArticle(): void {
    console.log('Article reported:', this.article.id);
    // In a real app, you might show a snackbar or modal here
    alert('Article has been reported. Thank you for your feedback.');
  }

  getFullName(): string {
    return `${this.article.firstName} ${this.article.lastName}`;
  }

  capitalizeFirstLetter(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}