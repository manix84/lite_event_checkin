import React from 'react';

type PageContextType = {
  host: {
    address: string;
  };
  isAuthenticated: boolean;
  auth: {
    token: string | null;
    expiration: number | null;
    userID: number | null;
  };
  user: {
    displayName: string | null;
  };
};

export const PageContext = React.createContext<Partial<PageContextType>>({
  host: {
    address: ''
  },
  isAuthenticated: false,
  auth: {
    token: null,
    expiration: null,
    userID: null
  },
  user: {
    displayName: null
  }
});

PageContext.displayName = "PageContext";

export default PageContext;
