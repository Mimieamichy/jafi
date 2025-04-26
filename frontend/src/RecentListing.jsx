// src/components/FeaturedListings.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// /import { faStar } from "@fortawesome/free-solid-svg-icons";
import { useSnackbar } from "notistack";
import { faStar as regularStar } from "@fortawesome/free-regular-svg-icons";
import {
  faStar as solidStar,
  faStarHalfAlt,
} from "@fortawesome/free-solid-svg-icons";

const baseUrl = import.meta.env.VITE_BACKEND_URL; // ← already in your env

export default function RecentListings() {
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  const [listings, setListings] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const [loading, setLoading] = useState(true);

 const renderStars = (rating) => {
     const numericRating = parseFloat(rating);
     if (isNaN(numericRating)) {
       console.error("Invalid star rating:", rating);
       return null;
     }
 
     // Calculate full stars (integer part)
     const fullStars = Math.floor(numericRating);
     // If the rating is not exactly an integer, we display one half star.
     const hasHalfStar = numericRating - fullStars !== 0;
     // Total stars must always be 5.
     const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
 
     console.log(
       "Parsed Rating:",
       numericRating,
       "Full:",
       fullStars,
       "Has Half:",
       hasHalfStar,
       "Empty:",
       emptyStars
     );
 
     return (
       <div className="flex justify-center space-x-1 text-yellow-400 mt-1">
         {Array.from({ length: fullStars }).map((_, idx) => (
           <FontAwesomeIcon icon={solidStar} key={`full-${idx}`} />
         ))}
         {hasHalfStar && <FontAwesomeIcon icon={faStarHalfAlt} />}
         {Array.from({ length: emptyStars }).map((_, idx) => (
           <FontAwesomeIcon icon={regularStar} key={`empty-${idx}`} />
         ))}
       </div>
     );
   };
 

  /* ---------- fetch once on mount ---------- */
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${baseUrl}/user/listings`);
        const data = await res.json();

        /* log everything you receive */
        console.log("LISTINGS API →", data);

        const rows = Array.isArray(data)
          ? data
          : Array.isArray(data.allListings)
          ? data.allListings
          : data.allListings
          ? [data.allListings]
          : [];

        /* most‑recent first (uses createdAt if available) */
        rows.sort((a, b) => {
          if (a.createdAt && b.createdAt) {
            return new Date(b.createdAt) - new Date(a.createdAt);
          }
          return 0;

          // fallback keeps original order
        });
        const top18 = rows.slice(0, 18);
        setListings(top18);
      } catch (e) {
        console.error("listings fetch error", e);
        enqueueSnackbar("Failed to load recent listings", {
          variant: "error",
        });
      } finally {
        setLoading(false);
      }
    })();
  }, [enqueueSnackbar]);

  /* ---------- click on a card ---------- */
  const openListing = (id, type) => {
    if (type === "service") {
      navigate(`/hire/${id}`);
    } else if (type === "business") {
      navigate(`/business/${id}`);
    } // adjust the path if needed
  };

  /* ---------- UI ---------- */
  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <h2 className="text-4xl font-bold mb-4 text-center">Recent Listings</h2>

      {loading ? (
        <p className="text-center text-gray-500">Loading…</p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.slice(0, showAll ? listings.length : 6).map((l) => (
              <div
                key={l.id}
                onClick={() => openListing(l.id, l.type)}
                className="bg-white p-6 rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-shadow"
              >
                {/* if backend already sends full url use it; otherwise prefix */}
                <img
                  src={Array.isArray(l.images) ? l.images[0] : l.image}
                  alt={l.name}
                  className="w-full h-40 object-cover rounded-md"
                />
                <h3 className="text-lg font-semibold mt-4 capitalize">{l.name}</h3>
                <p className="text-sm text-gray-400">{l.category}</p>
                <p className="text-gray-500">{l.address}</p>
                <div className="mt-2">
                  {renderStars(l.rating || l.average_rating || 0)}
                </div>
                {l.time && (
                  <p className="text-blue-600 font-medium mt-2">{l.time}</p>
                )}
              </div>
            ))}
          </div>

          {/* toggle button */}
          {listings.length > 6 && (
            <div className="mt-6 flex justify-center">
              <button
                onClick={() => setShowAll((p) => !p)}
                className={`px-6 py-2 text-white font-semibold rounded-lg transition ${
                  showAll
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {showAll ? "Close" : "View More"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ---------- helper ---------- */

