import React from 'react';

type PageContextType = {
  host: {
    address: string;
  };
  auth: {
    isAuthenticated: boolean,
    token: string | null;
    expiration: number | null;
    userID: number | null;
  };
};

export const PageContext = React.createContext<Partial<PageContextType>>({
  host: {
    address: ''
  },
  auth: {
    isAuthenticated: false,
    token: null,
    expiration: null,
    userID: null
  }
});

PageContext.displayName = "PageContext";

export default PageContext;
