export interface GuestlistProps {
  [guestHash: string]: GuestProps;
};

export interface GuestProps {
  firstName: string;
  lastName: string;
  salt: string;
  checkedIn: boolean;
  checkinTime?: number;
}
