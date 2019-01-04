/**
 * Copyright (c) 2017 The xterm.js authors. All rights reserved.
 * @license MIT
 */


import { Terminal, ILinkMatcherOptions } from 'xterm';

// TODO: This is temporary, link to xterm when the new version is published
export interface ITerminalAddon {
  dispose(): void;
}

export class AttachAddon implements ITerminalAddon {
  constructor(terminal: Terminal);
  public dispose(): void;
  public attach(socket: WebSocket, bidirectional?: boolean, buffered?: boolean): void;
}
