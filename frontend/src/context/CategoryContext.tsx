import React, { createContext, useState, useContext } from 'react';

type CategoryContextType = {
  globalCategoryId: string;
  setGlobalCategoryId: (id: string) => void;
};

const CategoryContext = createContext<CategoryContextType>({
  globalCategoryId: '',
  setGlobalCategoryId: () => {},
});

export const CategoryProvider = ({ children }: { children: React.ReactNode }) => {
  const [globalCategoryId, setGlobalCategoryId] = useState<string>('');

  return (
    <CategoryContext.Provider value={{ globalCategoryId, setGlobalCategoryId }}>
      {children}
    </CategoryContext.Provider>
  );
};

export const useCategoryContext = () => useContext(CategoryContext);
