import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { docApi } from '../../../../services/api';
import SidebarItem from './SidebarItem';

const FavoriteAction = () => {
  const { docId } = useParams();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!docId) return;
    
    const fetchFavoriteStatus = async () => {
      try {
        const res = await docApi.getFavoriteStatus(docId);
        setIsFavorite(res.data.data.isFavorite);
      } catch (error) {
        console.error("Failed to fetch favorite status", error);
      }
    };
    
    fetchFavoriteStatus();
  }, [docId]);

  const toggleFavorite = async () => {
    if (!docId || isLoading) return;
    
    setIsLoading(true);
    // Optimistic UI update
    const previousState = isFavorite;
    setIsFavorite(!previousState);
    
    try {
      const res = await docApi.toggleFavorite(docId);
      const newState = res.data.data.isFavorite;
      setIsFavorite(newState);
      toast.success(res.data.message);
    } catch (error) {
      // Revert on failure
      setIsFavorite(previousState);
      toast.error(error.response?.data?.message || "Failed to update favorites");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SidebarItem 
      icon={
        <Star 
          className={`w-4 h-4 transition-all ${
            isFavorite 
              ? 'fill-[#f59e0b] text-[#f59e0b] drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]' 
              : 'text-slate-400'
          }`} 
        />
      } 
      label={isFavorite ? "Remove from Favorites" : "Add to Favorites"} 
      onClick={toggleFavorite} 
    />
  );
};

export default FavoriteAction;
