import React from 'react';

interface GuestlistProps {
  [guestHash: string]: GuestProps;
};

interface GuestProps {
  firstName: string;
  lastName: string;
  salt: string;
  checkedIn: boolean;
}

export const GuestsContext = React.createContext({
  guests: {},
  updateGuest: (guestHash: keyof GuestlistProps, guestData: GuestProps) => { }
});

export default GuestsContext;
