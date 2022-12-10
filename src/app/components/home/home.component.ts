import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MediaChange, MediaObserver } from '@angular/flex-layout';
import {UntypedFormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { combineLatest, filter, map, of, startWith, switchMap, tap } from 'rxjs';
import { ProfileUser } from 'src/app/models/user';
import { ChatsService } from 'src/app/services/chats.service';
import { UsersService } from 'src/app/services/users.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  
  @ViewChild('endOfChat') endOfChat: ElementRef | undefined;

  user$ = this.userService.currentUserProfile$;

  searchControl = new UntypedFormControl('');
  chatListControl = new UntypedFormControl('');
  messageControl = new UntypedFormControl('');
  window: boolean = false; 
  private mediaWatcher;
    
  users$ = combineLatest([this.userService.allUsers$, this.user$, this.searchControl.valueChanges.pipe(startWith(''))])
  .pipe(map(([users, user, searchString])=> users.filter(u => u.displayName?.toLowerCase().includes(searchString!?.toLowerCase()) && u.uid !== user?.uid)));

  myChats$ = this.chatService.myChats$.pipe(
    map((array)=> array.sort((a,b)=> {
      return b.lastMessageDate! > a.lastMessageDate! ? 1: -1
    }))
  );

  
  selectedChat$ = combineLatest([this.chatListControl.valueChanges, this.myChats$])
  .pipe(
    map(([value, chats]) => chats.find(c => c.id === value![0]))
  );
    
    messages$ = this.chatListControl.valueChanges.pipe(
      map(value => value[0]),
      switchMap(chatId => this.chatService.getChatMessages$(chatId)),
      tap(()=> {
        this.scrollToBottom();
      })
    )

  constructor(private userService: UsersService, private chatService: ChatsService,
              private router: Router,
              private media: MediaObserver) { 
      this.mediaWatcher = this.media.asObservable().pipe(filter((changes:MediaChange[])=> changes.length > 0), map((changes: MediaChange[])=> changes[0]))
                  .subscribe((mediaChange: MediaChange) => {
                    this.handleMediaChange(mediaChange);
                  });
    }
  
    handleMediaChange(mediaChange: MediaChange) {
      if (this.media.isActive('xs')) {
        this.window = false;
      }
  else if (this.media.isActive('sm')) {
    this.window = true;
      }
  else if (this.media.isActive('md')) {
    this.window = true;
      }
  
  else {
    this.window = true;
      }
  }

  ngOnInit(): void {
  }


  createChat(otherUser: ProfileUser) {
    this.chatService.isExistingChat(otherUser?.uid).pipe(
      switchMap(chatId => {
        if (chatId) {
          return of(chatId);
        }
        else {
          return this.chatService.createChat(otherUser);
        }
      })
    ).subscribe(chatId => {
      this.chatListControl.setValue([chatId]);
      //this.router.navigate(['/chat', chatId]);
    })
  }
  
  // mobile view function
  createChatMobile(otherUser: ProfileUser) {
    this.chatService.isExistingChat(otherUser?.uid).pipe(
      switchMap(chatId => {
        if (chatId) {
          return of(chatId);
        }
        else {
          return this.chatService.createChat(otherUser);
        }
      })
    ).subscribe(chatId => {
      this.router.navigate(['/chat', chatId]);
      this.chatListControl.setValue([chatId]);
      
      
      
    })
  }

  sendMessage() {
    const message = this.messageControl.value;
    const selectedChatId = this.chatListControl.value[0];

    if(message && selectedChatId) {
      this.chatService.addChatMessage(selectedChatId, message).subscribe(() => {
        this.scrollToBottom();
      });
      this.messageControl.setValue('');
    };

  }

  ngOnDestroy(): void {
    this.mediaWatcher.unsubscribe();
  }
  scrollToBottom() {
    
    setTimeout(()=> {
      if (this.endOfChat) {
        this.endOfChat.nativeElement.scrollIntoView({ behavior: 'smooth' })
      }
    }, 100);

    
  }
}
