import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import cartReducer from '../../features/shop/store/cartSlice';
import wishlistReducer from '../../features/shop/store/wishlistSlice';
import bookingReducer from '../../features/consultation/store/bookingSlice';
import doctorsReducer from '../../features/consultation/store/doctorsSlice';
import productsReducer from '../../features/shop/store/productsSlice';
import healthRecordsReducer from '../../features/health-records/store/healthRecordsSlice';

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['cart', 'wishlist', 'booking'],
};

const rootReducer = combineReducers({
  cart: cartReducer,
  wishlist: wishlistReducer,
  booking: bookingReducer,
  doctors: doctorsReducer,
  products: productsReducer,
  healthRecords: healthRecordsReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;
