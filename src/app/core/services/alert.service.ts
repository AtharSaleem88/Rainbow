import { Injectable, signal } from '@angular/core';

export interface AlertOptions { title: string; message: string; kind?: 'success' | 'info' | 'warning'; confirmText?: string; cancelText?: string; }
export interface AlertRequest extends AlertOptions { confirmation: boolean; }

@Injectable({ providedIn: 'root' })
export class AlertService {
  readonly current = signal<AlertRequest | null>(null);
  private resolve?: (result: boolean) => void;
  show(options: AlertOptions): Promise<boolean> { return this.open(options, false); }
  confirm(options: AlertOptions): Promise<boolean> { return this.open(options, true); }
  private open(options: AlertOptions, confirmation: boolean): Promise<boolean> {
    this.resolve?.(false);
    this.current.set({ ...options, confirmation });
    return new Promise(resolve => { this.resolve = resolve; });
  }
  respond(result: boolean): void {
    const resolve = this.resolve;
    this.resolve = undefined;
    this.current.set(null);
    resolve?.(result);
  }
}
