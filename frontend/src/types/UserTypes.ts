// @ts-nocheck

// src/types/UserTypes.ts

import type { User } from 'firebase/auth';

export interface CustomUserData {
    
       
    
}

export interface ExtendedUser {
  firebaseUser: User;

  idToken: string; 

  customData?: CustomUserData;
}
