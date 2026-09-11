import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../core/theme/ThemeProvider';
import { ConsultationStackParamList } from './types';
import { DoctorListScreen } from '../screens/DoctorListScreen';
import { DoctorDetailScreen } from '../screens/DoctorDetailScreen';
import { BookingConfirmScreen } from '../screens/BookingConfirmScreen';
import { UpcomingBookingsScreen } from '../screens/UpcomingBookingsScreen';

const Stack = createNativeStackNavigator<ConsultationStackParamList>();

function BookingsHeaderButton() {
  const navigation = useNavigation();
  const { colors } = useTheme();
  return (
    <TouchableOpacity
      onPress={() => navigation.navigate('UpcomingBookings' as never)}
      accessibilityRole="button"
      accessibilityLabel="Upcoming bookings"
    >
      <Text style={{ color: colors.textInverse, fontSize: 20 }}>📅</Text>
    </TouchableOpacity>
  );
}

export function ConsultationNavigator() {
  const { t } = useTranslation();
  const { colors } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: colors.textInverse,
        headerTitleStyle: { fontWeight: '600' },
      }}
    >
      <Stack.Screen
        name="DoctorList"
        component={DoctorListScreen}
        options={{
          title: t('consultation.title'),
          headerRight: () => <BookingsHeaderButton />,
        }}
      />
      <Stack.Screen name="DoctorDetail" component={DoctorDetailScreen} options={{ title: t('consultation.doctorDetail') }} />
      <Stack.Screen name="BookingConfirm" component={BookingConfirmScreen} options={{ title: t('consultation.confirmBooking') }} />
      <Stack.Screen
        name="UpcomingBookings"
        component={UpcomingBookingsScreen}
        options={{ title: t('consultation.upcoming') }}
      />
    </Stack.Navigator>
  );
}
