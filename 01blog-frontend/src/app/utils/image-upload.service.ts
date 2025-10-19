import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { lastValueFrom } from "rxjs";

export interface UploadedFile {
  secure_url: string;
  public_id: string;
  resourceType: 'image' | 'video';
}

@Injectable({ providedIn: 'root' })
export class ImageUploadService {
  private apiUrl = 'http://localhost:8080/api/cloudinary'; // backend base URL

  constructor(private http: HttpClient) {}

  // Upload image or video
  async uploadImage(file: File): Promise<UploadedFile> {
    const token = localStorage.getItem('token');
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;

    // 1️⃣ Get signed upload payload from backend
    const signRes = await lastValueFrom(
      this.http.post<any>(`${this.apiUrl}/sign-upload`, { folder: 'posts' }, { headers })
    );

    const isVideo = file.type.startsWith('video/');
    const resourceType: 'image' | 'video' = isVideo ? 'video' : 'image';

    // 2️⃣ Cloudinary upload URL
    const url = `https://api.cloudinary.com/v1_1/${signRes.cloudName}/${resourceType}/upload`;

    // 3️⃣ Prepare form data
    const formData = new FormData();
    formData.append('file', file);
    formData.append('api_key', signRes.apiKey);
    formData.append('timestamp', signRes.timestamp);
    formData.append('signature', signRes.signature);
    formData.append('folder', signRes.folder);

    // 4️⃣ Upload directly to Cloudinary
    const res = await lastValueFrom(this.http.post<any>(url, formData));

    return {
      secure_url: res.secure_url,
      public_id: res.public_id,
      resourceType
    };
  }

  // Delete uploaded file (backend handles deletion from Cloudinary)
  async deleteFile(publicId: string): Promise<any> {
    const token = localStorage.getItem('token');
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;

    return lastValueFrom(this.http.post(`${this.apiUrl}/delete`, { public_id: publicId }, { headers }));
  }
}
