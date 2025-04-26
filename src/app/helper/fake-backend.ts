import { Injectable } from '@angular/core'
import {
  HttpRequest,
  HttpResponse,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HTTP_INTERCEPTORS,
} from '@angular/common/http'
import { Observable, of, throwError } from 'rxjs'
import { delay, mergeMap, materialize, dematerialize } from 'rxjs'

export type User = {
  id?: number
  username?: string
  password?: string
  firstName?: string
  lastName?: string
  name?: string
  token?: string
  email?: string
  avatar?: string
  location?: string
  title?: string
}

type MyRequestBody = {
  // Define the structure of your request body
  username: string
  name: string
  password: string
  email: string
}

let Token: string =
  'eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJjb2RlcnRoZW1lcyIsImF1ZCI6Imh0dHBzOi8vY29kZXJ0aGVtZXMuY29tLyIsInN1YiI6InN1cHBvcnRAY29kZXJ0aGVtZXMuY29tIiwibGFzdE5hbWUiOiJ0ZXN0IiwiRW1haWwiOiJzdXBwb3J0QGNvZGVydGhlbWVzLmNvbSIsIlJvbGUiOiJBZG1pbiIsImZpcnN0TmFtZSI6IlRlc3RUb2tlbiJ9.R030OCQ_FOe8mtubcF0c9KNx8G4yokVQd6UdpQzb0d_jtE1gqmxzOPoJCP1R9NkG0GIYgOD3lRo62GvMCzuKyA'
/**
 * @returns registered user list
 */
function getUsers(): User[] {
  let users: User[] = JSON.parse(sessionStorage.getItem('users')!) || [
    {
      id: 1,
      username: 'Osen',
      email: 'user@demo.com',
      password: '123456',
      firstName: 'Osen',
      lastName: 'Coderthemes',
      avatar: 'assets/images/users/user-1.jpg',
      location: 'California, USA',
      title: 'Admin Head',
      token: Token,
    },
  ]
  return users
}

@Injectable()
export class FakeBackendInterceptor implements HttpInterceptor {
  constructor() {}

  intercept(
    request: HttpRequest<MyRequestBody>,
    next: HttpHandler
  ): Observable<HttpEvent<Event>> {
    const authHeader = request.headers.get('Authorization')
    const isLoggedIn =
      authHeader && authHeader.startsWith('Bearer fake-jwt-token')
    let users: User[] = getUsers()
    // wrap in delayed observable to simulate server api call
    return of(null)
      .pipe(
        mergeMap(() => {
          let temp: User[] = []
          // authenticate - public
          if (request.url.endsWith('/api/login') && request.method === 'POST') {
            const user = users.find(
              (x) =>
                x.email === request.body?.email &&
                x.password === request.body?.password
            )
            if (!user) {
              return error('Email or password is incorrect')
            }
            return ok({
              ...user,
              name: user.firstName + ' ' + user.lastName,
            })
          }

          // store new user - public
          if (
            request.url.endsWith('/api/signup') &&
            request.method === 'POST'
          ) {
            const user = users.find(
              (x) =>
                x.email === request.body?.email &&
                x.password === request.body?.password
            )
            if (user) {
              return error('User Already Exists')
            } else {
              let [firstName, lastName] = request.body?.name.split(' ')!
              const newUser: User = {
                id: users.length + 1,
                username: firstName,
                email: request.body?.email,
                password: request.body?.password,
                firstName: firstName,
                lastName: lastName,
                avatar: 'assets/images/users/avatar-5.jpg',
                location: 'California, USA',
                token: Token,
              }
              temp = [...users]
              temp.push(newUser)
              sessionStorage.setItem('users', JSON.stringify(temp))
              return ok()
            }
          }

          // pass through any requests not handled above
          return next.handle(request)
        })
      )
      .pipe(materialize())
      .pipe(delay(500))
      .pipe(dematerialize())

    // private helper functions
    function ok(body?: User) {
      return of(new HttpResponse({ status: 200, body }))
    }

    function unauthorised() {
      return throwError({ status: 401, error: { message: 'Unauthorised' } })
    }

    function error(message: string) {
      return throwError({ status: 400, error: { message } })
    }
  }
}

export let FakeBackendProvider = {
  // use fake backend in place of Http service for backend-less development
  provide: HTTP_INTERCEPTORS,
  useClass: FakeBackendInterceptor,
  multi: true,
}
