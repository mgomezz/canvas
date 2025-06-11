import xml.etree.ElementTree as ET
import os

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

def convert_to_meters(svg_units, scale_factor):
    """
    Convert SVG units to meters
    scale_factor: how many SVG units equal 1 meter
    """
    return svg_units / scale_factor

def main():
    # Get the SVG file path from user
    print("=== SVG Rectangle to Meters Converter ===")
    print()
    
    svg_file_path = input("Enter the path to your SVG file: ").strip()
    
    # Remove quotes if user added them
    svg_file_path = svg_file_path.strip('"').strip("'")
    
    # Check if file exists
    if not os.path.exists(svg_file_path):
        print(f"Error: File '{svg_file_path}' not found.")
        print("Please check the file path and try again.")
        return
    
    try:
        # Extract rectangle data
        rects = extract_rects_by_class(svg_file_path)
        
        if not rects:
            print("No rectangles with classes 'st2' or 'st3' found in the SVG file.")
            return
        
        print("\n=== SVG Rectangle Data (Original Units) ===")
        for class_name, data in rects.items():
            print(f"\nRectangle '{class_name}':")
            print(f"  Position: ({data['x']:.2f}, {data['y']:.2f})")
            print(f"  Width: {data['width']:.2f} SVG units")
            print(f"  Height: {data['height']:.2f} SVG units")
            print(f"  Area: {data['width'] * data['height']:,.2f} SVG units²")
        
        print("\n" + "="*50)
        print("CONVERSION TO METERS")
        print("="*50)
        
        # Common conversion scenarios
        conversion_options = {
            "1": {
                "name": "Points to Meters (1pt = 0.000352778m)",
                "factor": 1 / 0.000352778
            },
            "2": {
                "name": "Pixels to Meters (96 DPI, 1px ≈ 0.000264583m)",
                "factor": 1 / 0.000264583
            },
            "3": {
                "name": "Millimeters to Meters (1000mm = 1m)",
                "factor": 1000
            },
            "4": {
                "name": "Centimeters to Meters (100cm = 1m)",
                "factor": 100
            },
            "5": {
                "name": "Inches to Meters (39.3701 inches = 1m)",
                "factor": 39.3701
            },
            "6": {
                "name": "Custom scale factor",
                "factor": None
            }
        }
        
        print("\nSelect conversion type:")
        for key, option in conversion_options.items():
            print(f"{key}. {option['name']}")
        
        choice = input("\nEnter your choice (1-6): ").strip()
        
        if choice in conversion_options:
            if choice == "6":
                try:
                    scale_factor = float(input("Enter scale factor (how many SVG units = 1 meter): "))
                    conversion_name = f"Custom scale (1 meter = {scale_factor} SVG units)"
                except ValueError:
                    print("Invalid scale factor. Using default 1000 (mm to m)")
                    scale_factor = 1000
                    conversion_name = "Millimeters to Meters (default)"
            else:
                scale_factor = conversion_options[choice]["factor"]
                conversion_name = conversion_options[choice]["name"]
            
            print(f"\n=== CONVERTED TO METERS ===")
            print(f"Using: {conversion_name}")
            print("-" * 40)
            
            for class_name, data in rects.items():
                width_m = convert_to_meters(data['width'], scale_factor)
                height_m = convert_to_meters(data['height'], scale_factor)
                area_m2 = width_m * height_m
                
                print(f"\nRectangle '{class_name}':")
                print(f"  Width: {width_m:.6f} meters")
                print(f"  Height: {height_m:.6f} meters")
                print(f"  Area: {area_m2:.6f} m²")
                
                # Also show in more readable units if very small
                if width_m < 1:
                    print(f"  Width: {width_m * 1000:.3f} mm ({width_m * 100:.4f} cm)")
                    print(f"  Height: {height_m * 1000:.3f} mm ({height_m * 100:.4f} cm)")
                
                if area_m2 < 1:
                    if area_m2 < 0.01:  # Less than 1 cm²
                        print(f"  Area: {area_m2 * 1000000:.3f} mm²")
                    else:
                        print(f"  Area: {area_m2 * 10000:.3f} cm²")
        else:
            print("Invalid choice. Please run the script again.")
            
    except ET.ParseError as e:
        print(f"Error parsing SVG file: {e}")
        print("Please make sure the file is a valid SVG.")
    except Exception as e:
        print(f"Error processing SVG file: {e}")

if __name__ == "__main__":
    main()