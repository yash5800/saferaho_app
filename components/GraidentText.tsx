import MaskedView from "@react-native-masked-view/masked-view";
import { Text, TextProps } from "react-native";
import LinearGradient from "react-native-linear-gradient";

interface GradientTextProps extends TextProps {
  colors: string[];
}

const GradientText = ({ colors, ...props }: GradientTextProps) => {
  return (
    <MaskedView maskElement={<Text {...props} />}>
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <Text {...props} style={[props.style, { opacity: 0 }]} />
      </LinearGradient>
    </MaskedView>
  );
};

export default GradientText;
