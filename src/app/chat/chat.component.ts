import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Params, ActivatedRoute, Router } from '@angular/router';
import { Location } from "@angular/common";
import { ChatsService } from '../services/chats.service';
import { combineLatest, map, switchMap, tap } from 'rxjs';
import { UsersService } from '../services/users.service';
import { UntypedFormControl } from '@angular/forms';
import { Chat } from '../models/chat';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit {
  @ViewChild('endOfChat') endOfChat: ElementRef | undefined;
  
  messageControl = new UntypedFormControl('');
  user$ = this.userService.currentUserProfile$;
  chatListControl =this.route.snapshot.params['id'];
  myChats$ = this.chatService.myChats$;
  // selectedChat$: any;
  // messages$: any;

  constructor(private route: ActivatedRoute,
              private chatService: ChatsService,
              private userService: UsersService) { }
  
  

  ngOnInit(): void {
    
  
    
  
  }
  
  selectedChat$ = this.myChats$
    .pipe(
      map((chats) => chats.find(c => c.id === this.chatListControl!))
    );
    
      messages$ = this.chatService.getChatMessages$(this.chatListControl)
      .pipe(
        tap(()=> {
          this.scrollToBottom();
        })
      );
  

  scrollToBottom() {
    
    setTimeout(()=> {
      if (this.endOfChat) {
        this.endOfChat.nativeElement.scrollIntoView({ behavior: 'smooth' })
      }
    }, 100);

  }
  
  sendMessage() {
    const message = this.messageControl.value;
    const selectedChatId = this.chatListControl;

    if(message && selectedChatId) {
      this.chatService.addChatMessage(selectedChatId, message).subscribe(() => {
        this.scrollToBottom();
      });
      this.messageControl.setValue('');
    };

  }
}
