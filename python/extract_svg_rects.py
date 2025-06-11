import xml.etree.ElementTree as ET

def extract_rects_by_class(svg_file_path):
    tree = ET.parse(svg_file_path)
    root = tree.getroot()
    
    rects_data = {}
    
    for rect in root.findall('.//rect'):
        class_name = rect.get('class')
        if class_name in ['st2', 'st3']:
            rects_data[class_name] = {
                'x': float(rect.get('x')),
                'y': float(rect.get('y')),
                'width': float(rect.get('width')),
                'height': float(rect.get('height'))
            }
    
    return rects_data

# Change this path to where your SVG file is located
svg_file_path = "C:/Users/mgomez/Desktop/canvas/assets/Pancartaconcuerdaencadaesquina-100x200.svg"

try:
    rects = extract_rects_by_class(svg_file_path)
    
    print("=== SVG Rectangle Data ===")
    for class_name, data in rects.items():
        print(f"\nRectangle '{class_name}':")
        print(f"  x: {data['x']}")
        print(f"  y: {data['y']}")
        print(f"  width: {data['width']}")
        print(f"  height: {data['height']}")
        print(f"  area: {data['width'] * data['height']:,.2f}")
        
except FileNotFoundError:
    print("SVG file not found. Please check the file path.")
except Exception as e:
    print(f"Error: {e}")