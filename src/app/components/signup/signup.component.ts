import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, UntypedFormControl, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HotToastService } from '@ngneat/hot-toast';
import { switchMap } from 'rxjs';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { UsersService } from 'src/app/services/users.service';


export function passwordsMatchValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;

    if (password && confirmPassword && password !== confirmPassword) {
      return {
        passwordsDontMatch: true
      }
    }
    return null
  };
}

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit {

  signupForm = new FormGroup({
    name: new UntypedFormControl('', Validators.required),
    email: new UntypedFormControl('', [Validators.required, Validators.email]),
    password: new UntypedFormControl('', Validators.required),
    confirmPassword: new UntypedFormControl('', Validators.required)
  }, { validators: passwordsMatchValidator() });

  constructor(private authService: AuthenticationService, 
    private router: Router,
    private toast: HotToastService,
    private userService: UsersService) { }

  ngOnInit(): void {
  }

  get name() {
    return this.signupForm.get('name');
  }

  get email() {
    return this.signupForm.get('email');
  }

  get password() {
    return this.signupForm.get('password');
  }

  get confirmPassword() {
    return this.signupForm.get('confirmPassword');
  }

  submit() {
    if (!this.signupForm.valid) {
      return;
    }

    const {name, email, password} = this.signupForm.value;

    this.authService.signup(email, password)
    .pipe(
      switchMap(({user: { uid } }) => this.userService.addUser({ uid, email, displayName: name })),
      this.toast.observe({
        success: "Congrats! Signed Up Successfully",
        loading: "Signing you up...",
        error: ({ message }) => `${message}`
      })
    )
    .subscribe(()=> {
      this.router.navigate(['/home']);
    })
  }
}
