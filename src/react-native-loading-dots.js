import React, { useState, useEffect, useRef } from "react";
import { StyleSheet, Animated, Easing } from "react-native";

const defaultColors = ["#4dabf7", "#3bc9db", "#38d9a9", "#69db7c"];

function LoadingDots({
  dots = 4,
  colors = defaultColors,
  size = 20,
  bounceHeight = 20,
  borderRadius,
  components = null,
}) {
  const [animations, setAnimations] = useState([]);
  const [reverse, setReverse] = useState(false);
  const opacity = useRef(new Animated.Value(0)).current;
  const reverseRef = useRef(reverse);

  // create animated values once
  useEffect(() => {
    const count = components?.length ?? dots;
    setAnimations(Array.from({ length: count }, () => new Animated.Value(0)));
  }, [dots, components]);

  // fade in
  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      easing: Easing.ease,
      useNativeDriver: true,
      duration: 300,
    }).start();
  }, []);

  const floatAnimation = (node, reverseY, delay) =>
    Animated.sequence([
      Animated.timing(node, {
        toValue: reverseY ? bounceHeight : -bounceHeight,
        easing: Easing.bezier(0.41, -0.15, 0.56, 1.21),
        delay,
        useNativeDriver: true,
        duration: 300,
      }),
      Animated.timing(node, {
        toValue: reverseY ? -bounceHeight : bounceHeight,
        easing: Easing.bezier(0.41, -0.15, 0.56, 1.21),
        delay,
        useNativeDriver: true,
        duration: 300,
      }),
      Animated.timing(node, {
        toValue: 0,
        delay,
        useNativeDriver: true,
        duration: 300,
      }),
    ]);

  useEffect(() => {
    if (animations.length === 0) return;

    const runAnimation = () => {
      Animated.parallel(
        animations.map((node, i) =>
          floatAnimation(node, reverseRef.current, i * 100)
        )
      ).start(() => {
        // ⚡ defer state update to avoid React 19 "useInsertionEffect" warning
        setTimeout(() => {
          reverseRef.current = !reverseRef.current;
          setReverse(reverseRef.current);
        }, 0);
      });
    };

    runAnimation();
  }, [animations, reverse]);

  return (
    <Animated.View style={[styles.loading, { opacity }]}>
      {animations.map((anim, i) => {
        const style = [{ transform: [{ translateY: anim }] }];
        return components ? (
          <Animated.View key={i} style={style}>
            {components[i]}
          </Animated.View>
        ) : (
          <Animated.View
            key={i}
            style={[
              {
                width: size,
                height: size,
                borderRadius: borderRadius || size / 2,
                backgroundColor: colors[i] || "#4dabf7",
              },
              ...style,
            ]}
          />
        );
      })}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  loading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
});

export default LoadingDots;
