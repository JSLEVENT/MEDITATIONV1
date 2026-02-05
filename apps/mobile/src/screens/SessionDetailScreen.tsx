import { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Audio } from 'expo-av';
import { apiFetch } from '../lib/api';
import type { SessionRecord, SessionScriptRecord, SessionInputRecord } from '@serenity/shared';

export default function SessionDetailScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { id } = route.params as { id: string };
  const [session, setSession] = useState<SessionRecord | null>(null);
  const [script, setScript] = useState<SessionScriptRecord | null>(null);
  const [input, setInput] = useState<SessionInputRecord | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [playing, setPlaying] = useState(false);

  const loadSession = async () => {
    const data = await apiFetch<{ session: SessionRecord; script?: SessionScriptRecord; input?: SessionInputRecord }>(
      `/sessions/${id}`
    );
    setSession(data.session);
    setScript(data.script || null);
    setInput(data.input || null);

    if (data.session.audio_url) {
      const audio = await apiFetch<{ url: string }>(`/sessions/${id}/stream`);
      setAudioUrl(audio.url);
    }
  };

  useEffect(() => {
    void loadSession();
  }, [id]);

  useEffect(() => {
    if (session?.status === 'generating') {
      const interval = setInterval(() => {
        void loadSession();
      }, 3000);
      return () => clearInterval(interval);
    }
    return undefined;
  }, [session?.status]);

  useEffect(() => {
    return () => {
      if (sound) {
        void sound.unloadAsync();
      }
    };
  }, [sound]);

  const togglePlay = async () => {
    if (!audioUrl) return;

    if (!sound) {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false
      });
      const { sound: newSound } = await Audio.Sound.createAsync({ uri: audioUrl });
      setSound(newSound);
      await newSound.playAsync();
      setPlaying(true);
      return;
    }

    if (playing) {
      await sound.pauseAsync();
      setPlaying(false);
    } else {
      await sound.playAsync();
      setPlaying(true);
    }
  };

  if (!session) {
    return (
      <View style={styles.container}>
        <Text style={styles.subtitle}>Loading session...</Text>
      </View>
    );
  }

  const safetyResources =
    (input?.parsed_themes as { safety_alert?: boolean; resources?: { title: string; phone?: string; text?: string; url?: string }[] } | undefined)?.
      safety_alert
      ? (input?.parsed_themes as any).resources || []
      : [];

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 24 }}>
      <Text style={styles.title}>{session.title || 'Your Session'}</Text>
      <Text style={styles.subtitle}>Status: {session.status}</Text>

      {session.status === 'generating' && (
        <Text style={styles.subtitle}>We are crafting your session...</Text>
      )}

      {session.status === 'failed' && (
        <View style={styles.card}>
          <Text style={styles.error}>
            {safetyResources.length > 0
              ? 'It sounds like you might be in crisis. Please reach out for immediate support.'
              : 'We could not generate this session. Please try again.'}
          </Text>
          {safetyResources.length > 0 && (
            <View style={{ marginTop: 8 }}>
              {safetyResources.map((resource: any) => (
                <View key={resource.title} style={styles.resourceCard}>
                  <Text style={styles.resourceTitle}>{resource.title}</Text>
                  {resource.phone ? <Text>Call: {resource.phone}</Text> : null}
                  {resource.text ? <Text>{resource.text}</Text> : null}
                  {resource.url ? <Text>{resource.url}</Text> : null}
                </View>
              ))}
            </View>
          )}
        </View>
      )}

      {session.status === 'ready' && (
        <View style={styles.card}>
          <Text style={styles.subtitle}>Your audio is ready.</Text>
          <TouchableOpacity style={styles.primaryButton} onPress={togglePlay}>
            <Text style={styles.primaryButtonText}>{playing ? 'Pause' : 'Play'}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.navigate('Feedback' as never, { id: session.id } as never)}
          >
            <Text style={styles.secondaryButtonText}>Leave feedback</Text>
          </TouchableOpacity>
        </View>
      )}

      {script?.phases?.length ? (
        <View style={{ marginTop: 16 }}>
          {script.phases.map((phase: any) => (
            <View key={phase.name} style={styles.phaseCard}>
              <Text style={styles.phaseTitle}>{phase.name}</Text>
              <Text style={styles.phaseText}>{phase.script_text}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F1E8',
    padding: 24
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1B3A5C'
  },
  subtitle: {
    color: '#4B5563',
    marginTop: 8
  },
  card: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginTop: 16
  },
  primaryButton: {
    backgroundColor: '#2C7A7B',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 12
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600'
  },
  secondaryButton: {
    marginTop: 10,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CBD5F5',
    alignItems: 'center'
  },
  secondaryButtonText: {
    color: '#1B3A5C'
  },
  error: {
    color: '#DC2626'
  },
  phaseCard: {
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 12,
    marginBottom: 12
  },
  phaseTitle: {
    fontWeight: '600',
    color: '#1B3A5C'
  },
  phaseText: {
    marginTop: 8,
    color: '#4B5563'
  },
  resourceCard: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    padding: 10,
    marginTop: 8
  },
  resourceTitle: {
    fontWeight: '600',
    color: '#1B3A5C'
  }
});
