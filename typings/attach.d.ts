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
  utf8?: boolean
}

export class AttachAddon implements ITerminalAddon {
  public activate(terminal: Terminal): void;
  public dispose(): void;
  public attach(socket: WebSocket, bidirectional?: boolean, buffered?: boolean): void;
}

interface IAttachAddonConstructor {
  new (socket: WebSocket, options?: IAttachOptions): AttachAddon;
}
