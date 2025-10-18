import { useState } from "react";
import { Animated, Image, View } from "react-native";
import BootSplash from "react-native-bootsplash";

type Props = {
  onAnimationEnd: () => void;
};

const AnimatedBootSplash = ({ onAnimationEnd }: Props) => {
  const [opacity] = useState(() => new Animated.Value(1));

  const { container, logo } = BootSplash.useHideAnimation({
    manifest: require("../assets/bootsplash/manifest.json"),
    logo: require("../assets/bootsplash/logo.png"),
    statusBarTranslucent: true,
    navigationBarTranslucent: false,

    animate: () => {
      Animated.timing(opacity, {
        useNativeDriver: true,
        toValue: 0,
        duration: 500,
      }).start(() => {
        onAnimationEnd();
      });
    },
  });

  return (
    <Animated.View {...container} style={[container.style, { opacity }]}>
      <Image {...logo} />
    </Animated.View>
  );
};

const SplashScreeen = () => {
  const [visible, setVisible] = useState(true);

  return (
    <View style={{ flex: 1 }}>
      {visible && (
        <AnimatedBootSplash
          onAnimationEnd={() => {
            setVisible(false);
          }}
        />
      )}
    </View>
  );
};

export default SplashScreeen;
