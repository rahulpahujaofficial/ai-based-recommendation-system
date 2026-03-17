import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { storesApi, productsApi } from '@/lib/api'

const StoreContext = createContext(null)

const DEFAULT_STORE_ID = 'demo-store-1'

export function StoreProvider({ children }) {
  const [storeId, setStoreId] = useState(
    () => localStorage.getItem('recoai_store_id') || DEFAULT_STORE_ID
  )
  const [store, setStore] = useState(null)
  const [productCount, setProductCount] = useState(0)
  const [stores, setStores] = useState([])
  const [loading, setLoading] = useState(true)

  const loadStore = useCallback(async (id) => {
    setLoading(true)
    try {
      const [s, list, prods] = await Promise.allSettled([
        storesApi.get(id),
        storesApi.list(),
        productsApi.list(id, { per_page: 1 }),
      ])

      if (list.status === 'fulfilled') {
        const userStores = list.value
        setStores(userStores)
        // If the current storeId is not accessible, auto-switch to the user's first store
        if (userStores.length > 0 && s.status !== 'fulfilled') {
          const firstId = userStores[0].store_id
          localStorage.setItem('recoai_store_id', firstId)
          setStoreId(firstId)
          setLoading(false)
          return // useEffect will re-trigger loadStore with the correct id
        }
      }

      if (s.status === 'fulfilled') setStore(s.value)
      if (prods.status === 'fulfilled') setProductCount(prods.value.total || 0)
    } catch (_) {}
    setLoading(false)
  }, [])

  useEffect(() => {
    localStorage.setItem('recoai_store_id', storeId)
    loadStore(storeId)
  }, [storeId, loadStore])

  const switchStore = (id) => setStoreId(id)

  const refreshStore = () => loadStore(storeId)

  return (
    <StoreContext.Provider value={{ storeId, store, stores, productCount, loading, switchStore, refreshStore, setStore }}>
      {children}
    </StoreContext.Provider>
  )
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used within StoreProvider')
  return ctx
}
