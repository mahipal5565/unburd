import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Send, MessageCircle, Smile, Sparkles, Heart } from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  isTyping?: boolean;
}

interface MoodOption {
  id: string;
  text: string;
  action: 'better' | 'distract' | 'reflect';
  icon: React.ReactNode;
  color: string;
}

const fallbackResponses = [
  "I hear you, and I want you to know that your feelings are completely valid. Thank you for sharing with me.",
  "It takes courage to express what you're going through. I'm here to listen and support you.",
  "Your emotions matter, and it's okay to feel whatever you're feeling right now. You're not alone.",
  "I appreciate you opening up. Sometimes just putting our thoughts into words can be healing.",
  "Thank you for trusting me with your feelings. You're being so brave by reaching out."
];

export default function ChatScreen() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hi there 💜 I'm here to listen with an open heart. Share whatever is on your mind - there's no judgment here, just genuine support and understanding.",
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [showMoodOptions, setShowMoodOptions] = useState(false);
  const [isAITyping, setIsAITyping] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const textInputRef = useRef<TextInput>(null);
  const typingOpacity = useSharedValue(0.3);

  const moodOptions: MoodOption[] = [
    {
      id: 'better',
      text: 'I feel better now',
      action: 'better',
      icon: <Smile size={20} color="#4FD1C7" strokeWidth={2} />,
      color: '#4FD1C7',
    },
    {
      id: 'distract',
      text: 'Distract me please',
      action: 'distract',
      icon: <Sparkles size={20} color="#FFB3BA" strokeWidth={2} />,
      color: '#FFB3BA',
    },
    {
      id: 'reflect',
      text: 'Help me reflect',
      action: 'reflect',
      icon: <Heart size={20} color="#B19CD9" strokeWidth={2} />,
      color: '#B19CD9',
    },
  ];

  const scrollToBottom = (animated: boolean = true) => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated });
    }, 100);
  };

  useEffect(() => {
    // Typing indicator animation
    typingOpacity.value = withRepeat(
      withTiming(1, {
        duration: 800,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true
    );
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const typingAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: typingOpacity.value,
    };
  });

  const generateResponse = (userMessage: string): string => {
    const randomIndex = Math.floor(Math.random() * fallbackResponses.length);
    return fallbackResponses[randomIndex];
  };

  const simulateTypingResponse = async (userMessage: string, messageId: string) => {
    setIsAITyping(true);
    
    const typingMessage: Message = {
      id: messageId,
      text: '',
      isUser: false,
      timestamp: new Date(),
      isTyping: true,
    };
    
    setMessages(prev => [...prev, typingMessage]);

    const responseText = generateResponse(userMessage);
    const typingDelay = Math.min(Math.max(responseText.length * 30, 1500), 4000);
    
    setTimeout(() => {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, text: responseText, isTyping: false }
            : msg
        )
      );
      setIsAITyping(false);
      
      setTimeout(() => {
        textInputRef.current?.focus();
      }, 300);
    }, typingDelay);
  };

  const handleSendMessage = () => {
    if (inputText.trim() === '' || isAITyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    const currentInput = inputText.trim();
    setMessages(prev => [...prev, userMessage]);
    setInputText('');

    setTimeout(() => {
      textInputRef.current?.focus();
    }, 50);

    const aiMessageId = (Date.now() + 1).toString();
    simulateTypingResponse(currentInput, aiMessageId);
  };

  const handleMoodOption = async (option: MoodOption) => {
    setShowMoodOptions(false);
    
    const messageId = Date.now().toString();
    setIsAITyping(true);
    
    const typingMessage: Message = {
      id: messageId,
      text: '',
      isUser: false,
      timestamp: new Date(),
      isTyping: true,
    };
    
    setMessages(prev => [...prev, typingMessage]);

    const fallbacks = {
      better: "I'm so glad you're feeling better! 🌟 You've shown incredible strength and resilience today. Take care of yourself, and remember - I'm always here whenever you need support.",
      distract: "Here's something beautiful to think about: Every small step you take toward healing matters, even when you can't see the progress. You're doing better than you know. ✨",
      reflect: "Looking at our conversation, I see someone who had the courage to reach out and be honest about their feelings. That vulnerability is actually a sign of tremendous strength. 💜"
    };
    
    const typingDelay = 1500;
    
    setTimeout(() => {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, text: fallbacks[option.action], isTyping: false }
            : msg
        )
      );
      setIsAITyping(false);
      
      if (option.action === 'better') {
        setTimeout(() => {
          Alert.alert(
            'Session Complete',
            'Take a deep breath and carry this feeling with you. You did great today. 💜',
            [{ text: 'Thank You', onPress: () => router.back() }]
          );
        }, 3000);
      }
    }, typingDelay);
  };

  const renderTypingIndicator = () => (
    <View style={styles.typingContainer}>
      <Animated.View style={[styles.typingDot, typingAnimatedStyle]} />
      <Animated.View style={[styles.typingDot, typingAnimatedStyle]} />
      <Animated.View style={[styles.typingDot, typingAnimatedStyle]} />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#B19CD9', '#4FD1C7']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color="#FFFFFF" strokeWidth={2} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerText}>Unburden AI</Text>
            <Text style={styles.headerSubtext}>
              {isAITyping ? 'Thinking...' : 'Your safe space'}
            </Text>
          </View>
          <View style={styles.sessionInfo}>
            <Text style={styles.sessionText}>∞</Text>
          </View>
        </View>
      </LinearGradient>

      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
      >
        <View style={styles.chatContainer}>
          <ScrollView
            ref={scrollViewRef}
            style={styles.messagesContainer}
            contentContainerStyle={styles.messagesContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {messages.map((message) => (
              <View
                key={message.id}
                style={[
                  styles.messageContainer,
                  message.isUser ? styles.userMessageContainer : styles.aiMessageContainer,
                ]}
              >
                <View
                  style={[
                    styles.messageBubble,
                    message.isUser ? styles.userBubble : styles.aiBubble,
                  ]}
                >
                  {message.isTyping ? (
                    renderTypingIndicator()
                  ) : (
                    <Text
                      style={[
                        styles.messageText,
                        message.isUser ? styles.userText : styles.aiText,
                      ]}
                    >
                      {message.text}
                    </Text>
                  )}
                </View>
              </View>
            ))}
            <View style={styles.bottomSpacer} />
          </ScrollView>

          <View style={styles.inputContainer}>
            <View style={styles.inputContent}>
              <TouchableOpacity
                style={[styles.moodButton, isAITyping && styles.disabledButton]}
                onPress={() => !isAITyping && setShowMoodOptions(true)}
                disabled={isAITyping}
                activeOpacity={0.8}
              >
                <View style={styles.moodButtonContent}>
                  <MessageCircle size={18} color={isAITyping ? '#9CA3AF' : '#B19CD9'} strokeWidth={2} />
                  <Text style={[styles.moodButtonText, isAITyping && styles.disabledText]}>
                    How are you feeling?
                  </Text>
                </View>
              </TouchableOpacity>

              <View style={styles.inputRow}>
                <View style={[styles.textInputContainer, isAITyping && styles.disabledInputContainer]}>
                  <TextInput
                    ref={textInputRef}
                    style={[styles.textInput, isAITyping && styles.disabledText]}
                    value={inputText}
                    onChangeText={setInputText}
                    placeholder={isAITyping ? "Please wait..." : "Share what's on your mind..."}
                    placeholderTextColor={isAITyping ? '#D1D5DB' : '#9CA3AF'}
                    multiline
                    maxLength={500}
                    returnKeyType="send"
                    onSubmitEditing={handleSendMessage}
                    blurOnSubmit={false}
                    editable={!isAITyping}
                    onFocus={() => scrollToBottom()}
                    autoFocus={false}
                  />
                </View>
                
                <TouchableOpacity
                  style={[
                    styles.sendButton,
                    inputText.trim() && !isAITyping ? styles.sendButtonActive : null,
                    isAITyping && styles.disabledButton,
                  ]}
                  onPress={handleSendMessage}
                  disabled={inputText.trim() === '' || isAITyping}
                  activeOpacity={0.8}
                >
                  <Send
                    size={18}
                    color={inputText.trim() && !isAITyping ? '#FFFFFF' : '#9CA3AF'}
                    strokeWidth={2}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* Mood Options Modal */}
      <Modal
        visible={showMoodOptions}
        transparent
        animationType="slide"
        onRequestClose={() => setShowMoodOptions(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>How are you feeling right now?</Text>
            <Text style={styles.modalSubtitle}>
              Take a moment to check in with yourself
            </Text>
            
            {moodOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[styles.moodOptionButton, { borderLeftColor: option.color }]}
                onPress={() => handleMoodOption(option)}
                activeOpacity={0.8}
              >
                <View style={[styles.moodOptionIcon, { backgroundColor: option.color + '20' }]}>
                  {option.icon}
                </View>
                <Text style={styles.moodOptionText}>{option.text}</Text>
              </TouchableOpacity>
            ))}
            
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowMoodOptions(false)}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelButtonText}>Maybe later</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 16,
  },
  headerText: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  headerSubtext: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginTop: 2,
  },
  sessionInfo: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    minWidth: 50,
    alignItems: 'center',
  },
  sessionText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  chatContainer: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    flexGrow: 1,
  },
  messageContainer: {
    marginBottom: 16,
  },
  userMessageContainer: {
    alignItems: 'flex-end',
  },
  aiMessageContainer: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '85%',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 24,
  },
  userBubble: {
    backgroundColor: '#B19CD9',
    borderBottomRightRadius: 8,
  },
  aiBubble: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  messageText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    lineHeight: 24,
  },
  userText: {
    color: '#FFFFFF',
  },
  aiText: {
    color: '#374151',
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#B19CD9',
    marginHorizontal: 2,
  },
  bottomSpacer: {
    height: 20,
  },
  inputContainer: {
    backgroundColor: '#F9FAFB',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  inputContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
  },
  moodButton: {
    marginBottom: 12,
    borderRadius: 20,
    overflow: 'hidden',
  },
  moodButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 20,
  },
  moodButtonText: {
    fontSize: 15,
    fontFamily: 'Inter-Medium',
    color: '#B19CD9',
    marginLeft: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
  },
  textInputContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 44,
    justifyContent: 'center',
  },
  textInput: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#374151',
    maxHeight: 100,
    minHeight: 20,
    textAlignVertical: 'center',
    lineHeight: 22,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonActive: {
    backgroundColor: '#B19CD9',
  },
  disabledButton: {
    opacity: 0.5,
  },
  disabledInputContainer: {
    backgroundColor: '#F3F4F6',
    borderColor: '#D1D5DB',
  },
  disabledText: {
    color: '#9CA3AF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: 22,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
  },
  moodOptionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 20,
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
  },
  moodOptionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  moodOptionText: {
    fontSize: 17,
    fontFamily: 'Inter-Medium',
    color: '#374151',
    flex: 1,
  },
  cancelButton: {
    alignItems: 'center',
    paddingVertical: 16,
    marginTop: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  }
});