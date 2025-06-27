import { Feather, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    Alert,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useProfile } from '../../hooks/useProfile';
import { useAuth } from '../../lib/contexts/AuthContext';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'support';
  timestamp: Date;
  isRead: boolean;
}

interface ChatSession {
  id: string;
  status: 'active' | 'resolved' | 'pending';
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
}

export default function ChatScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { profile } = useProfile();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [chatStatus, setChatStatus] = useState<'active' | 'resolved' | 'pending'>('active');
  const flatListRef = useRef<FlatList>(null);

  // Messages d'accueil automatiques
  useEffect(() => {
    const welcomeMessages: Message[] = [
      {
        id: '1',
        text: 'Bonjour ! 👋 Bienvenue dans le support client de BraPrime. Comment pouvons-nous vous aider aujourd\'hui ?',
        sender: 'support',
        timestamp: new Date(),
        isRead: true,
      },
      {
        id: '2',
        text: 'Vous pouvez nous poser des questions sur :\n• Vos commandes\n• Les paiements\n• Les livraisons\n• Les problèmes techniques\n• Ou toute autre question',
        sender: 'support',
        timestamp: new Date(Date.now() + 1000),
        isRead: true,
      },
    ];
    setMessages(welcomeMessages);
  }, []);

  // Auto-scroll vers le bas quand de nouveaux messages arrivent
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: newMessage.trim(),
      sender: 'user',
      timestamp: new Date(),
      isRead: true,
    };

    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    setIsTyping(true);

    // Simuler une réponse du support (dans une vraie app, ce serait une API)
    setTimeout(() => {
      const supportMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: generateSupportResponse(newMessage.trim()),
        sender: 'support',
        timestamp: new Date(),
        isRead: false,
      };
      setMessages(prev => [...prev, supportMessage]);
      setIsTyping(false);
    }, 2000);
  };

  const generateSupportResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('commande') || lowerMessage.includes('order')) {
      return 'Pour suivre votre commande, allez dans "Mes Commandes" depuis votre profil. Vous y trouverez le statut et les détails de toutes vos commandes.';
    }
    
    if (lowerMessage.includes('paiement') || lowerMessage.includes('payment') || lowerMessage.includes('pay')) {
      return 'Nous acceptons les paiements en espèces, par carte bancaire et par mobile money. Vous pouvez gérer vos méthodes de paiement dans les paramètres de votre compte.';
    }
    
    if (lowerMessage.includes('livraison') || lowerMessage.includes('delivery') || lowerMessage.includes('livrer')) {
      return 'Nos délais de livraison varient entre 30 minutes et 2 heures selon votre localisation. Vous recevrez une notification quand votre commande sera en route.';
    }
    
    if (lowerMessage.includes('problème') || lowerMessage.includes('erreur') || lowerMessage.includes('bug')) {
      return 'Je suis désolé pour ce problème. Pouvez-vous me donner plus de détails ? Notre équipe technique sera notifiée pour vous aider rapidement.';
    }
    
    if (lowerMessage.includes('merci') || lowerMessage.includes('thanks')) {
      return 'De rien ! 😊 N\'hésitez pas si vous avez d\'autres questions.';
    }
    
    return 'Merci pour votre message. Un membre de notre équipe va vous répondre dans les plus brefs délais. En attendant, vous pouvez consulter notre FAQ ou nous appeler au +224 XXX XXX XXX.';
  };

  const handleBack = () => {
    router.back();
  };

  const handleEndChat = () => {
    Alert.alert(
      'Terminer la conversation',
      'Êtes-vous sûr de vouloir terminer cette conversation ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Terminer',
          style: 'destructive',
          onPress: () => {
            setChatStatus('resolved');
            const endMessage: Message = {
              id: Date.now().toString(),
              text: 'Cette conversation a été terminée. Merci d\'avoir contacté le support BraPrime !',
              sender: 'support',
              timestamp: new Date(),
              isRead: true,
            };
            setMessages(prev => [...prev, endMessage]);
          },
        },
      ]
    );
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View style={[
      styles.messageContainer,
      item.sender === 'user' ? styles.userMessage : styles.supportMessage
    ]}>
      <View style={[
        styles.messageBubble,
        item.sender === 'user' ? styles.userBubble : styles.supportBubble
      ]}>
        <Text style={[
          styles.messageText,
          item.sender === 'user' ? styles.userText : styles.supportText
        ]}>
          {item.text}
        </Text>
        <Text style={[
          styles.messageTime,
          item.sender === 'user' ? styles.userTime : styles.supportTime
        ]}>
          {formatTime(item.timestamp)}
        </Text>
      </View>
    </View>
  );

  const renderTypingIndicator = () => (
    <View style={styles.typingContainer}>
      <View style={styles.typingBubble}>
        <View style={styles.typingDots}>
          <View style={[styles.dot, styles.dot1]} />
          <View style={[styles.dot, styles.dot2]} />
          <View style={[styles.dot, styles.dot3]} />
        </View>
        <Text style={styles.typingText}>Support en train d'écrire...</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="black" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>Support Client</Text>
          <View style={styles.statusContainer}>
            <View style={[styles.statusDot, { backgroundColor: chatStatus === 'active' ? '#4CAF50' : '#FF9800' }]} />
            <Text style={styles.statusText}>
              {chatStatus === 'active' ? 'En ligne' : chatStatus === 'resolved' ? 'Terminé' : 'En attente'}
            </Text>
          </View>
        </View>
        <TouchableOpacity onPress={handleEndChat} style={styles.endButton}>
          <MaterialIcons name="close" size={24} color="#E31837" />
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <KeyboardAvoidingView 
        style={styles.messagesContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          style={styles.messagesList}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={isTyping ? renderTypingIndicator : null}
        />
      </KeyboardAvoidingView>

      {/* Input */}
      {chatStatus === 'active' && (
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="Tapez votre message..."
            value={newMessage}
            onChangeText={setNewMessage}
            multiline
            maxLength={500}
            placeholderTextColor="#999"
          />
          <TouchableOpacity 
            style={[styles.sendButton, !newMessage.trim() && styles.sendButtonDisabled]}
            onPress={handleSendMessage}
            disabled={!newMessage.trim()}
          >
            <Feather 
              name="send" 
              size={20} 
              color={newMessage.trim() ? '#fff' : '#ccc'} 
            />
          </TouchableOpacity>
        </View>
      )}

      {chatStatus === 'resolved' && (
        <View style={styles.resolvedContainer}>
          <Text style={styles.resolvedText}>Cette conversation est terminée</Text>
          <TouchableOpacity 
            style={styles.newChatButton}
            onPress={() => {
              setChatStatus('active');
              setMessages([]);
            }}
          >
            <Text style={styles.newChatText}>Nouvelle conversation</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 4,
  },
  headerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    color: '#666',
  },
  endButton: {
    padding: 4,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  messageContainer: {
    marginBottom: 12,
  },
  userMessage: {
    alignItems: 'flex-end',
  },
  supportMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  userBubble: {
    backgroundColor: '#E31837',
    borderBottomRightRadius: 4,
  },
  supportBubble: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#eee',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userText: {
    color: '#fff',
  },
  supportText: {
    color: '#000',
  },
  messageTime: {
    fontSize: 11,
    marginTop: 4,
  },
  userTime: {
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'right',
  },
  supportTime: {
    color: '#999',
  },
  typingContainer: {
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  typingBubble: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#eee',
    flexDirection: 'row',
    alignItems: 'center',
  },
  typingDots: {
    flexDirection: 'row',
    marginRight: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#999',
    marginHorizontal: 2,
  },
  dot1: {
    opacity: 0.4,
  },
  dot2: {
    opacity: 0.7,
  },
  dot3: {
    opacity: 1,
  },
  typingText: {
    fontSize: 14,
    color: '#666',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  textInput: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 100,
    fontSize: 16,
    marginRight: 8,
  },
  sendButton: {
    backgroundColor: '#E31837',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#f0f0f0',
  },
  resolvedContainer: {
    padding: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  resolvedText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 12,
  },
  newChatButton: {
    backgroundColor: '#E31837',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  newChatText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
}); 