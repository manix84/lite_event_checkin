import React from 'react';

type PageContextType = {
  host: {
    address: string;
  };
  isAuthenticated: boolean;
  auth: {
    token?: string;
    expiration?: number;
    userID?: number;
  };
  user: {
    displayName?: string;
  };
};

export const PageContext = React.createContext<Partial<PageContextType>>({
  host: {
    address: ''
  },
  isAuthenticated: false,
  auth: {
    token: undefined,
    expiration: undefined,
    userID: undefined
  },
  user: {
    displayName: undefined
  }
});

PageContext.displayName = "PageContext";

export default PageContext;
