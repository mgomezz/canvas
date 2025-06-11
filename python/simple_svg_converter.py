import xml.etree.ElementTree as ET

# UPDATE THESE VALUES:
SVG_FILE_PATH = r"C:\Users\mgomez\Desktop\canvas\python\Pancartaconcuerdaencadaesquina-100x200.svg"  # Change this to your file path
SCALE_FACTOR = 1000  # Change this: 1000 for mm->m, 100 for cm->m, etc.

def extract_and_convert():
    try:
        tree = ET.parse(SVG_FILE_PATH)
        root = tree.getroot()
        
        print(f"Processing: {SVG_FILE_PATH}")
        print(f"Scale factor: {SCALE_FACTOR} SVG units = 1 meter")
        print("-" * 50)
        
        for rect in root.findall('.//rect'):
            class_name = rect.get('class')
            if class_name in ['st2', 'st3']:
                width = float(rect.get('width'))
                height = float(rect.get('height'))
                
                width_m = width / SCALE_FACTOR
                height_m = height / SCALE_FACTOR
                area_m2 = width_m * height_m
                
                print(f"\nRectangle '{class_name}':")
                print(f"  Original: {width:.2f} x {height:.2f} SVG units")
                print(f"  Meters: {width_m:.6f} x {height_m:.6f} m")
                print(f"  Area: {area_m2:.6f} m²")
                
                if width_m < 1:
                    print(f"  In mm: {width_m*1000:.1f} x {height_m*1000:.1f} mm")
                
    except FileNotFoundError:
        print(f"File not found: {SVG_FILE_PATH}")
        print("Please check the file path.")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    extract_and_convert()