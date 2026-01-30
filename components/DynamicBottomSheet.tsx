import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetScrollView
} from "@gorhom/bottom-sheet";
import { useColorScheme } from "nativewind";
import React, { useCallback } from "react";

interface DynamicBottomSheetProps {
  bottomSheetRef: React.RefObject<BottomSheet | null>;
  snapPoints?: string[];
  initialSnapIndex?: number;
  children: React.ReactNode;
  handleClose?: () => void;
  enablePanDownToClose?: boolean;
  pressBehavior?: "close" | "none";
  animationConfig?: { duration: number };
  props?: any;
}

const DynamicBottomSheet = ({
  bottomSheetRef,
  snapPoints = ["25%", "50%", "75%", "100%"],
  initialSnapIndex = 4,
  children,
  enablePanDownToClose = false,
  pressBehavior = "close",
  animationConfig = { duration: 300 },
  props,
}: DynamicBottomSheetProps) => {
  const { colorScheme } = useColorScheme();

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
        pressBehavior={pressBehavior}
      />
    ),
    [pressBehavior],
  );

  return (
    <BottomSheet
      ref={bottomSheetRef}
      snapPoints={snapPoints}
      index={initialSnapIndex}
      backdropComponent={renderBackdrop}
      enablePanDownToClose={enablePanDownToClose}
      backgroundStyle={{
        backgroundColor: colorScheme === "dark" ? "#181818" : "#f3f4f6",
      }}
      handleIndicatorStyle={{
        backgroundColor: colorScheme === "dark" ? "#9ca3af" : "#6b7280",
      }}
      animationConfigs={animationConfig}
      {...props}
    >
      <BottomSheetScrollView style={{ padding: 16 }}>
        {children}
      </BottomSheetScrollView>
    </BottomSheet>
  );
};

export default DynamicBottomSheet;
