# If SVG units are in centimeters (100 cm = 1 meter)
scale_factor = 100

print("=== CONVERSION: CM TO METERS ===")
print(f"st3 (Bleed margin): {st3_width/scale_factor:.6f}m x {st3_height/scale_factor:.6f}m")
print(f"st2 (Safety area): {st2_width/scale_factor:.6f}m x {st2_height/scale_factor:.6f}m")