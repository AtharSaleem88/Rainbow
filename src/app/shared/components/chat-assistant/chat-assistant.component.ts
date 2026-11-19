import { Component, ElementRef, ViewChild, HostListener, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

interface ChatMessage { from: 'assistant' | 'customer'; text: string; link?: string; linkText?: string; showContactDetails?: boolean; }

@Component({
  selector: 'app-chat-assistant', standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './chat-assistant.component.html',
  styleUrls: ['./chat-assistant.component.scss']
})
export class ChatAssistantComponent {
  @ViewChild('chatBody') chatBody?: ElementRef<HTMLElement>;
  readonly open = signal(false);
  readonly footerVisible = signal(false);
  readonly showScrollTop = signal(false);
  readonly headerBottom = signal(150);
  @HostListener('window:scroll')
  @HostListener('window:resize')
  updateFooterVisibility(): void {
    this.showScrollTop.set(window.scrollY > 300);
    const header = document.getElementById('rh-nav');
    this.headerBottom.set(Math.max(0, Math.ceil(header?.getBoundingClientRect().bottom ?? 0)));
    const footer = document.getElementById('rh-footer');
    this.footerVisible.set(!!footer && footer.getBoundingClientRect().top < window.innerHeight);
  }
  toggleChat(): void {
    this.updateFooterVisibility();
    this.open.update(value => !value);
  }
  readonly messages = signal<ChatMessage[]>([{ from: 'assistant', text: 'Hello! I can help you find your orders, place an order, or answer common questions.' }]);
  draft = '';

  send(value: string): void {
    const message = value.trim();
    if (!message) return;
    const text = message.toLowerCase();
    let response: ChatMessage;
    if (/track|status|where.*order/.test(text)) {
      response = { from: 'assistant', text: 'You can check your order status and details in your account under Order History.', link: '/account', linkText: 'View order history' };
    } else if (/place|buy|shop|new order|how.*order/.test(text)) {
      response = { from: 'assistant', text: 'Choose your products, add them to your cart, then proceed to checkout to select delivery or pickup and payment.', link: '/shop', linkText: 'Shop products' };
    } else if (/return|refund/.test(text)) {
      response = { from: 'assistant', text: 'Open Order History in your account and select the refund option on an eligible order.', link: '/account', linkText: 'View orders' };
    } else if (/payment|pay|jazzcash|cash/.test(text)) {
      response = { from: 'assistant', text: 'Available payment methods are shown at checkout, including Cash on Delivery, JazzCash, Easypaisa, and card.' };
    } else {
      response = { from: 'assistant', text: 'For other questions, please contact our team:', showContactDetails: true };
    }
    this.messages.update(items => [...items, { from: 'customer', text: message }, response]);
    this.draft = '';
    setTimeout(() => { const body = this.chatBody?.nativeElement; if (body) body.scrollTop = body.scrollHeight; });
  }
}
