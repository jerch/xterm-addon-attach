/**
 * Copyright (c) 2017 The xterm.js authors. All rights reserved.
 * @license MIT
 */


import { Terminal, ILinkMatcherOptions } from 'xterm';

// TODO: This is temporary, link to xterm when the new version is published
export interface ITerminalAddon {
  activate(terminal: Terminal): void;
  dispose(): void;
}

export interface IAttachOptions {
  bidirectional?: boolean,
  buffered?: boolean,
  inputUtf8?: boolean
}

export class AttachAddon implements ITerminalAddon {
  new(socket: WebSocket, options?: IAttachOptions): AttachAddon;
  public activate(terminal: Terminal): void;
  public dispose(): void;
}
