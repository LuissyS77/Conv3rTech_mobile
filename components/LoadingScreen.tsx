import { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Easing, StyleSheet, Text, View } from 'react-native';
import { AppColors } from '@/constants/theme';

type Props = {
  onDone?: () => void;
};

export default function LoadingScreen({ onDone }: Props) {
  const progress = useRef(new Animated.Value(0)).current;
  const caretOpacity = useRef(new Animated.Value(1)).current;
  const [typedCount, setTypedCount] = useState(0);
  const full = 'Conv3rTechh';
  const [progressNum, setProgressNum] = useState(0);
  const labels = ['Conectando…', 'Descargando datos…', 'Procesando…', 'Aplicando cambios…', 'Finalizando…'];

  useEffect(() => {
    Animated.timing(progress, {
      toValue: 1,
      duration: 2800,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: false,
    }).start(({ finished }) => {
      setTypedCount(full.length);
      if (finished && onDone) onDone();
    });
  }, [progress, onDone]);

  useEffect(() => {
    const id = progress.addListener(({ value }) => {
      const next = Math.min(full.length, Math.floor(value * full.length));
      setTypedCount(next);
      setProgressNum(value);
    });
    return () => progress.removeListener(id);
  }, [progress]);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(caretOpacity, { toValue: 0, duration: 500, useNativeDriver: false }),
        Animated.timing(caretOpacity, { toValue: 1, duration: 500, useNativeDriver: false }),
      ])
    ).start();
  }, [caretOpacity]);

  const width = Dimensions.get('window').width;
  const barWidth = width * 0.8;
  const animatedWidth = progress.interpolate({ inputRange: [0, 1], outputRange: [0, barWidth] });
  const stageIndex = Math.min(labels.length - 1, Math.floor(progressNum * labels.length));
  const statusText = labels[stageIndex];

  return (
    <View style={styles.container}>
      <View style={styles.center}>
        <View style={styles.logoRow}>
          <Text style={styles.logoText}>
            {full.slice(0, typedCount).split('').map((ch, i) => (
              <Text key={i} style={ch === '3' ? styles.logoAccent : undefined}>{ch}</Text>
            ))}
          </Text>
          <Animated.Text style={[styles.caret, { opacity: caretOpacity }]}>|</Animated.Text>
        </View>
      </View>
      <View style={styles.bottom}>
        <Text style={styles.syncText}>{statusText}</Text>
        <View style={[styles.track, { width: barWidth }]}> 
          <Animated.View style={[styles.fill, { width: animatedWidth }]} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: AppColors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  logoRow: { flexDirection: 'row', alignItems: 'center' },
  bottom: { alignItems: 'center', paddingBottom: 24 },
  logoText: { color: AppColors.textPrimary, fontSize: 32, fontWeight: '700' },
  logoAccent: { color: AppColors.gold },
  caret: { color: AppColors.gold, fontSize: 32, fontWeight: '700', marginLeft: 4 },
  syncText: { color: AppColors.textSecondary, marginBottom: 8 },
  track: { height: 6, backgroundColor: AppColors.border, borderRadius: 3, overflow: 'hidden' },
  fill: { height: 6, backgroundColor: AppColors.gold },
});