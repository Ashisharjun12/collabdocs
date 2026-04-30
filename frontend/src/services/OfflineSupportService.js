import { IndexeddbPersistence } from 'y-indexeddb';

class OfflineSupportService {
  constructor() {
    this.provider = null;
  }

  /**
   * Binds the browser's IndexedDB to the given Yjs Document.
   * This instantly loads any locally saved content and saves all future edits locally.
   * 
   * @param {string} docId - The unique ID of the document (used as DB name)
   * @param {import('yjs').Doc} ydoc - The Yjs Document instance
   */
  init(docId, ydoc) {
    if (this.provider) {
      this.provider.destroy();
    }
    
    // Create an IndexedDB persistence provider tied to the document ID
    // Note: We use 'flow-doc-' prefix to keep the IndexedDB namespace clean
    this.provider = new IndexeddbPersistence(`flow-doc-${docId}`, ydoc);
    
    this.provider.on('synced', () => {
      console.log(`[OfflineSupport] Document ${docId} successfully loaded from local IndexedDB.`);
    });
    
    return this.provider;
  }

  /**
   * Destroys the local provider connection (call this when the component unmounts)
   */
  destroy() {
    if (this.provider) {
      this.provider.destroy();
      this.provider = null;
    }
  }
}

export const offlineSupport = new OfflineSupportService();
