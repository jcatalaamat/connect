import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { Platform } from 'react-native'

interface City {
  id: string
  slug: string
  name: string
  country: string
}

interface CityContextValue {
  city: City | null
  citySlug: string | null
  isLoading: boolean
  setCity: (city: City) => void
  clearCity: () => void
}

const CityContext = createContext<CityContextValue | undefined>(undefined)

const STORAGE_KEY = '@connect_selected_city'

// Storage abstraction for web/native
const storage = {
  async get(): Promise<City | null> {
    try {
      if (Platform.OS === 'web') {
        const item = localStorage.getItem(STORAGE_KEY)
        return item ? JSON.parse(item) : null
      } else {
        const AsyncStorage = require('@react-native-async-storage/async-storage').default
        const item = await AsyncStorage.getItem(STORAGE_KEY)
        return item ? JSON.parse(item) : null
      }
    } catch {
      return null
    }
  },
  async set(city: City): Promise<void> {
    try {
      const value = JSON.stringify(city)
      if (Platform.OS === 'web') {
        localStorage.setItem(STORAGE_KEY, value)
      } else {
        const AsyncStorage = require('@react-native-async-storage/async-storage').default
        await AsyncStorage.setItem(STORAGE_KEY, value)
      }
    } catch {}
  },
  async remove(): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        localStorage.removeItem(STORAGE_KEY)
      } else {
        const AsyncStorage = require('@react-native-async-storage/async-storage').default
        await AsyncStorage.removeItem(STORAGE_KEY)
      }
    } catch {}
  },
}

export function CityProvider({ children }: { children: ReactNode }) {
  const [city, setLocalCity] = useState<City | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load city from storage on mount
  useEffect(() => {
    storage.get().then((savedCity) => {
      if (savedCity) {
        setLocalCity(savedCity)
      }
      setIsLoading(false)
    })
  }, [])

  const setCity = useCallback((newCity: City) => {
    setLocalCity(newCity)
    storage.set(newCity)
  }, [])

  const clearCity = useCallback(() => {
    setLocalCity(null)
    storage.remove()
  }, [])

  return (
    <CityContext.Provider
      value={{
        city,
        citySlug: city?.slug ?? null,
        isLoading,
        setCity,
        clearCity,
      }}
    >
      {children}
    </CityContext.Provider>
  )
}

export function useCity(): CityContextValue {
  const context = useContext(CityContext)
  if (context === undefined) {
    throw new Error('useCity must be used within a CityProvider')
  }
  return context
}
