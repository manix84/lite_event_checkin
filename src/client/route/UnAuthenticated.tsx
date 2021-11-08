import React from 'react';
import { Redirect, Route, RouteProps } from 'react-router';

export type AuthenticatedRouteProps = {
  isAuthenticated: boolean;
  redirectTo?: string;
} & RouteProps;

export default function AuthenticatedRoute({
  isAuthenticated,
  redirectTo = '/logout',
  ...routeProps
}: AuthenticatedRouteProps) {
  if (!isAuthenticated) {
    return (<Route {...routeProps} />);
  } else {
    return (<Redirect to={redirectTo} />);
  }
};
