import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Storage } from '@ionic/storage-angular';
import { Observable, firstValueFrom, switchMap, tap } from 'rxjs';
import { User } from '../interfaces/user';
import { UserRolService } from './user-rol.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  initialized = false;
  userRoles: any;
  endpoint = 'http://localhost:8080/api/users';
  constructor(
    private httpClient: HttpClient,
    private storage: Storage,
    private router: Router,
    private userRolService: UserRolService
  ) {
    this.storage.create();
  }

  private getOptions(user: any) {
    let base64UserAndPassword = window.btoa(user.email + ':' + user.password);

    let basicAccess = 'Basic ' + base64UserAndPassword;

    let options = {
      headers: {
        Authorization: basicAccess,
        'Content-Type': 'application/json',
      },
      //, withCredentials: true
    };

    return options;
  }

  login(user: User): Observable<User> {
    return this.httpClient
      .post<User>(`${this.endpoint}/signin`, null, this.getOptions(user))
      .pipe(
        switchMap(async (res: any) => {
          if (res.user) {
            await this.storage.set('token', res.access_token);
            this.userRoles = await firstValueFrom(
              this.userRolService.getAllUserRolByIdUser(res.user.id)
            );
            await this.storage.set('rol', this.userRoles);
            return res; // Emitir la respuesta original después de realizar las operaciones de almacenamiento
          } else {
            throw new Error('Invalid credentials'); // Puedes personalizar el mensaje de error según tus necesidades
          }
        })
      );
  }

  register(user: User): Observable<User> {
    return this.httpClient
      .post<any>(this.endpoint, { name: user.name }, this.getOptions(user))
      .pipe(
        tap(async (res: any) => {
          if (res.user) {
            await this.storage.set('token', res.access_token);
            this.userRoles = await firstValueFrom(
              this.userRolService.getAllUserRolByIdUser(res.user.id)
            );
            await this.storage.set('rol', this.userRoles);
          }
        })
      );
  }

  logout() {
    this.router.navigate(['login']);
    this.storage.remove('token');
  }

  async isLoggedIn() {
    // return this.authSubject.asObservable();
    let token = await this.storage.get('token');
    if (token) {
      return true;
    }
    this.router.navigateByUrl('/login');
    return false;
  }
}
