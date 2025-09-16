import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import {lastValueFrom } from "rxjs";

@Injectable({providedIn: 'root'})
export class ImageUploadService {
    private cloudName = 'dsv24pun2';
    private uploadPreset = '01blog';


    constructor(private http: HttpClient) {}

    async uploadImage(file: File): Promise<string> {

       const url = `https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`

       const fromData = new FormData();
        fromData.append('file', file)
        fromData.append('upload_preset', this.uploadPreset)

        const res = await lastValueFrom(this.http.post<any>(url, fromData))

        return res.secure_url
    }
}



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