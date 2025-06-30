import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Settings as SettingsIcon, 
  Shield, 
  HelpCircle, 
  ExternalLink, 
  Trash2,
  Star,
  Heart
} from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedScrollHandler,
  interpolate,
} from 'react-native-reanimated';

interface SettingItem {
  id: string;
  title: string;
  description: string;
  type: 'toggle' | 'action';
  value?: boolean;
  onPress?: () => void;
  onToggle?: (value: boolean) => void;
  icon: React.ReactNode;
}

export default function SettingsScreen() {
  const [adPersonalization, setAdPersonalization] = useState(true);

  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const headerAnimatedStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      scrollY.value,
      [0, 100],
      [0, -120],
      'clamp'
    );
    
    const opacity = interpolate(
      scrollY.value,
      [0, 50, 100],
      [1, 0.5, 0],
      'clamp'
    );

    return {
      transform: [{ translateY }],
      opacity,
    };
  });

  const handleClearData = () => {
    Alert.alert(
      'Clear Chat History',
      'This will permanently delete all your chat messages. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Success', 'Chat history has been cleared.');
          },
        },
      ]
    );
  };

  const showPrivacyPolicy = () => {
    Alert.alert(
      'Privacy Policy',
      'Your privacy is our top priority. All conversations are processed locally and not stored on our servers. We only collect anonymous usage data to improve the app.',
      [{ text: 'OK' }]
    );
  };

  const showSupport = () => {
    Alert.alert(
      'Support',
      'Need help or have feedback? Contact us at support@unburden.app',
      [{ text: 'OK' }]
    );
  };

  const handleRateApp = () => {
    Alert.alert(
      'Rate Unburden',
      'Help others discover this app by leaving a review!',
      [
        { text: 'Maybe Later', style: 'cancel' },
        { text: 'Rate Now', onPress: () => console.log('Open App Store') },
      ]
    );
  };

  const settings: SettingItem[] = [
    {
      id: 'ad-personalization',
      title: 'Ad Personalization',
      description: 'Show relevant ads based on your interests',
      type: 'toggle',
      value: adPersonalization,
      onToggle: setAdPersonalization,
      icon: <Shield size={24} color="#B19CD9" strokeWidth={2} />,
    },
    {
      id: 'privacy',
      title: 'Privacy Policy',
      description: 'Learn how we protect your data',
      type: 'action',
      onPress: showPrivacyPolicy,
      icon: <Shield size={24} color="#6B7280" strokeWidth={2} />,
    },
    {
      id: 'support',
      title: 'Help & Support',
      description: 'Get help or send feedback',
      type: 'action',
      onPress: showSupport,
      icon: <HelpCircle size={24} color="#6B7280" strokeWidth={2} />,
    },
    {
      id: 'rate',
      title: 'Rate Unburden',
      description: 'Share your experience with others',
      type: 'action',
      onPress: handleRateApp,
      icon: <Star size={24} color="#FFD700" strokeWidth={2} />,
    },
    {
      id: 'clear-data',
      title: 'Clear Chat History',
      description: 'Delete all conversation data',
      type: 'action',
      onPress: handleClearData,
      icon: <Trash2 size={24} color="#FF6B6B" strokeWidth={2} />,
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Auto-hiding Custom Header */}
      <Animated.View style={[styles.customHeader, headerAnimatedStyle]}>
        <LinearGradient
          colors={['#B19CD9', '#4FD1C7', '#FFB3BA']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <View style={styles.headerIconContainer}>
              <View style={styles.headerIconBackground}>
                <SettingsIcon size={28} color="#FFFFFF" strokeWidth={2.5} />
              </View>
            </View>
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>Settings</Text>
              <Text style={styles.headerSubtitle}>
                Customize your Unburden experience
              </Text>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>

      <Animated.ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
      >
        {/* App Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Settings</Text>
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={styles.settingIconContainer}>
                {settings[0].icon}
              </View>
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>{settings[0].title}</Text>
                <Text style={styles.settingDescription}>
                  {settings[0].description}
                </Text>
              </View>
            </View>
            <Switch
              value={settings[0].value}
              onValueChange={settings[0].onToggle}
              trackColor={{ false: '#E5E7EB', true: '#B19CD9' }}
              thumbColor={settings[0].value ? '#FFFFFF' : '#F9FAFB'}
            />
          </View>
        </View>

        {/* Support & Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support & Information</Text>
          {settings.slice(1, 4).map((setting) => (
            <TouchableOpacity
              key={setting.id}
              style={styles.settingItem}
              onPress={setting.onPress}
            >
              <View style={styles.settingLeft}>
                <View style={styles.settingIconContainer}>
                  {setting.icon}
                </View>
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>{setting.title}</Text>
                  <Text style={styles.settingDescription}>
                    {setting.description}
                  </Text>
                </View>
              </View>
              <ExternalLink size={20} color="#9CA3AF" strokeWidth={2} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Data Management */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Management</Text>
          <TouchableOpacity
            style={[styles.settingItem, styles.dangerItem]}
            onPress={settings[4].onPress}
          >
            <View style={styles.settingLeft}>
              <View style={styles.settingIconContainer}>
                {settings[4].icon}
              </View>
              <View style={styles.settingText}>
                <Text style={[styles.settingTitle, styles.dangerText]}>
                  {settings[4].title}
                </Text>
                <Text style={styles.settingDescription}>
                  {settings[4].description}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View style={styles.appInfoSection}>
          <Heart size={32} color="#B19CD9" strokeWidth={2} />
          <Text style={styles.appName}>Unburden</Text>
          <Text style={styles.appVersion}>Version 1.0.0</Text>
          <Text style={styles.appDescription}>
            A safe space for emotional support and self-care.
            Your privacy and well-being are our priority.
          </Text>
        </View>
      </Animated.ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  customHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingTop: 44,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  headerGradient: {
    paddingTop: 12,
    paddingBottom: 16,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIconContainer: {
    marginRight: 16,
  },
  headerIconBackground: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginBottom: 4,
    textAlign: 'left',
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'left',
    lineHeight: 20,
  },
  content: {
    flex: 1,
    paddingTop: 120,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 120,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
    marginBottom: 16,
    marginLeft: 4,
    textAlign: 'left',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIconContainer: {
    marginRight: 16,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
    marginBottom: 4,
    textAlign: 'left',
  },
  settingDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    lineHeight: 20,
    textAlign: 'left',
  },
  dangerItem: {
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.2)',
  },
  dangerText: {
    color: '#FF6B6B',
  },
  appInfoSection: {
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  appName: {
    fontSize: 24,
    fontFamily: 'Inter-SemiBold',
    color: '#B19CD9',
    marginTop: 12,
    marginBottom: 4,
    textAlign: 'center',
  },
  appVersion: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginBottom: 16,
    textAlign: 'center',
  },
  appDescription: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#374151',
    textAlign: 'center',
    lineHeight: 24,
  },
});