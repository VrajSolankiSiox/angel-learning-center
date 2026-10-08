import React from "react";
import { View, Text, Svg, Line, StyleSheet } from "@react-pdf/renderer";

const box = StyleSheet.create({
  root: {
    width: 10,
    height: 10,
    borderWidth: 0.85,
    borderColor: "#000",
    marginRight: 6,
    marginTop: 1,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  checked: {
    backgroundColor: "#000",
    borderColor: "#000",
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 6,
    paddingRight: 4,
  },
});

/**
 * Vector tick drawn with SVG lines (not a font glyph).
 * Renders reliably in @react-pdf/renderer across standard PDF viewers.
 */
export function PdfCheckMark({ color = "#FFFFFF", size = 10 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 10 10">
      <Line
        x1={1.4}
        y1={5.3}
        x2={3.9}
        y2={7.8}
        stroke={color}
        strokeWidth={1.65}
        strokeLinecap="round"
      />
      <Line
        x1={3.9}
        y1={7.8}
        x2={8.6}
        y2={2.1}
        stroke={color}
        strokeWidth={1.65}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function PdfCheckboxBox({ checked, size = 10, style }) {
  const yes = !!checked;
  return (
    <View style={[box.root, { width: size, height: size }, yes ? box.checked : null, style]}>
      {yes ? <PdfCheckMark color="#FFFFFF" size={size - 1} /> : null}
    </View>
  );
}

export function PdfCheckboxRow({ checked, children, labelStyle, rowStyle }) {
  return (
    <View style={[box.row, rowStyle]} wrap={false}>
      <PdfCheckboxBox checked={checked} />
      <Text style={labelStyle}>{children}</Text>
    </View>
  );
}
