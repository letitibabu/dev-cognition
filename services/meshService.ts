import { Peer, MeshEvent, CollabStream, ChatMessage, Block } from '../types';

// Using BroadcastChannel to simulate Local LAN Mesh. 
// In a real production LAN environment, this would be replaced by a WebRTC data channel 
// or a lightweight WebSocket server running on the Host's machine.
const CHANNEL_NAME = 'devcognition-mesh-v1';

class MeshService {
  private channel: BroadcastChannel;
  private listeners: ((event: MeshEvent) => void)[] = [];
  private peerId: string;

  constructor() {
    this.channel = new BroadcastChannel(CHANNEL_NAME);
    this.peerId = Math.random().toString(36).substring(2, 9);
    
    this.channel.onmessage = (ev) => {
      const meshEvent = ev.data as MeshEvent;
      this.listeners.forEach(cb => cb(meshEvent));
    };
  }

  public getPeerId() {
    return this.peerId;
  }

  public broadcast(event: MeshEvent) {
    this.channel.postMessage(event);
    // Also trigger local listeners for immediate UI update if needed, 
    // though usually we want to distinguish 'sent' vs 'received'.
  }

  public subscribe(callback: (event: MeshEvent) => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  public close() {
    this.channel.close();
  }
}

export const meshService = new MeshService();
