import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Offer {
  id: string;
  title: string;
  description: string;
  dateTime?: string; // Made optional
  price?: string; // Made optional for needs
  online: boolean;
  location?: string;
  city?: string;
  state?: string;
  createdAt: Date;
  type?: 'offer' | 'need'; // Added type to distinguish between offers and needs
}

interface OffersContextType {
  offers: Offer[];
  addOffer: (offer: Omit<Offer, 'id' | 'createdAt'>) => void;
}

const OffersContext = createContext<OffersContextType | undefined>(undefined);

export const useOffers = () => {
  const context = useContext(OffersContext);
  if (!context) {
    throw new Error('useOffers must be used within an OffersProvider');
  }
  return context;
};

interface OffersProviderProps {
  children: ReactNode;
}

export const OffersProvider: React.FC<OffersProviderProps> = ({ children }) => {
  const [offers, setOffers] = useState<Offer[]>([]);

  const addOffer = (offerData: Omit<Offer, 'id' | 'createdAt'>) => {
    const newOffer: Offer = {
      ...offerData,
      id: Date.now().toString(), // Simple ID generation
      createdAt: new Date(),
    };
    setOffers(prev => [newOffer, ...prev]); // Add new offers at the beginning
  };

  return (
    <OffersContext.Provider value={{ offers, addOffer }}>
      {children}
    </OffersContext.Provider>
  );
};
