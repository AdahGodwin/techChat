import { Injectable } from '@angular/core';
import { Auth, authState, createUserWithEmailAndPassword, updateProfile, UserInfo } from '@angular/fire/auth';
import { signInWithEmailAndPassword } from '@firebase/auth';
import { concatMap, from, Observable, of, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  constructor(private auth: Auth) { }

  currentUser$ = authState(this.auth);

  login(username: string, password: string) {
   return from(signInWithEmailAndPassword(this.auth, username, password)) 
  }

  signup(email: string, password: string) {
    return from(createUserWithEmailAndPassword(this.auth, email, password))
    
  }

  updateProfile(profileData: Partial<UserInfo>): Observable<any> {
    const user = this.auth.currentUser;
    return of(user).pipe(concatMap((user) => {
      if (!user) throw new Error('Not Authenticated')

      return updateProfile(user, profileData);
    }))
  }

  logout() {
    return from(this.auth.signOut())
  }
}
