import { Injectable } from '@angular/core';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  QueryConstraint,
  DocumentData,
  WithFieldValue,
  UpdateData,
  Unsubscribe,
  CollectionReference,
} from 'firebase/firestore';
import { db } from '../firebase/firebase';

@Injectable({
  providedIn: 'root',
})
export class FirestoreService {
  /** Obtiene un documento por su ID */
  async getDoc<T>(collectionPath: string, id: string): Promise<T | null> {
    const ref = doc(db, collectionPath, id);
    const snap = await getDoc(ref);
    return snap.exists() ? ({ id: snap.id, ...snap.data() } as T) : null;
  }

  /** Obtiene todos los documentos de una colección (con filtros opcionales) */
  async getCollection<T>(
    collectionPath: string,
    ...constraints: QueryConstraint[]
  ): Promise<T[]> {
    const ref = collection(db, collectionPath) as CollectionReference<DocumentData>;
    const q = constraints.length > 0 ? query(ref, ...constraints) : query(ref);
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }) as T);
  }

  /** Crea o reemplaza un documento con ID específico */
  async setDoc<T extends WithFieldValue<DocumentData>>(
    collectionPath: string,
    id: string,
    data: T
  ): Promise<void> {
    const ref = doc(db, collectionPath, id);
    await setDoc(ref, data);
  }

  /** Agrega un documento con ID auto-generado */
  async addDoc<T extends WithFieldValue<DocumentData>>(
    collectionPath: string,
    data: T
  ): Promise<string> {
    const ref = collection(db, collectionPath);
    const docRef = await addDoc(ref, data);
    return docRef.id;
  }

  /** Actualiza campos específicos de un documento */
  async updateDoc<T extends DocumentData>(
    collectionPath: string,
    id: string,
    data: UpdateData<T>
  ): Promise<void> {
    const ref = doc(db, collectionPath, id);
    await updateDoc(ref, data);
  }

  /** Elimina un documento */
  async deleteDoc(collectionPath: string, id: string): Promise<void> {
    const ref = doc(db, collectionPath, id);
    await deleteDoc(ref);
  }

  /** Escucha cambios en tiempo real sobre una colección */
  listenCollection<T>(
    collectionPath: string,
    callback: (items: T[]) => void,
    ...constraints: QueryConstraint[]
  ): Unsubscribe {
    const ref = collection(db, collectionPath) as CollectionReference<DocumentData>;
    const q = constraints.length > 0 ? query(ref, ...constraints) : query(ref);
    return onSnapshot(q, snap => {
      callback(snap.docs.map(d => ({ id: d.id, ...d.data() }) as T));
    });
  }

  /** Escucha cambios en tiempo real sobre un documento */
  listenDoc<T>(
    collectionPath: string,
    id: string,
    callback: (item: T | null) => void
  ): Unsubscribe {
    const ref = doc(db, collectionPath, id);
    return onSnapshot(ref, snap => {
      callback(snap.exists() ? ({ id: snap.id, ...snap.data() } as T) : null);
    });
  }

  // Re-exports de QueryConstraints para que los servicios no importen firebase directamente
  where = where;
  orderBy = orderBy;
  limit = limit;
}
