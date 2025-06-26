import { useEffect, useState } from 'react';
import { MenuCategory, MenuItemWithCategory, MenuService } from '../lib/services/MenuService';

interface UseMenuCategoriesReturn {
  categories: MenuCategory[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useMenuCategories(businessId: number | string | null | undefined): UseMenuCategoriesReturn {
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    if (!businessId) {
      setCategories([]);
      setLoading(false);
      return;
    }

    const id = parseInt(businessId.toString());
    if (isNaN(id) || id <= 0) {
      setError('ID de commerce invalide');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await MenuService.getMenuCategories(id);
      setCategories(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la récupération des catégories');
      console.error('Erreur dans useMenuCategories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [businessId]);

  return {
    categories,
    loading,
    error,
    refetch: fetchCategories,
  };
}

interface UseMenuItemsReturn {
  menuItems: MenuItemWithCategory[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useMenuItems(businessId: number | string | null | undefined): UseMenuItemsReturn {
  const [menuItems, setMenuItems] = useState<MenuItemWithCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMenuItems = async () => {
    if (!businessId) {
      setMenuItems([]);
      setLoading(false);
      return;
    }

    const id = parseInt(businessId.toString());
    if (isNaN(id) || id <= 0) {
      setError('ID de commerce invalide');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await MenuService.getMenuItems(id);
      setMenuItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la récupération du menu');
      console.error('Erreur dans useMenuItems:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenuItems();
  }, [businessId]);

  return {
    menuItems,
    loading,
    error,
    refetch: fetchMenuItems,
  };
}

interface UseMenuItemsByCategoryReturn {
  menuItems: MenuItemWithCategory[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useMenuItemsByCategory(
  businessId: number | string | null | undefined,
  categoryId: number | null
): UseMenuItemsByCategoryReturn {
  const [menuItems, setMenuItems] = useState<MenuItemWithCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMenuItemsByCategory = async () => {
    if (!businessId || !categoryId) {
      setMenuItems([]);
      setLoading(false);
      return;
    }

    const businessIdNum = parseInt(businessId.toString());
    if (isNaN(businessIdNum) || businessIdNum <= 0) {
      setError('ID de commerce invalide');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await MenuService.getMenuItemsByCategory(businessIdNum, categoryId);
      setMenuItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la récupération des articles');
      console.error('Erreur dans useMenuItemsByCategory:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenuItemsByCategory();
  }, [businessId, categoryId]);

  return {
    menuItems,
    loading,
    error,
    refetch: fetchMenuItemsByCategory,
  };
}

interface UsePopularMenuItemsReturn {
  menuItems: MenuItemWithCategory[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function usePopularMenuItems(
  businessId: number | string | null | undefined,
  limit: number = 10
): UsePopularMenuItemsReturn {
  const [menuItems, setMenuItems] = useState<MenuItemWithCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPopularMenuItems = async () => {
    if (!businessId) {
      setMenuItems([]);
      setLoading(false);
      return;
    }

    const id = parseInt(businessId.toString());
    if (isNaN(id) || id <= 0) {
      setError('ID de commerce invalide');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await MenuService.getPopularMenuItems(id, limit);
      setMenuItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la récupération des articles populaires');
      console.error('Erreur dans usePopularMenuItems:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPopularMenuItems();
  }, [businessId, limit]);

  return {
    menuItems,
    loading,
    error,
    refetch: fetchPopularMenuItems,
  };
} 