export type Customer = {
  id: number;
  address?: string | null;
  phoneNumber?: string | null;
  user?: {
    id: number;
    displayName: string;
    email: string;
  };
};

export type Event = {
  id: number;
  name: string;
  description?: string | null;
  eventDate?: string | null;
  customer?: Customer;
};
