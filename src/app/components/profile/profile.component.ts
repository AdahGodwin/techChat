import { Component, OnInit } from '@angular/core';
import { User } from '@angular/fire/auth';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { HotToastService } from '@ngneat/hot-toast';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { concatMap } from 'rxjs';
import { ProfileUser } from 'src/app/models/user';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { ImageUploadService } from 'src/app/services/image-upload.service';
import { UsersService } from 'src/app/services/users.service';


@UntilDestroy()
@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

  user$ = this.userService.currentUserProfile$;

  profileForm = new UntypedFormGroup({
    uid: new UntypedFormControl(''),
    displayName: new UntypedFormControl(''),
    firstName: new UntypedFormControl(''),
    lastName: new UntypedFormControl(''),
    phone: new UntypedFormControl(''),
    address: new UntypedFormControl('')  
  });

  constructor(private authService: AuthenticationService,
              private imageUploadService: ImageUploadService,
              private toast: HotToastService,
              private userService: UsersService) { }

  ngOnInit(): void {
    this.userService.currentUserProfile$.pipe(
      untilDestroyed(this)
    ).subscribe((user) => {
      this.profileForm.patchValue({ ...user })
    })
  }
  uploadImage(event: any, user: ProfileUser) {
    this.imageUploadService.uploadImage(event.target.files[0], `images/profile/${user.uid}`)
    .pipe(
      this.toast.observe({
        loading: "images is being uploaded",
        success: "Image Uploaded",
        error: "An error occured, try again"
      }),
      concatMap((photoURL) => this.userService.updateUser({uid: user.uid, photoURL }))
    ).subscribe();
  }

  saveProfile() {
    const profileData = this.profileForm.value;
    this.userService.updateUser(profileData).pipe(
      this.toast.observe({
        loading: 'Updating data..',
        success: 'Data has been updated',
        error: 'There was an error in updating the data'
      })
    ).subscribe();    
  }
}
