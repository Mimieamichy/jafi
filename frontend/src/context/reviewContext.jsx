import { createContext, useContext, useState } from "react";

// Create a Context
const ReviewsContext = createContext();

// Provide Context to the App
export const ReviewsProvider = ({ children }) => {
  const [reviews, setReviews] = useState([
    { id: 1, name: "John Doe", product: "Luxury Hotel", category: "Hotel", rating: 4, comment: "Great service!" },
    { id: 2, name: "Jane Smith", product: "Elite Restaurant", category: "Restaurant", rating: 5, comment: "Amazing food!" },
    { id: 3, name: "Mike Johnson", product: "Smart Electronics", category: "Electronics", rating: 4, comment: "Good prices on gadgets." },
    { id: 4, name: "Alice Brown", product: "Cozy Café", category: "Cafe", rating: 5, comment: "Best coffee in town!" },
  ]);

  const addReview = (newReview) => {
    setReviews((prevReviews) => [newReview, ...prevReviews]);
  };

  return (
    <ReviewsContext.Provider value={{ reviews, addReview }}>
      {children}
    </ReviewsContext.Provider>
  );
};

// Custom Hook to Use Context
export const useReviews = () => useContext(ReviewsContext);
