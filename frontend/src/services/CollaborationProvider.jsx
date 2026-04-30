import React from 'react';
import { 
  HocuspocusProviderWebsocketComponent, 
  HocuspocusRoom 
} from '@hocuspocus/provider-react';


const CollaborationProvider = ({ docId, token, children }) => {
  const socketUrl = import.meta.env.VITE_COLLAB_SOCKET_URL ? import.meta.env.VITE_COLLAB_SOCKET_URL : "ws://127.0.0.1:3001";

  return (
    <HocuspocusProviderWebsocketComponent url={socketUrl}>
      <HocuspocusRoom name={docId} token={token}>
        {children}
      </HocuspocusRoom>
    </HocuspocusProviderWebsocketComponent>
  );
};

export default CollaborationProvider;
