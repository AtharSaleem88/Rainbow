import { Component, ElementRef, EventEmitter, Input, Output, ViewChild, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

interface ChatMessage { from: 'assistant' | 'customer'; text: string; link?: string; linkText?: string; showContactDetails?: boolean; showOrders?: boolean; }

@Component({
  selector: 'app-chat-assistant', standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './chat-assistant.component.html',
  styleUrls: ['./chat-assistant.component.scss']
})
export class ChatAssistantComponent {
  @Input() customerName = '';
  @Output() viewOrders = new EventEmitter<void>();
  @ViewChild('chatHistory') chatHistory?: ElementRef<HTMLElement>;
  readonly messages = signal<ChatMessage[]>([]);
  draft = '';

  get firstName(): string { return this.customerName.trim().split(/\s+/)[0] || 'there'; }

  send(value: string): void {
    const message = value.trim();
    if (!message) return;
    const text = message.toLowerCase();
    let response: ChatMessage;
    if (/track|status|where.*order/.test(text)) {
      response = { from: 'assistant', text: 'You can check your order status and details in Order History.', showOrders: true };
    } else if (/place|buy|shop|new order|how.*order/.test(text)) {
      response = { from: 'assistant', text: 'Choose your products, add them to your cart, then proceed to checkout to select delivery or pickup and payment.', link: '/shop', linkText: 'Shop products' };
    } else if (/return|refund/.test(text)) {
      response = { from: 'assistant', text: 'Open Order History and select the refund option on an eligible order.', showOrders: true };
    } else if (/payment|pay|jazzcash|cash/.test(text)) {
      response = { from: 'assistant', text: 'Available payment methods are shown at checkout, including Cash on Delivery, JazzCash, Easypaisa, and card.' };
    } else {
      response = { from: 'assistant', text: 'For other questions, please contact our team:', showContactDetails: true };
    }
    this.messages.update(items => [...items, { from: 'customer', text: message }, response]);
    this.draft = '';
    setTimeout(() => { const history = this.chatHistory?.nativeElement; if (history) history.scrollTop = history.scrollHeight; });
  }

  newConversation(): void { this.messages.set([]); this.draft = ''; }
}
