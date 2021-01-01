import React, { useEffect, useMemo, useState } from "react";
import { View, StyleSheet, Text, Dimensions } from "react-native";
import {
  PanGestureHandler,
  PanGestureHandlerGestureEvent,
} from "react-native-gesture-handler";
import Animated, {
  Extrapolate,
  useAnimatedGestureHandler,
  useSharedValue,
  withSpring,
  useAnimatedStyle,
  interpolate,
} from "react-native-reanimated";
import { snapPoint } from "react-native-redash";

import Color, { COLOR_WIDTH } from "./Color";
import BackgroundGL from "./BackgroundGL";

import { Buffer } from "buffer";
global.Buffer = Buffer;

const { width, height } = Dimensions.get("window");

const colors = [
  {
    id: 0,
    start: "#00E0D3",
    end: "#00B4D4",
    emoji: "🛼",
  },
  {
    id: 1,
    start: "#FC727B",
    end: "#F468A0",
    emoji: "💖",
  },
  {
    id: 2,
    start: "#8289EA",
    end: "#7A6FC1",
    emoji: "🎉",
  },
  {
    id: 3,
    start: "#FEC7A3",
    end: "#FD9F9C",
    emoji: "🍑",
  },
  {
    id: 4,
    start: "#BA5BA5",
    end: "#BA9BA9",
    emoji: "🌸",
  },
  {
    id: 5,
    start: "#990022",
    end: "#ff0f",
    emoji: "🔥",
  },
];

const snapPoints = colors.map((_, i) => -i * COLOR_WIDTH);
const EMOJI_SIZE = 100;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  placeholder: {
    width: COLOR_WIDTH,
  },
  emoji: {
    fontSize: EMOJI_SIZE,
    position: "absolute",
    top: height / 4,
    left: width / 2 - EMOJI_SIZE / 2,
  },
});

const App = () => {
  const emojiScale = useSharedValue(1);

  const [colorSelection, setColorSelection] = useState({
    previous: colors[0],
    current: colors[0],
    position: { x: 0, y: 0 },
  });

  const style = useAnimatedStyle(() => {
    const scale = interpolate(
      emojiScale.value,
      [1, 0],
      [0, 1],
      Extrapolate.CLAMP
    );
    return {
      transform: [{ scale }],
    };
  });

  const translateX = useSharedValue(0);

  const onGestureEvent = useAnimatedGestureHandler<
    PanGestureHandlerGestureEvent,
    { x: number }
  >({
    onStart: (_, ctx) => {
      ctx.x = translateX.value;
    },
    onActive: ({ translationX }, { x }) => {
      translateX.value = x + translationX;
    },
    onEnd: ({ velocityX }) => {
      const dest = snapPoint(translateX.value, velocityX, snapPoints);
      translateX.value = withSpring(dest);
    },
  });

  return (
    <>
      <PanGestureHandler onGestureEvent={onGestureEvent}>
        <Animated.View style={styles.container}>
          <BackgroundGL colorSelection={colorSelection} />

          <Animated.Text style={[styles.emoji, style]}>
            {colorSelection.current.emoji}
          </Animated.Text>

          <View style={styles.placeholder} />

          {colors.map((color, index) => {
            return (
              <Color
                color={color}
                key={index}
                index={index}
                translateX={translateX}
                onPress={(position) => {
                  translateX.value = withSpring(-index * COLOR_WIDTH);
                  setColorSelection({
                    position,
                    previous: colorSelection.current,
                    current: color,
                  });
                }}
                emojiScale={emojiScale}
              />
            );
          })}
        </Animated.View>
      </PanGestureHandler>
    </>
  );
};

export default App;
