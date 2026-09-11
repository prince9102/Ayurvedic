import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../core/theme/ThemeProvider';
import { RecordsStackParamList } from './types';
import { RecordsTimelineScreen } from '../screens/RecordsTimelineScreen';
import { RecordDetailScreen } from '../screens/RecordDetailScreen';

const Stack = createNativeStackNavigator<RecordsStackParamList>();

export function HealthRecordsNavigator() {
  const { t } = useTranslation();
  const { colors } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: colors.textInverse,
      }}
    >
      <Stack.Screen
        name="RecordsTimeline"
        component={RecordsTimelineScreen}
        options={{ title: t('records.title') }}
      />
      <Stack.Screen name="RecordDetail" component={RecordDetailScreen} options={{ title: t('records.recordDetail') }} />
    </Stack.Navigator>
  );
}
