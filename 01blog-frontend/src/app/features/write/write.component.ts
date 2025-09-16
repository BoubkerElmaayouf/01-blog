import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from "@angular/core";
import { RouterModule } from "@angular/router";
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from "@angular/forms";
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { NavbarComponent } from "../../shared/components/navbar/navbar.component";
import { ImageUploadService } from "../../utils/image-upload.service";

// Quill imports
declare var Quill: any;

@Component({
    selector: 'app-write',
    standalone: true,
    imports: [
        RouterModule, 
        NavbarComponent,
        ReactiveFormsModule,
        CommonModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatButtonModule,
        MatIconModule,
        MatToolbarModule,
        MatSnackBarModule
    ],
    templateUrl: "./write.component.html",
    styleUrls: ['./write.component.css'], 
})


export class WriteComponent implements OnInit, AfterViewInit {
    @ViewChild('editor', { static: false }) editorElement!: ElementRef;
    
    postForm: FormGroup;
    quillEditor: any;
    selectedFile: File | null = null;
    imagePreview: string | null = null;
    isPublishing: boolean = false;
    
    categories = [
        { value: 'technology', label: 'Technology' },
        { value: 'lifestyle', label: 'Lifestyle' },
        { value: 'travel', label: 'Travel' },
        { value: 'food', label: 'Food' },
        { value: 'business', label: 'Business' },
        { value: 'health', label: 'Health' },
        { value: 'education', label: 'Education' },
        { value: 'entertainment', label: 'Entertainment' }
    ];

    constructor(
        private fb: FormBuilder,
        private http: HttpClient,
        private snackBar: MatSnackBar,
        private router: Router,
        private imageUploadService: ImageUploadService
    ) {
        this.postForm = this.fb.group({
            title: ['', [Validators.required, Validators.minLength(3)]],
            banner: [''],
            category: ['', Validators.required],
            content: ['', Validators.required]
        });
    }

    ngOnInit(): void {
        // Load Quill.js if not already loaded
        if (typeof Quill === 'undefined') {
            const script = document.createElement('script');
            script.src = 'https://cdn.quilljs.com/1.3.6/quill.min.js';
            script.onload = () => {
                this.initQuill();
            };
            document.head.appendChild(script);

            const link = document.createElement('link');
            link.href = 'https://cdn.quilljs.com/1.3.6/quill.snow.css';
            link.rel = 'stylesheet';
            document.head.appendChild(link);
        }
    }

    ngAfterViewInit(): void {
        if (typeof Quill !== 'undefined') {
            this.initQuill();
        }
    }

    private initQuill(): void {
        setTimeout(() => {
            if (this.editorElement) {
                this.quillEditor = new Quill(this.editorElement.nativeElement, {
                    theme: 'snow',
                    placeholder: 'Write your blog post content here...',
                    modules: {
                        toolbar: [
                            ['bold', 'italic', 'underline', 'strike'],
                            ['blockquote', 'code-block'],
                            [{ 'header': 1 }, { 'header': 2 }],
                            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                            [{ 'script': 'sub'}, { 'script': 'super' }],
                            [{ 'indent': '-1'}, { 'indent': '+1' }],
                            [{ 'direction': 'rtl' }],
                            [{ 'size': ['small', false, 'large', 'huge'] }],
                            [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                            [{ 'color': [] }, { 'background': [] }],
                            [{ 'font': [] }],
                            [{ 'align': [] }],
                            ['clean'],
                            ['link', 'image'],
                            ['video'],
                        ]
                    }
                });

                // Update form control when editor content changes
                this.quillEditor.on('text-change', () => {
                    const content = this.quillEditor.root.innerHTML;
                    this.postForm.get('content')?.setValue(content);
                });
            }
        }, 100);
    }

    onFileSelected(event: Event, fileInput: HTMLInputElement): void {
        if (fileInput.files && fileInput.files.length > 0) {
            this.selectedFile = fileInput.files[0];
            
            // Create image preview
            const reader = new FileReader();
            reader.onload = (e: any) => {
                this.imagePreview = e.target.result;
            };
            reader.readAsDataURL(this.selectedFile);
            
            this.postForm.get('banner')?.setValue(this.selectedFile.name);
        }
    }

    removeImage(fileInput: HTMLInputElement): void {
        this.selectedFile = null;
        this.imagePreview = null;
        this.postForm.get('banner')?.setValue('');
        fileInput.value = '';
    }

    triggerFileInput(fileInput: HTMLInputElement): void {
        fileInput.click();
    }

    private async extractAndUploadImagesFromContent(content: string): Promise<string> {
        const parser = new DOMParser();
        const doc = parser.parseFromString(content, 'text/html');
        const images = doc.querySelectorAll('img');
        
        for (const img of Array.from(images)) {
            const src = img.getAttribute('src');
            
            // Skip if it's already a Cloudinary URL or external URL
            if (!src || src.startsWith('http') || src.startsWith('https://res.cloudinary.com')) {
                continue;
            }
            
            // Handle base64 images
            if (src.startsWith('data:image')) {
                try {
                    // Convert base64 to File
                    const response = await fetch(src);
                    const blob = await response.blob();
                    const file = new File([blob], 'content-image.png', { type: blob.type });
                    
                    // Upload to Cloudinary
                    const cloudinaryUrl = await this.imageUploadService.uploadImage(file);
                    img.setAttribute('src', cloudinaryUrl);
                } catch (error) {
                    console.error('Error uploading content image:', error);
                }
            }
        }
        
        return doc.body.innerHTML;
    }

    async onPublish(): Promise<void> {
        if (!this.postForm.valid) {
            this.markFormGroupTouched();
            this.snackBar.open('Please fill in all required fields', 'Close', {
                duration: 3000,
                panelClass: ['error-snackbar']
            });
            return;
        }

        this.isPublishing = true;

        try {
            let bannerUrl = '';
            let processedContent = this.quillEditor?.root.innerHTML || '';

            // Upload banner image if exists
            if (this.selectedFile) {
                this.snackBar.open('Uploading banner image...', '', { duration: 2000 });
                bannerUrl = await this.imageUploadService.uploadImage(this.selectedFile);
            }

            // Process and upload images in content
            this.snackBar.open('Processing content images...', '', { duration: 2000 });
            processedContent = await this.extractAndUploadImagesFromContent(processedContent);

            // Get JWT token from localStorage or wherever you store it
            const token = localStorage.getItem('token'); // Adjust this based on where you store your token
            
            if (!token) {
                throw new Error('Authentication token not found. Please log in again.');
            }

            // Prepare post data
            const postData = {
                title: this.postForm.get('title')?.value,
                topic: this.postForm.get('category')?.value,
                banner: bannerUrl,
                description: processedContent,
                videos: [] // empty array instead of string
            };


            // Create headers
            const headers = new HttpHeaders({
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            });

            this.snackBar.open('Publishing post...', '', { duration: 2000 });

            // Make API call
            const response = await this.http.post('http://localhost:8080/api/post/create', postData, { headers }).toPromise();

            this.snackBar.open('Post published successfully!', 'Close', {
                duration: 3000,
                panelClass: ['success-snackbar']
            });

            // Reset form
            this.postForm.reset();
            this.selectedFile = null;
            this.imagePreview = null;
            if (this.quillEditor) {
                this.quillEditor.setContents([]);
            }
            console.log('contnet after reset', this.quillEditor?.root.innerHTML);
            
            // Navigate to posts list or home page
            // this.router.navigate(['/posts']); // Uncomment and adjust route as needed

        } catch (error: any) {
            console.error('Error publishing post:', error);
            this.snackBar.open(
                error.message || 'Failed to publish post. Please try again.',
                'Close',
                {
                    duration: 5000,
                    panelClass: ['error-snackbar']
                }
            );
        } finally {
            this.isPublishing = false;
        }
    }

    private markFormGroupTouched(): void {
        Object.keys(this.postForm.controls).forEach(key => {
            this.postForm.get(key)?.markAsTouched();
        });
    }

    getErrorMessage(fieldName: string): string {
        const control = this.postForm.get(fieldName);
        if (control?.hasError('required')) {
            return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
        }
        if (control?.hasError('minlength')) {
            return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} must be at least 3 characters long`;
        }
        return '';
    }
}

