import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { apiFetch } from '../lib/api';
import { useAuthStore } from '../stores/authStore';
import type { SessionRecord } from '@serenity/shared';

export default function DashboardScreen() {
  const navigation = useNavigation();
  const { signOut } = useAuthStore();
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [loading, setLoading] = useState(false);

  const loadSessions = async () => {
    setLoading(true);
    try {
      const data = await apiFetch<{ sessions: SessionRecord[] }>('/sessions');
      setSessions(data.sessions);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadSessions();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Your Sessions</Text>
          <Text style={styles.subtitle}>Ready to create a new meditation?</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.navigate('Settings' as never)}
          >
            <Text style={styles.secondaryButtonText}>Settings</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton} onPress={() => void signOut()}>
            <Text style={styles.secondaryButtonText}>Log out</Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={() => navigation.navigate('NewSession' as never)}
      >
        <Text style={styles.primaryButtonText}>New Session</Text>
      </TouchableOpacity>

      {loading ? (
        <Text style={styles.loading}>Loading sessions...</Text>
      ) : (
        <FlatList
          data={sessions}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 24 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.sessionCard}
              onPress={() => navigation.navigate('SessionDetail' as never, { id: item.id } as never)}
            >
              <Text style={styles.sessionTitle}>{item.title || 'Untitled Session'}</Text>
              <Text style={styles.sessionMeta}>{new Date(item.created_at).toDateString()}</Text>
              <Text style={styles.sessionMeta}>Status: {item.status}</Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={<Text style={styles.empty}>No sessions yet. Create your first one.</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F1E8',
    padding: 24
  },
  header: {
    marginBottom: 16
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12
  },
  title: {
    fontSize: 26,
    fontWeight: '600',
    color: '#1B3A5C'
  },
  subtitle: {
    color: '#4B5563',
    marginTop: 4
  },
  primaryButton: {
    backgroundColor: '#2C7A7B',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600'
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: '#CBD5F5',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10
  },
  secondaryButtonText: {
    color: '#1B3A5C'
  },
  sessionCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12
  },
  sessionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1B3A5C'
  },
  sessionMeta: {
    color: '#6B7280',
    marginTop: 4
  },
  loading: {
    color: '#6B7280'
  },
  empty: {
    color: '#6B7280',
    marginTop: 12
  }
});
