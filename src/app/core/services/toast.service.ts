import { Injectable, signal } from '@angular/core';

export interface ToastMessage {
  id: number;
  text: string;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly messages = signal<ToastMessage[]>([]);
  private nextId = 0;
  private timers = new Map<number, ReturnType<typeof setTimeout>>();

  show(text: string, duration = 2800): void {
    const id = ++this.nextId;
    this.messages.update(messages => [...messages.slice(-2), { id, text }]);
    this.timers.set(id, setTimeout(() => this.dismiss(id), duration));
  }

  dismiss(id: number): void {
    const timer = this.timers.get(id);
    if (timer) clearTimeout(timer);
    this.timers.delete(id);
    this.messages.update(messages => messages.filter(message => message.id !== id));
  }
}
