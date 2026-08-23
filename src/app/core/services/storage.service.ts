import { Injectable } from '@angular/core';
import { storage } from '../firebase/firebase';
import { ref, uploadBytesResumable, getDownloadURL, UploadTaskSnapshot } from 'firebase/storage';
import { Observable } from 'rxjs';

export interface UploadProgressResult {
  progress: number;
  downloadUrl?: string;
  isCompleted: boolean;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  /**
   * Sube un archivo a Firebase Storage con seguimiento reactivo del progreso
   * @param path Ruta dentro del bucket (ej. 'courses/course_123/videos/lesson_1.mp4')
   * @param file Objeto File binario del navegador
   */
  uploadFile(path: string, file: File): Observable<UploadProgressResult> {
    return new Observable(subscriber => {
      try {
        const storageRef = ref(storage, path);
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on(
          'state_changed',
          (snapshot: UploadTaskSnapshot) => {
            const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
            subscriber.next({
              progress,
              isCompleted: false
            });
          },
          (error) => {
            console.error('Error subiendo archivo a Firebase Storage:', error);
            subscriber.next({
              progress: 0,
              isCompleted: false,
              error: error.message
            });
            subscriber.error(error);
          },
          async () => {
            try {
              const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
              subscriber.next({
                progress: 100,
                downloadUrl,
                isCompleted: true
              });
              subscriber.complete();
            } catch (urlErr) {
              subscriber.error(urlErr);
            }
          }
        );
      } catch (err: any) {
        console.error('Error iniciando subida a Firebase Storage:', err);
        subscriber.error(err);
      }
    });
  }

  /**
   * Sube un archivo directamente devolviendo una Promesa con la URL de descarga
   */
  async uploadFilePromise(path: string, file: File): Promise<string> {
    const storageRef = ref(storage, path);
    const uploadTask = await uploadBytesResumable(storageRef, file);
    return await getDownloadURL(uploadTask.ref);
  }
}
