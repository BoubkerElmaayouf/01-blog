import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { lastValueFrom } from "rxjs";

@Injectable({ providedIn: 'root' })
export class ImageUploadService {
  private cloudName = 'dsv24pun2';
  private uploadPreset = '01blog';

  constructor(private http: HttpClient) {}

  // Upload image or video
  async uploadImage(file: File): Promise<{ secure_url: string; public_id: string; resourceType: 'image' | 'video' }> {
    const isVideo = file.type.startsWith('video/');
    const resourceType: 'image' | 'video' = isVideo ? 'video' : 'image';

    const url = `https://api.cloudinary.com/v1_1/${this.cloudName}/${resourceType}/upload`;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', this.uploadPreset);

    const res = await lastValueFrom(this.http.post<any>(url, formData));

    return {
      secure_url: res.secure_url,
      public_id: res.public_id,
      resourceType
    };
  }

  // Delete uploaded file (⚠️ requires signed API call in production)
  async deleteFile(publicId: string, resourceType: 'image' | 'video'): Promise<any> {
    const url = `https://api.cloudinary.com/v1_1/${this.cloudName}/${resourceType}/destroy`;

    const formData = new FormData();
    formData.append('public_id', publicId);
    formData.append('upload_preset', this.uploadPreset);

    return lastValueFrom(this.http.post<any>(url, formData));
  }
}





// ImageUploadService
  // const isImage = file.type.startsWith('image/');
    // const fileSizeBytes = file.size; // in bytes
    // const fileSizeMB = fileSizeBytes / (1024 * 1024); // convert to MB

    // if (!isImage) {
    // throw new Error('Only image files are allowed.');
    // }

    // if (fileSizeMB < 1) {
    // throw new Error('File size must be at least 1 MB.');
    // }
    // if (fileSizeMB > 5) {
    // throw new Error('File size must not exceed 5 MB.');
    // }