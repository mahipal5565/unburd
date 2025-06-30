import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Wind, Heart, Quote, RefreshCcw, CheckCircle, Circle, Sparkles } from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  interpolate,
  useAnimatedScrollHandler,
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

interface QuickWin {
  id: string;
  text: string;
  completed: boolean;
  category: 'physical' | 'mental' | 'social' | 'creative' | 'mindful';
}

const fallbackQuickWins: QuickWin[] = [
  { id: '1', text: 'Take 5 deep breaths and notice how your body feels', completed: false, category: 'mindful' },
  { id: '2', text: 'Write down one thing you accomplished today', completed: false, category: 'mental' },
  { id: '3', text: 'Do 10 gentle stretches or jumping jacks', completed: false, category: 'physical' },
];

const fallbackAffirmations = [
  "You are worthy of love and belonging exactly as you are.",
  "Every small step forward is a victory worth celebrating.",
  "Your resilience is your superpower, even when you don't feel strong.",
  "Progress, not perfection, is the goal.",
  "You have been assigned this mountain to show others it can be moved."
];

export default function MoodToolsScreen() {
  const [isBreathing, setIsBreathing] = useState(false);
  const [breathCount, setBreathCount] = useState(0);
  const [currentAffirmation, setCurrentAffirmation] = useState(fallbackAffirmations[0]);
  const [quickWins, setQuickWins] = useState<QuickWin[]>(fallbackQuickWins);

  const breathingScale = useSharedValue(1);
  const breathingOpacity = useSharedValue(0.7);
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

  useEffect(() => {
    breathingScale.value = withRepeat(
      withTiming(1.1, {
        duration: 2000,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true
    );
  }, []);

  const startBreathingExercise = () => {
    setIsBreathing(true);
    setBreathCount(0);
    
    // 4-7-8 breathing pattern
    breathingScale.value = withRepeat(
      withTiming(1.3, {
        duration: 4000,
        easing: Easing.inOut(Easing.ease),
      }),
      5, // 5 cycles
      true
    );

    breathingOpacity.value = withRepeat(
      withTiming(1, { duration: 4000 }),
      5,
      true
    );

    // Count breaths
    const interval = setInterval(() => {
      setBreathCount(prev => prev + 1);
    }, 8000);

    // Auto-stop after 5 cycles
    setTimeout(() => {
      stopBreathingExercise();
      clearInterval(interval);
    }, 5 * 8000);
  };

  const stopBreathingExercise = () => {
    setIsBreathing(false);
    breathingScale.value = withTiming(1, { duration: 1000 });
    breathingOpacity.value = withTiming(0.7, { duration: 1000 });
  };

  const getNewAffirmation = () => {
    const randomIndex = Math.floor(Math.random() * fallbackAffirmations.length);
    setCurrentAffirmation(fallbackAffirmations[randomIndex]);
  };

  const toggleQuickWin = (id: string) => {
    setQuickWins(prev => 
      prev.map(win => 
        win.id === id ? { ...win, completed: !win.completed } : win
      )
    );
  };

  const refreshQuickWins = () => {
    setQuickWins(fallbackQuickWins.map(win => ({ ...win, completed: false })));
  };

  const completedCount = quickWins.filter(win => win.completed).length;
  const completionPercentage = quickWins.length > 0 ? (completedCount / quickWins.length) * 100 : 0;

  const breathingAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: breathingScale.value }],
      opacity: breathingOpacity.value,
    };
  });

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'physical': return '#4FD1C7';
      case 'mental': return '#B19CD9';
      case 'social': return '#FFB3BA';
      case 'creative': return '#F6AD55';
      case 'mindful': return '#68D391';
      default: return '#B19CD9';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Auto-hiding Header */}
      <Animated.View style={[styles.header, headerAnimatedStyle]}>
        <LinearGradient
          colors={['#4FD1C7', '#B19CD9', '#FFB3BA']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <View style={styles.headerIconContainer}>
              <View style={styles.headerIconBackground}>
                <Wind size={28} color="#FFFFFF" strokeWidth={2.5} />
              </View>
            </View>
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>Mood Tools</Text>
              <Text style={styles.headerSubtitle}>
                Wellness activities to boost your mood
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
        {/* Breathing Exercise */}
        <View style={styles.toolCard}>
          <View style={styles.toolHeader}>
            <View style={styles.toolIconContainer}>
              <Wind size={28} color="#4FD1C7" strokeWidth={2} />
            </View>
            <View style={styles.toolTitleContainer}>
              <Text style={styles.toolTitle}>Breathing Exercise</Text>
            </View>
          </View>
          
          <Text style={styles.toolDescription}>
            4-7-8 breathing technique to calm your nervous system
          </Text>

          <View style={styles.breathingContainer}>
            <Animated.View style={[styles.breathingCircle, breathingAnimatedStyle]}>
              <Text style={styles.breathingText}>
                {isBreathing ? 'Breathe' : 'Ready'}
              </Text>
            </Animated.View>
          </View>

          {isBreathing && (
            <Text style={styles.breathCount}>
              Breath cycle: {breathCount}
            </Text>
          )}

          <TouchableOpacity
            style={[styles.actionButton, isBreathing ? styles.stopButton : styles.startButton]}
            onPress={isBreathing ? stopBreathingExercise : startBreathingExercise}
          >
            <Text style={styles.actionButtonText}>
              {isBreathing ? 'Stop' : 'Start Breathing'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Quick Wins Checklist */}
        <View style={styles.toolCard}>
          <View style={styles.toolHeader}>
            <View style={styles.toolIconContainer}>
              <CheckCircle size={28} color="#4FD1C7" strokeWidth={2} />
            </View>
            <View style={styles.toolTitleContainer}>
              <Text style={styles.toolTitle}>Quick Wins</Text>
            </View>
          </View>
          
          <Text style={styles.toolDescription}>
            Simple tasks to boost your mood and build momentum
          </Text>

          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[styles.progressFill, { width: `${completionPercentage}%` }]} 
              />
            </View>
            <Text style={styles.progressText}>
              {completedCount}/{quickWins.length} completed
            </Text>
          </View>

          <View style={styles.quickWinsList}>
            {quickWins.map((win) => (
              <TouchableOpacity
                key={win.id}
                style={[styles.quickWinItem, win.completed && styles.quickWinCompleted]}
                onPress={() => toggleQuickWin(win.id)}
              >
                <View style={styles.quickWinLeft}>
                  {win.completed ? (
                    <CheckCircle size={20} color="#4FD1C7" strokeWidth={2} />
                  ) : (
                    <Circle size={20} color="#9CA3AF" strokeWidth={2} />
                  )}
                  <View style={[styles.categoryDot, { backgroundColor: getCategoryColor(win.category) }]} />
                </View>
                <Text style={[
                  styles.quickWinText,
                  win.completed && styles.quickWinTextCompleted
                ]}>
                  {win.text}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={[styles.actionButton, styles.resetButton]}
            onPress={refreshQuickWins}
          >
            <RefreshCcw size={16} color="#FFFFFF" strokeWidth={2} />
            <Text style={styles.actionButtonText}>Reset Tasks</Text>
          </TouchableOpacity>
        </View>

        {/* Daily Inspiration */}
        <View style={styles.toolCard}>
          <View style={styles.toolHeader}>
            <View style={styles.toolIconContainer}>
              <Quote size={28} color="#B19CD9" strokeWidth={2} />
            </View>
            <View style={styles.toolTitleContainer}>
              <Text style={styles.toolTitle}>Daily Inspiration</Text>
            </View>
          </View>
          
          <Text style={styles.toolDescription}>
            Uplifting affirmations and quotes to remind you of your strength
          </Text>

          <View style={styles.affirmationContainer}>
            <Text style={styles.affirmationText}>"{currentAffirmation}"</Text>
          </View>

          <TouchableOpacity
            style={[styles.actionButton, styles.inspirationButton]}
            onPress={getNewAffirmation}
          >
            <Sparkles size={18} color="#FFFFFF" strokeWidth={2} />
            <Text style={styles.actionButtonText}>New Inspiration</Text>
          </TouchableOpacity>
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
  header: {
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
  toolCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  toolHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  toolIconContainer: {
    marginRight: 16,
  },
  toolTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toolTitle: {
    fontSize: 22,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
    textAlign: 'left',
  },
  toolDescription: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    lineHeight: 24,
    marginBottom: 24,
    textAlign: 'left',
  },
  breathingContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  breathingCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#4FD1C7',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4FD1C7',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 8,
  },
  breathingText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  breathCount: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#4FD1C7',
    textAlign: 'center',
    marginBottom: 16,
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4FD1C7',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    textAlign: 'center',
  },
  quickWinsList: {
    marginBottom: 20,
  },
  quickWinItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  quickWinCompleted: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  quickWinLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
  quickWinText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#374151',
    flex: 1,
    textAlign: 'left',
  },
  quickWinTextCompleted: {
    textDecorationLine: 'line-through',
    color: '#6B7280',
  },
  affirmationContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#B19CD9',
  },
  affirmationText: {
    fontSize: 18,
    fontFamily: 'Inter-Medium',
    color: '#374151',
    lineHeight: 28,
    fontStyle: 'italic',
    textAlign: 'left',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#B19CD9',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 25,
    gap: 8,
  },
  startButton: {
    backgroundColor: '#4FD1C7',
  },
  stopButton: {
    backgroundColor: '#FF6B6B',
  },
  resetButton: {
    backgroundColor: '#6B7280',
  },
  inspirationButton: {
    backgroundColor: '#B19CD9',
  },
  actionButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
});