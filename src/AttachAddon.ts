/**
 * Copyright (c) 2014 The xterm.js authors. All rights reserved.
 * @license MIT
 *
 * Implements the attach method, that attaches the terminal to a WebSocket stream.
 */

import { Terminal, IDisposable } from 'xterm';
import { IAttachOptions } from '../typings/attach';

// TODO: This is temporary, link to xterm when the new version is published
export interface ITerminalAddon {
  activate(terminal: Terminal): void;
  dispose(): void;
}

export class AttachAddon implements ITerminalAddon {
  private _bidirectional: boolean;
  private _utf8: boolean;
  private _disposables: IDisposable[] = [];
  private _dataListener: (data: string) => void;

  constructor(public socket: WebSocket, options?: IAttachOptions) {
    this._bidirectional = options && options.bidirectional;
    this._utf8 = options && options.utf8;
    if (this._utf8) {
      this.socket.binaryType = 'arraybuffer';
    }
  }

  public activate(terminal: Terminal): void {
    if (this._utf8) {
      this.socket.binaryType = 'arraybuffer';
      this._disposables.push(addSocketListener(this.socket, 'message',
        (ev: MessageEvent) => (terminal as any).writeUtf8(new Uint8Array(ev.data))));
    } else {
      this._disposables.push(addSocketListener(this.socket, 'message',
        (ev: MessageEvent) => (terminal as any).write(ev.data)));
    }

    if (this._bidirectional) {
      this._dataListener = data => this._sendData(data);
      this._disposables.push(terminal.addDisposableListener('data', this._dataListener));
    }

    this._disposables.push(addSocketListener(this.socket, 'close', () => this.dispose()));
    this._disposables.push(addSocketListener(this.socket, 'error', () => this.dispose()));
  }

  public dispose(): void {
    this._disposables.forEach(d => d.dispose());
    this.socket = null;
  }

  private _sendData(data: string): void {
    // TODO: do something better than just swallowing
    // the data if the socket is not in a working condition
    if (this.socket.readyState !== 1) {
      return;
    }
    this.socket.send(data);
  }
}

function addSocketListener(socket: WebSocket, type: string, handler: (this: WebSocket, ev: Event) => any): IDisposable {
  socket.addEventListener(type, handler);
  return {
    dispose: () => {
      if (!handler) {
        // Already disposed
        return;
      }
      socket.removeEventListener(type, handler);
      handler = null;
    }
  };
}
