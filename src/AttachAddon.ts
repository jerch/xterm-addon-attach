/**
 * Copyright (c) 2014 The xterm.js authors. All rights reserved.
 * @license MIT
 *
 * Implements the attach method, that attaches the terminal to a WebSocket stream.
 */

import { Terminal, IDisposable, ILinkMatcherOptions } from 'xterm';
import { IAttachAddonTerminal } from './Interfaces';

// TODO: This is temporary, link to xterm when the new version is published
export interface ITerminalAddon {
  dispose(): void;
}

export class WebLinksAddon implements ITerminalAddon {
  private _socket: WebSocket;
  private _textDecoder: TextDecoder = new TextDecoder();
  private _buffered: boolean;
  private _attachSocketBuffer: string;
  private _disposables: IDisposable[] = [];

  private _dataListener: (data: string) => void;

  constructor(private _terminal: Terminal) {
  }

  public dispose(): void {
    this._disposables.forEach(d => d.dispose());
    this._socket = null;
  }

  public attach(socket: WebSocket, bidirectional: boolean, buffered: boolean): void {
    bidirectional = (typeof bidirectional === 'undefined') ? true : bidirectional;
    this._socket = socket;
    this._buffered = buffered;

    this._disposables.push(addSocketListener(socket, 'message', (ev: MessageEvent) => this._getMessage(ev)));

    if (bidirectional) {
      this._dataListener = data => this._sendData(data);
      this._disposables.push(this._terminal.addDisposableListener('data', this._dataListener));
    }

    this._disposables.push(addSocketListener(socket, 'close', () => this.dispose()));
    this._disposables.push(addSocketListener(socket, 'error', () => this.dispose()));
  }

  private _flushBuffer(): void {
    this._terminal.write(this._attachSocketBuffer);
    this._attachSocketBuffer = null;
  }

  private _pushToBuffer(data: string): void {
    if (this._attachSocketBuffer) {
      this._attachSocketBuffer += data;
    } else {
      this._attachSocketBuffer = data;
      setTimeout(this._flushBuffer, 10);
    }
  }

  private _getMessage(ev: MessageEvent): void {
    let str: string;

    if (typeof ev.data === 'object') {
      if (ev.data instanceof ArrayBuffer) {
        str = this._textDecoder.decode(ev.data);
        this._displayData(str);
      } else {
        const fileReader = new FileReader();

        fileReader.addEventListener('load', () => {
          str = this._textDecoder.decode(fileReader.result as any);
          this._displayData(str);
        });
        fileReader.readAsArrayBuffer(ev.data);
      }
    } else if (typeof ev.data === 'string') {
      this._displayData(ev.data);
    } else {
      throw Error(`Cannot handle "${typeof ev.data}" websocket message.`);
    }
  }

  /**
   * Push data to buffer or write it in the terminal.
   * This is used as a callback for FileReader.onload.
   *
   * @param str String decoded by FileReader.
   * @param data The data of the EventMessage.
   */
  private _displayData(str?: string, data?: string): void {
    if (this._buffered) {
      this._pushToBuffer(str || data);
    } else {
      this._terminal.write(str || data);
    }
  }

  private _sendData(data: string): void {
    if (this._socket.readyState !== 1) {
      return;
    }
    this._socket.send(data);
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
