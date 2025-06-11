# Your extracted measurements
st3_width = 5896.06  # SVG units
st3_height = 3061.42  # SVG units
st2_width = 5669.29   # SVG units  
st2_height = 2834.65  # SVG units

# If SVG units are in millimeters (1000 mm = 1 meter)
scale_factor = 1000

print("=== CONVERSION: MM TO METERS ===")
print(f"st3 (Bleed margin): {st3_width/scale_factor:.6f}m x {st3_height/scale_factor:.6f}m")
print(f"st2 (Safety area): {st2_width/scale_factor:.6f}m x {st2_height/scale_factor:.6f}m")

# Areas
print(f"\nAreas:")
print(f"st3: {(st3_width * st3_height)/(scale_factor**2):.6f} m²")
print(f"st2: {(st2_width * st2_height)/(scale_factor**2):.6f} m²")