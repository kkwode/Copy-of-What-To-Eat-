import { useState, useEffect } from 'react';
import { DEFAULT_FOOD_DATA } from '../constants/foodData';

export type FoodCategory = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface FoodData {
  breakfast: string[];
  lunch: string[];
  dinner: string[];
  snack: string[];
}

const STORAGE_KEY = 'what_to_eat_data_v2';

export function useFoodData() {
  const [foodData, setFoodData] = useState<FoodData>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved food data', e);
        return DEFAULT_FOOD_DATA;
      }
    }
    return DEFAULT_FOOD_DATA;
  });

  // 当数据改变时，同步到 localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(foodData));
  }, [foodData]);

  // 添加食物
  const addFood = (category: FoodCategory, name: string) => {
    const trimmedName = name.trim();
    if (!trimmedName) return;
    
    setFoodData(prev => {
      if (prev[category].includes(trimmedName)) return prev;
      return {
        ...prev,
        [category]: [...prev[category], trimmedName]
      };
    });
  };

  // 删除食物
  const removeFood = (category: FoodCategory, name: string) => {
    setFoodData(prev => ({
      ...prev,
      [category]: prev[category].filter(item => item !== name)
    }));
  };

  // 重置为默认
  const resetData = () => {
    setFoodData(DEFAULT_FOOD_DATA);
  };

  return {
    foodData,
    addFood,
    removeFood,
    resetData
  };
}
